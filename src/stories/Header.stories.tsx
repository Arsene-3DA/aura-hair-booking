import type { Meta, StoryObj } from '@storybook/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '@/components/Header'

// Mock react-i18next
const mockT = (key: string) => key
const mockI18n = { changeLanguage: () => Promise.resolve() }

// Mock useRoleAuth hook
const mockUseRoleAuth = {
  user: { email: 'user@example.com' },
  userProfile: { full_name: 'John Doe', role: 'client' },
  isAuthenticated: true,
  signOut: () => Promise.resolve(),
}

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Unauthenticated: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Header with unauthenticated user showing login/signup buttons',
      },
    },
  },
}

export const AuthenticatedClient: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Header with authenticated client user showing user menu',
      },
    },
  },
}

export const AuthenticatedAdmin: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Header with authenticated admin user',
      },
    },
  },
}

export const DarkTheme: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Header in dark theme',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </div>
    ),
  ],
}