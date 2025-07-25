import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpcomingBookings } from '@/hooks/useUpcomingBookings';
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

describe('useUpcomingBookings', () => {
  const mockClientId = 'client-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter bookings with status pending or confirmed', () => {
    const mockBookings = [
      {
        id: 'booking-1',
        service: 'Coupe femme',
        scheduled_at: '2024-02-01T10:00:00Z',
        status: 'pending',
        stylist_id: 'stylist-1'
      },
      {
        id: 'booking-2',
        service: 'Coloration',
        scheduled_at: '2024-02-02T14:00:00Z',
        status: 'confirmed',
        stylist_id: 'stylist-2'
      }
    ];

    const mockLimit = vi.fn().mockResolvedValue({
      data: mockBookings,
      error: null
    });

    const mockOrder = vi.fn().mockReturnValue({
      limit: mockLimit
    });

    const mockGte = vi.fn().mockReturnValue({
      order: mockOrder
    });

    const mockIn = vi.fn().mockReturnValue({
      gte: mockGte
    });

    const mockEq = vi.fn().mockReturnValue({
      in: mockIn
    });

    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEq
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: mockSelect
    });

    (supabase.from as any).mockImplementation(mockFrom);

    renderHook(() => useUpcomingBookings(mockClientId));

    // Verify the correct filters are applied
    expect(mockFrom).toHaveBeenCalledWith('bookings');
    expect(mockEq).toHaveBeenCalledWith('client_id', mockClientId);
    expect(mockIn).toHaveBeenCalledWith('status', ['pending', 'confirmed']);
  });

  it('should fetch only future bookings', () => {
    const mockLimit = vi.fn().mockResolvedValue({
      data: [],
      error: null
    });

    const mockOrder = vi.fn().mockReturnValue({
      limit: mockLimit
    });

    const mockGte = vi.fn().mockReturnValue({
      order: mockOrder
    });

    const mockIn = vi.fn().mockReturnValue({
      gte: mockGte
    });

    const mockEq = vi.fn().mockReturnValue({
      in: mockIn
    });

    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEq
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: mockSelect
    });

    (supabase.from as any).mockImplementation(mockFrom);

    renderHook(() => useUpcomingBookings(mockClientId));

    // Verify future date filtering
    expect(mockGte).toHaveBeenCalled();
    const gteCall = mockGte.mock.calls[0];
    expect(gteCall[0]).toBe('scheduled_at');
    // Verify that we're filtering for future dates (the exact timestamp will vary)
    expect(gteCall[1]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should limit results to 3 upcoming bookings', () => {
    const mockLimit = vi.fn().mockResolvedValue({
      data: [],
      error: null
    });

    const mockOrder = vi.fn().mockReturnValue({
      limit: mockLimit
    });

    const mockGte = vi.fn().mockReturnValue({
      order: mockOrder
    });

    const mockIn = vi.fn().mockReturnValue({
      gte: mockGte
    });

    const mockEq = vi.fn().mockReturnValue({
      in: mockIn
    });

    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEq
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: mockSelect
    });

    (supabase.from as any).mockImplementation(mockFrom);

    renderHook(() => useUpcomingBookings(mockClientId));

    // Verify limit is applied
    expect(mockLimit).toHaveBeenCalledWith(3);
  });

  it('should handle cancel booking functionality', async () => {
    const mockBookings = [
      {
        id: 'booking-1',
        service: 'Coupe femme',
        scheduled_at: '2024-02-01T10:00:00Z',
        status: 'pending',
        stylist_id: 'stylist-1'
      }
    ];

    // Mock initial fetch
    const mockLimit = vi.fn().mockResolvedValue({
      data: mockBookings,
      error: null
    });

    const mockOrder = vi.fn().mockReturnValue({
      limit: mockLimit
    });

    const mockGte = vi.fn().mockReturnValue({
      order: mockOrder
    });

    const mockIn = vi.fn().mockReturnValue({
      gte: mockGte
    });

    const mockEq = vi.fn().mockReturnValue({
      in: mockIn
    });

    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEq
    });

    // Mock cancel booking
    const mockUpdateEq = vi.fn().mockResolvedValue({
      error: null
    });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: mockUpdateEq
    });

    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        select: mockSelect
      })
      .mockReturnValueOnce({
        update: mockUpdate
      });

    (supabase.from as any).mockImplementation(mockFrom);

    const { result } = renderHook(() => useUpcomingBookings(mockClientId));

    // Test cancel booking
    await act(async () => {
      await result.current.cancelBooking('booking-1');
    });

    expect(mockUpdate).toHaveBeenCalledWith({ status: 'declined' });
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'booking-1');
  });
});