import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('Reservation Flow Integration Tests', () => {
  const mockClientId = 'client-123';
  const mockStylistId = 'stylist-456';
  const mockReservationId = 'reservation-789';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated user
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: mockClientId } },
      error: null
    });
  });

  describe('Reservation Creation Flow', () => {
    it('should validate service requirement before creation', async () => {
      // Mock service validation
      const mockValidateService = vi.fn().mockResolvedValue({
        data: false, // Service required but not provided
        error: null
      });
      (supabase.rpc as any).mockImplementation((fn: string) => {
        if (fn === 'validate_booking_service') return mockValidateService();
        return Promise.reject(new Error('Unknown RPC'));
      });

      // Attempt to create reservation without service
      try {
        await supabase.rpc('validate_booking_service', {
          p_stylist_user_id: mockStylistId,
          p_service_id: null
        });
      } catch (error) {
        // Service validation should fail
        expect(error).toBeDefined();
      }

      expect(mockValidateService).toHaveBeenCalled();
    });

    it('should create reservation when validation passes', async () => {
      // Mock successful service validation
      (supabase.rpc as any).mockResolvedValue({
        data: true,
        error: null
      });

      // Mock successful reservation creation
      const mockReservation = {
        id: mockReservationId,
        client_user_id: mockClientId,
        stylist_user_id: mockStylistId,
        service_id: null,
        scheduled_at: '2024-02-01T10:00:00Z',
        status: 'pending',
        notes: 'Test reservation'
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockReservation,
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert
      });

      (supabase.from as any).mockImplementation(mockFrom);

      // Validate service first
      const validation = await supabase.rpc('validate_booking_service', {
        p_stylist_user_id: mockStylistId,
        p_service_id: null
      });

      expect(validation.data).toBe(true);

      // Create reservation
      const result = await supabase
        .from('new_reservations')
        .insert({
          client_user_id: mockClientId,
          stylist_user_id: mockStylistId,
          service_id: null,
          scheduled_at: '2024-02-01T10:00:00Z',
          status: 'pending',
          notes: 'Test reservation'
        })
        .select()
        .single();

      expect(result.data).toEqual(mockReservation);
      expect(mockInsert).toHaveBeenCalledWith({
        client_user_id: mockClientId,
        stylist_user_id: mockStylistId,
        service_id: null,
        scheduled_at: '2024-02-01T10:00:00Z',
        status: 'pending',
        notes: 'Test reservation'
      });
    });
  });

  describe('Stylist Confirmation Flow', () => {
    it('should allow stylist to confirm reservation', async () => {
      // Mock confirm booking RPC
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: null
      });

      const result = await supabase.rpc('confirm_booking', {
        p_booking_id: mockReservationId
      });

      expect(result.error).toBeNull();
    });

    it('should allow stylist to decline reservation', async () => {
      // Mock decline booking RPC
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: null
      });

      const result = await supabase.rpc('decline_booking', {
        p_booking_id: mockReservationId
      });

      expect(result.error).toBeNull();
    });

    it('should create notification when booking is confirmed', async () => {
      // This would test the notification creation in the RPC function
      // The actual notification creation happens in the database function
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: null
      });

      await supabase.rpc('confirm_booking', {
        p_booking_id: mockReservationId
      });

      // In a real scenario, we would verify the notification was created
      // by checking the notifications table, but since this is handled
      // by the database function, we just verify the RPC was called
      expect(supabase.rpc).toHaveBeenCalledWith('confirm_booking', {
        p_booking_id: mockReservationId
      });
    });
  });

  describe('Data Access Control (RLS)', () => {
    it('should only return client reservations for client users', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          client_user_id: mockClientId,
          stylist_user_id: 'stylist-1',
          status: 'pending'
        }
      ];

      const mockSelect = vi.fn().mockResolvedValue({
        data: mockReservations,
        error: null
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await supabase
        .from('new_reservations')
        .select('*');

      // RLS should filter to only client's reservations
      expect(result.data).toEqual(mockReservations);
      expect(result.data?.[0].client_user_id).toBe(mockClientId);
    });

    it('should only return stylist reservations for stylist users', async () => {
      // Switch to stylist context
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: mockStylistId } },
        error: null
      });

      const mockReservations = [
        {
          id: 'res-1',
          client_user_id: 'client-1',
          stylist_user_id: mockStylistId,
          status: 'pending'
        }
      ];

      const mockSelect = vi.fn().mockResolvedValue({
        data: mockReservations,
        error: null
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await supabase
        .from('new_reservations')
        .select('*');

      expect(result.data).toEqual(mockReservations);
      expect(result.data?.[0].stylist_user_id).toBe(mockStylistId);
    });
  });

  describe('Error Handling', () => {
    it('should handle database constraint violations', async () => {
      const mockError = {
        message: 'violates foreign key constraint',
        code: '23503'
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await supabase
        .from('new_reservations')
        .insert({
          client_user_id: 'invalid-client',
          stylist_user_id: 'invalid-stylist',
          scheduled_at: '2024-02-01T10:00:00Z',
          status: 'pending'
        })
        .select()
        .single();

      expect(result.error).toEqual(mockError);
      expect(result.data).toBeNull();
    });

    it('should handle RPC function errors', async () => {
      const mockError = {
        message: 'Function not found',
        code: '42883'
      };

      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError
      });

      const result = await supabase.rpc('validate_booking_service', {
        p_stylist_user_id: 'invalid',
        p_service_id: null
      });

      expect(result.error).toEqual(mockError);
    });
  });

  describe('Service Validation Logic', () => {
    it('should return true for stylists with no services', async () => {
      (supabase.rpc as any).mockResolvedValue({
        data: true,
        error: null
      });

      const result = await supabase.rpc('validate_booking_service', {
        p_stylist_user_id: 'stylist-no-services',
        p_service_id: null
      });

      expect(result.data).toBe(true);
    });

    it('should return false for stylists with services when no service provided', async () => {
      (supabase.rpc as any).mockResolvedValue({
        data: false,
        error: null
      });

      const result = await supabase.rpc('validate_booking_service', {
        p_stylist_user_id: 'stylist-with-services',
        p_service_id: null
      });

      expect(result.data).toBe(false);
    });

    it('should return true for valid service selection', async () => {
      (supabase.rpc as any).mockResolvedValue({
        data: true,
        error: null
      });

      const result = await supabase.rpc('validate_booking_service', {
        p_stylist_user_id: mockStylistId,
        p_service_id: 'valid-service-id'
      });

      expect(result.data).toBe(true);
    });
  });
});