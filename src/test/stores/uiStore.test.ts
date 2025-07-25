import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUIStore } from '@/stores/uiStore'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useUIStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.getState().closeAllModals()
    useUIStore.getState().setSidebarOpen(true)
    useUIStore.getState().setSidebarCollapsed(false)
  })

  it('has correct initial state', () => {
    const { result } = renderHook(() => useUIStore())
    
    expect(result.current.sidebarOpen).toBe(true)
    expect(result.current.sidebarCollapsed).toBe(false)
    expect(result.current.modals.booking).toBe(false)
    expect(result.current.notifications.email).toBe(true)
    expect(result.current.layout.compactMode).toBe(false)
  })

  it('toggles sidebar correctly', () => {
    const { result } = renderHook(() => useUIStore())
    
    act(() => {
      result.current.toggleSidebar()
    })
    
    expect(result.current.sidebarOpen).toBe(false)
  })

  it('opens and closes modals correctly', () => {
    const { result } = renderHook(() => useUIStore())
    
    act(() => {
      result.current.openModal('booking')
    })
    
    expect(result.current.modals.booking).toBe(true)
    
    act(() => {
      result.current.closeModal('booking')
    })
    
    expect(result.current.modals.booking).toBe(false)
  })

  it('closes all modals correctly', () => {
    const { result } = renderHook(() => useUIStore())
    
    act(() => {
      result.current.openModal('booking')
      result.current.openModal('userProfile')
    })
    
    expect(result.current.modals.booking).toBe(true)
    expect(result.current.modals.userProfile).toBe(true)
    
    act(() => {
      result.current.closeAllModals()
    })
    
    expect(result.current.modals.booking).toBe(false)
    expect(result.current.modals.userProfile).toBe(false)
  })

  it('updates notification preferences', () => {
    const { result } = renderHook(() => useUIStore())
    
    act(() => {
      result.current.updateNotificationPrefs({ email: false, sms: true })
    })
    
    expect(result.current.notifications.email).toBe(false)
    expect(result.current.notifications.sms).toBe(true)
    expect(result.current.notifications.push).toBe(true) // unchanged
  })

  it('updates layout preferences', () => {
    const { result } = renderHook(() => useUIStore())
    
    act(() => {
      result.current.updateLayoutPrefs({ compactMode: true, showAvatars: false })
    })
    
    expect(result.current.layout.compactMode).toBe(true)
    expect(result.current.layout.showAvatars).toBe(false)
    expect(result.current.layout.animationsEnabled).toBe(true) // unchanged
  })

  it('manages loading states correctly', () => {
    const { result } = renderHook(() => useUIStore())
    
    act(() => {
      result.current.setLoading('fetchUsers', true)
    })
    
    expect(result.current.loading.fetchUsers).toBe(true)
    
    act(() => {
      result.current.setLoading('fetchUsers', false)
    })
    
    expect(result.current.loading.fetchUsers).toBe(false)
  })
})