import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuickReserve } from '@/hooks/useQuickReserve';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useQuickReserve', () => {
  const mockClientId = 'client-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create reservation and return booking id', async () => {
    const mockBooking = {
      id: 'booking-456',
      client_user_id: mockClientId,
      stylist_user_id: 'stylist-789',
      scheduled_at: '2024-02-01T10:00:00Z',
      status: 'pending'
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

    const { result } = renderHook(() => useQuickReserve(mockClientId));

    const reservationData = {
      stylist_id: 'stylist-789',
      service: 'Coupe femme',
      scheduled_at: '2024-02-01T10:00:00Z',
      comments: 'Test comment'
    };

    const booking = await result.current.createReservation(reservationData);

    expect(mockFrom).toHaveBeenCalledWith('new_reservations');
    expect(mockInsert).toHaveBeenCalledWith({
      client_user_id: mockClientId,
      stylist_user_id: 'stylist-789',
      service_id: null,
      scheduled_at: '2024-02-01T10:00:00Z',
      status: 'pending',
      notes: 'Test comment'
    });
    expect(booking).toEqual(mockBooking);
    expect(booking.id).toBe('booking-456');
  });

  it('should handle reservation creation errors', async () => {
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

    const { result } = renderHook(() => useQuickReserve(mockClientId));

    const reservationData = {
      stylist_id: 'stylist-789',
      service: 'Coupe femme',
      scheduled_at: '2024-02-01T10:00:00Z'
    };

    await expect(result.current.createReservation(reservationData)).rejects.toThrow();
  });

  it('should throw error when client ID is missing', async () => {
    const { result } = renderHook(() => useQuickReserve());

    const reservationData = {
      stylist_id: 'stylist-789',
      service: 'Coupe femme',
      scheduled_at: '2024-02-01T10:00:00Z'
    };

    await expect(result.current.createReservation(reservationData)).rejects.toThrow('Client ID required');
  });
});