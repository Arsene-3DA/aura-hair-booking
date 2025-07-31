import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
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

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock hook for new reservations system
const useNewReservations = () => {
  const createReservation = async (data: {
    stylist_user_id: string;
    service_id?: string;
    scheduled_at: string;
    notes?: string;
  }) => {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data: booking, error } = await supabase
      .from('new_reservations')
      .insert({
        client_user_id: userData.user?.id,
        stylist_user_id: data.stylist_user_id,
        service_id: data.service_id || null,
        scheduled_at: data.scheduled_at,
        status: 'pending',
        notes: data.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return booking;
  };

  const confirmReservation = async (bookingId: string) => {
    const { error } = await supabase.rpc('confirm_booking', {
      p_booking_id: bookingId
    });
    if (error) throw error;
  };

  const declineReservation = async (bookingId: string) => {
    const { error } = await supabase.rpc('decline_booking', {
      p_booking_id: bookingId
    });
    if (error) throw error;
  };

  const validateService = async (stylistUserId: string, serviceId?: string) => {
    const { data, error } = await supabase.rpc('validate_booking_service', {
      p_stylist_user_id: stylistUserId,
      p_service_id: serviceId || null
    });
    if (error) throw error;
    return data;
  };

  return {
    createReservation,
    confirmReservation,
    declineReservation,
    validateService
  };
};

describe('useNewReservations', () => {
  const mockUserId = 'user-123';
  const mockStylistId = 'stylist-456';
  const mockBookingId = 'booking-789';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth.getUser
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null
    });
  });

  it('should create reservation successfully', async () => {
    const mockBooking = {
      id: mockBookingId,
      client_user_id: mockUserId,
      stylist_user_id: mockStylistId,
      scheduled_at: '2024-02-01T10:00:00Z',
      status: 'pending',
      service_id: null,
      notes: 'Test reservation'
    };

    const mockSingle = vi.fn().mockResolvedValue({
      data: mockBooking,
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

    const { result } = renderHook(() => useNewReservations());

    const reservationData = {
      stylist_user_id: mockStylistId,
      scheduled_at: '2024-02-01T10:00:00Z',
      notes: 'Test reservation'
    };

    const booking = await result.current.createReservation(reservationData);

    expect(mockFrom).toHaveBeenCalledWith('new_reservations');
    expect(mockInsert).toHaveBeenCalledWith({
      client_user_id: mockUserId,
      stylist_user_id: mockStylistId,
      service_id: null,
      scheduled_at: '2024-02-01T10:00:00Z',
      status: 'pending',
      notes: 'Test reservation'
    });
    expect(booking).toEqual(mockBooking);
  });

  it('should confirm reservation using RPC', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: null
    });

    (supabase.rpc as any).mockImplementation(mockRpc);

    const { result } = renderHook(() => useNewReservations());

    await result.current.confirmReservation(mockBookingId);

    expect(mockRpc).toHaveBeenCalledWith('confirm_booking', {
      p_booking_id: mockBookingId
    });
  });

  it('should decline reservation using RPC', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: null
    });

    (supabase.rpc as any).mockImplementation(mockRpc);

    const { result } = renderHook(() => useNewReservations());

    await result.current.declineReservation(mockBookingId);

    expect(mockRpc).toHaveBeenCalledWith('decline_booking', {
      p_booking_id: mockBookingId
    });
  });

  it('should validate service requirement', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: true,
      error: null
    });

    (supabase.rpc as any).mockImplementation(mockRpc);

    const { result } = renderHook(() => useNewReservations());

    const isValid = await result.current.validateService(mockStylistId);

    expect(mockRpc).toHaveBeenCalledWith('validate_booking_service', {
      p_stylist_user_id: mockStylistId,
      p_service_id: null
    });
    expect(isValid).toBe(true);
  });

  it('should handle service validation failure', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: false,
      error: null
    });

    (supabase.rpc as any).mockImplementation(mockRpc);

    const { result } = renderHook(() => useNewReservations());

    const isValid = await result.current.validateService(mockStylistId, 'invalid-service');

    expect(isValid).toBe(false);
  });

  it('should handle creation errors', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
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

    const { result } = renderHook(() => useNewReservations());

    const reservationData = {
      stylist_user_id: mockStylistId,
      scheduled_at: '2024-02-01T10:00:00Z'
    };

    await expect(result.current.createReservation(reservationData)).rejects.toThrow();
  });

  it('should handle RPC errors', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'RPC error' }
    });

    (supabase.rpc as any).mockImplementation(mockRpc);

    const { result } = renderHook(() => useNewReservations());

    await expect(result.current.confirmReservation(mockBookingId)).rejects.toThrow();
  });
});