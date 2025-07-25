import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const toastVariants = {
  default: {
    className: "border-border bg-background text-foreground",
    icon: Info
  },
  success: {
    className: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
    icon: CheckCircle
  },
  error: {
    className: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
    icon: XCircle
  },
  warning: {
    className: "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100",
    icon: AlertCircle
  },
  info: {
    className: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
    icon: Info
  }
}

export function useEnhancedToast() {
  const { toast } = useToast()

  const showToast = ({ 
    title, 
    description, 
    variant = 'default', 
    duration = 4000 
  }: ToastProps) => {
    const variantConfig = toastVariants[variant]
    const Icon = variantConfig.icon

    return toast({
      title,
      description: (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {description}
        </div>
      ),
      duration,
      className: cn(
        "group border border-border bg-background text-foreground shadow-lg",
        variantConfig.className
      ),
    })
  }

  const success = (title: string, description?: string) => 
    showToast({ title, description, variant: 'success' })

  const error = (title: string, description?: string) => 
    showToast({ title, description, variant: 'error' })

  const warning = (title: string, description?: string) => 
    showToast({ title, description, variant: 'warning' })

  const info = (title: string, description?: string) => 
    showToast({ title, description, variant: 'info' })

  return {
    toast: showToast,
    success,
    error,
    warning,
    info,
  }
}