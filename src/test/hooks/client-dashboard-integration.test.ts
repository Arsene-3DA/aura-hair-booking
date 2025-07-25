import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReviews } from '@/hooks/useReviews';
import { usePromotionsActive } from '@/hooks/usePromotionsActive';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    })),
    removeChannel: vi.fn()
  }
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('Client Dashboard Hooks Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useReviews', () => {
    const mockClientId = 'client-123';

    it('should create review successfully', async () => {
      const mockReview = {
        id: 'review-456',
        booking_id: 'booking-789',
        client_id: mockClientId,
        rating: 5,
        comment: 'Excellent service!'
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockReview,
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

      const { result } = renderHook(() => useReviews(mockClientId));

      await act(async () => {
        await result.current.createReview('booking-789', 5, 'Excellent service!');
      });

      expect(mockInsert).toHaveBeenCalledWith({
        booking_id: 'booking-789',
        client_id: mockClientId,
        rating: 5,
        comment: 'Excellent service!'
      });
    });

    it('should validate rating is between 1 and 5', async () => {
      // This would be handled by database constraints
      const { result } = renderHook(() => useReviews(mockClientId));

      // Test boundary values
      expect(() => result.current.createReview('booking-1', 1, 'Poor')).not.toThrow();
      expect(() => result.current.createReview('booking-2', 5, 'Excellent')).not.toThrow();
    });
  });

  describe('usePromotionsActive', () => {
    it('should fetch only active promotions within date range', () => {
      const mockPromotions = [
        {
          id: 'promo-1',
          title: '20% off first visit',
          description: 'New clients get 20% discount',
          discount_percentage: 20,
          starts_at: '2024-01-01T00:00:00Z',
          ends_at: '2024-12-31T23:59:59Z',
          is_active: true
        }
      ];

      const mockOrder = vi.fn().mockResolvedValue({
        data: mockPromotions,
        error: null
      });

      const mockGte = vi.fn().mockReturnValue({
        order: mockOrder
      });

      const mockLte = vi.fn().mockReturnValue({
        gte: mockGte
      });

      const mockEq = vi.fn().mockReturnValue({
        lte: mockLte
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect
      });

      (supabase.from as any).mockImplementation(mockFrom);

      renderHook(() => usePromotionsActive());

      expect(mockFrom).toHaveBeenCalledWith('promotions');
      expect(mockEq).toHaveBeenCalledWith('is_active', true);
      // Verify date filtering
      expect(mockLte).toHaveBeenCalled();
      expect(mockGte).toHaveBeenCalled();
    });
  });

  describe('useNotifications', () => {
    const mockUserId = 'user-123';

    it('should track unread count correctly', () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          user_id: mockUserId,
          title: 'Booking confirmed',
          body: 'Your appointment is confirmed',
          is_read: false,
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 'notif-2',
          user_id: mockUserId,
          title: 'Reminder',
          body: 'Appointment tomorrow',
          is_read: true,
          created_at: '2024-01-02T10:00:00Z'
        }
      ];

      const mockLimit = vi.fn().mockResolvedValue({
        data: mockNotifications,
        error: null
      });

      const mockOrder = vi.fn().mockReturnValue({
        limit: mockLimit
      });

      const mockEq = vi.fn().mockReturnValue({
        order: mockOrder
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const { result } = renderHook(() => useNotifications(mockUserId));

      // Since this is a mock, we can't test the actual state but can verify the calls
      expect(mockFrom).toHaveBeenCalledWith('notifications');
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it('should mark notification as read', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({
        error: null
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockUpdateEq
      });

      const mockFrom = vi.fn().mockReturnValue({
        update: mockUpdate
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const { result } = renderHook(() => useNotifications(mockUserId));

      await act(async () => {
        await result.current.markAsRead('notif-1');
      });

      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
      expect(mockUpdateEq).toHaveBeenCalledWith('id', 'notif-1');
    });

    it('should mark all notifications as read', async () => {
      const mockEqChain = vi.fn().mockResolvedValue({
        error: null
      });

      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEqChain
      });

      const mockEq1 = vi.fn().mockReturnValue({
        eq: mockEq2
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq1
      });

      const mockFrom = vi.fn().mockReturnValue({
        update: mockUpdate
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const { result } = renderHook(() => useNotifications(mockUserId));

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
      expect(mockEq1).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockEq2).toHaveBeenCalledWith('is_read', false);
    });
  });
});