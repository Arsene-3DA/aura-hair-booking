import type { Meta, StoryObj } from '@storybook/react'
import { ThemeToggle } from '@/components/ThemeToggle'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark bg-slate-900 p-4">
        <Story />
      </div>
    ),
  ],
}

export const WithCustomLabel: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Theme toggle with accessibility label for screen readers',
      },
    },
  },
}