import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeToggle } from '@/components/ThemeToggle'

// Mock zustand store
vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    sidebarOpen: true,
    sidebarCollapsed: false,
    setSidebarOpen: vi.fn(),
    setSidebarCollapsed: vi.fn(),
    toggleSidebar: vi.fn(),
    modals: {},
    openModal: vi.fn(),
    closeModal: vi.fn(),
    closeAllModals: vi.fn(),
    notifications: { email: true, sms: false, push: true },
    updateNotificationPrefs: vi.fn(),
    layout: { compactMode: false, showAvatars: true, animationsEnabled: true },
    updateLayoutPrefs: vi.fn(),
    loading: {},
    setLoading: vi.fn(),
  })
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() }
  })
}))

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders theme toggle button', () => {
    const { getByRole } = render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    )

    const button = getByRole('button', { name: /changer le thème/i })
    expect(button).toBeInTheDocument()
  })

  it('opens dropdown menu when clicked', async () => {
    const user = userEvent.setup()
    
    const { getByRole, getByText } = render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    )

    const button = getByRole('button', { name: /changer le thème/i })
    await user.click(button)

    expect(getByText('Clair')).toBeInTheDocument()
    expect(getByText('Sombre')).toBeInTheDocument()
    expect(getByText('Système')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    const { getByRole } = render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    )

    const button = getByRole('button', { name: /changer le thème/i })
    expect(button).toHaveAttribute('aria-label', 'Changer le thème')
  })
})