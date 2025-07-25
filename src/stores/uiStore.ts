import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  // Sidebar state
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  
  // Modal states
  modals: {
    booking: boolean
    userProfile: boolean
    settings: boolean
    [key: string]: boolean
  }
  openModal: (modalName: string) => void
  closeModal: (modalName: string) => void
  closeAllModals: () => void
  
  // Notification preferences
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  updateNotificationPrefs: (prefs: Partial<UIState['notifications']>) => void
  
  // Layout preferences
  layout: {
    compactMode: boolean
    showAvatars: boolean
    animationsEnabled: boolean
  }
  updateLayoutPrefs: (prefs: Partial<UIState['layout']>) => void
  
  // Loading states
  loading: {
    [key: string]: boolean
  }
  setLoading: (key: string, loading: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Sidebar state
      sidebarOpen: true,
      sidebarCollapsed: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      
      // Modal states
      modals: {
        booking: false,
        userProfile: false,
        settings: false,
      },
      openModal: (modalName) => 
        set(state => ({ 
          modals: { ...state.modals, [modalName]: true } 
        })),
      closeModal: (modalName) => 
        set(state => ({ 
          modals: { ...state.modals, [modalName]: false } 
        })),
      closeAllModals: () => 
        set(state => {
          const closedModals = Object.keys(state.modals).reduce(
            (acc, key) => ({ ...acc, [key]: false }), 
            { booking: false, userProfile: false, settings: false }
          )
          return { modals: closedModals }
        }),
      
      // Notification preferences
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      updateNotificationPrefs: (prefs) =>
        set(state => ({
          notifications: { ...state.notifications, ...prefs }
        })),
      
      // Layout preferences
      layout: {
        compactMode: false,
        showAvatars: true,
        animationsEnabled: true,
      },
      updateLayoutPrefs: (prefs) =>
        set(state => ({
          layout: { ...state.layout, ...prefs }
        })),
      
      // Loading states
      loading: {},
      setLoading: (key, loading) =>
        set(state => ({
          loading: { ...state.loading, [key]: loading }
        })),
    }),
    {
      name: 'beauty-salon-ui-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        notifications: state.notifications,
        layout: state.layout,
      }),
    }
  )
)