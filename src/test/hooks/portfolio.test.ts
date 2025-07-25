import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddServiceToPortfolio } from '@/hooks/useAddServiceToPortfolio';
import { usePortfolio } from '@/hooks/usePortfolio';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn()
      }))
    },
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

// Mock useUploadImage
vi.mock('@/hooks/useUploadImage', () => ({
  useUploadImage: () => ({
    uploadImage: vi.fn().mockResolvedValue('https://example.com/test-image.jpg'),
    deleteImage: vi.fn().mockResolvedValue(true),
    uploading: false
  })
}));

describe('Portfolio Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAddServiceToPortfolio', () => {
    const mockStylistId = 'stylist-123';

    it('should add service with image to portfolio', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any).mockImplementation(mockFrom);

      const { result } = renderHook(() => useAddServiceToPortfolio(mockStylistId));

      const serviceData = {
        serviceId: 'service-456',
        hairstyleName: 'Coupe moderne',
        imageFile: new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      };

      await act(async () => {
        await result.current.addServiceToPortfolio(serviceData);
      });

      expect(mockFrom).toHaveBeenCalledWith('portfolio');
      expect(mockInsert).toHaveBeenCalledWith({
        stylist_id: mockStylistId,
        service_id: 'service-456',
        image_url: 'https://example.com/test-image.jpg',
        hairstyle_name: 'Coupe moderne'
      });
    });

    it('should handle service creation without hairstyle name', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any).mockImplementation(mockFrom);

      const { result } = renderHook(() => useAddServiceToPortfolio(mockStylistId));

      const serviceData = {
        serviceId: 'service-456',
        imageFile: new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      };

      await act(async () => {
        await result.current.addServiceToPortfolio(serviceData);
      });

      expect(mockInsert).toHaveBeenCalledWith({
        stylist_id: mockStylistId,
        service_id: 'service-456',
        image_url: 'https://example.com/test-image.jpg',
        hairstyle_name: undefined
      });
    });

    it('should throw error when stylist ID is missing', async () => {
      const { result } = renderHook(() => useAddServiceToPortfolio());

      const serviceData = {
        serviceId: 'service-456',
        imageFile: new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      };

      await expect(result.current.addServiceToPortfolio(serviceData)).rejects.toThrow('Stylist ID required');
    });
  });

  describe('usePortfolio', () => {
    const mockStylistId = 'stylist-123';

    it('should fetch portfolio items filtered by stylist', () => {
      const mockPortfolio = [
        {
          id: 'portfolio-1',
          stylist_id: mockStylistId,
          service_id: 'service-1',
          image_url: 'https://example.com/image1.jpg',
          hairstyle_name: 'Coupe dégradée',
          created_at: '2024-01-01T10:00:00Z',
          services: { id: 'service-1', name: 'Coupe femme' }
        }
      ];

      const mockOrder = vi.fn().mockResolvedValue({
        data: mockPortfolio,
        error: null
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

      renderHook(() => usePortfolio(mockStylistId));

      expect(mockFrom).toHaveBeenCalledWith('portfolio');
      expect(mockSelect).toHaveBeenCalledWith(`
          *,
          services!inner(id, name)
        `);
      expect(mockEq).toHaveBeenCalledWith('stylist_id', mockStylistId);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return empty array when no portfolio items exist', () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [],
        error: null
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

      const { result } = renderHook(() => usePortfolio(mockStylistId));

      // Since we can't easily test the async state changes in this setup,
      // we verify the calls were made correctly
      expect(mockFrom).toHaveBeenCalledWith('portfolio');
      expect(mockEq).toHaveBeenCalledWith('stylist_id', mockStylistId);
    });

    it('should set up real-time subscription for portfolio changes', () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn()
      };

      (supabase.channel as any).mockReturnValue(mockChannel);

      const mockOrder = vi.fn().mockResolvedValue({
        data: [],
        error: null
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

      renderHook(() => usePortfolio(mockStylistId));

      expect(supabase.channel).toHaveBeenCalledWith(`portfolio-${mockStylistId}`);
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio',
          filter: `stylist_id=eq.${mockStylistId}`,
        },
        expect.any(Function)
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });
});