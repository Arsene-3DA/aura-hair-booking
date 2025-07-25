import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LanguageToggle } from '@/components/LanguageToggle'

// Mock react-i18next
const mockChangeLanguage = vi.fn()
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: mockChangeLanguage }
  })
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('LanguageToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders language toggle button', () => {
    const { getByRole } = render(
      <TestWrapper>
        <LanguageToggle />
      </TestWrapper>
    )

    const button = getByRole('button', { name: /changer la langue/i })
    expect(button).toBeInTheDocument()
  })

  it('opens dropdown menu when clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LanguageToggle />
      </TestWrapper>
    )

    const button = screen.getByRole('button', { name: /changer la langue/i })
    await user.click(button)

    expect(screen.getByText('🇫🇷 Français')).toBeInTheDocument()
    expect(screen.getByText('🇬🇧 English (bientôt)')).toBeInTheDocument()
  })

  it('changes language when French is selected', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LanguageToggle />
      </TestWrapper>
    )

    const button = screen.getByRole('button', { name: /changer la langue/i })
    await user.click(button)

    const frenchOption = screen.getByText('🇫🇷 Français')
    await user.click(frenchOption)

    expect(mockChangeLanguage).toHaveBeenCalledWith('fr')
  })

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <LanguageToggle />
      </TestWrapper>
    )

    const button = screen.getByRole('button', { name: /changer la langue/i })
    expect(button).toHaveAttribute('aria-label', 'Changer la langue')
  })
})