import { CheckCircle2Icon } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { ReactNode } from "react"

type AlertBlockProps = {
  title: string
  description?: string
  variant?: "default" | "destructive"
  children?: ReactNode
}

export function AlertBlock({title, description, variant = "default", children}: AlertBlockProps) {
  return (
    <Alert variant={variant} className="max-w-md">
      <CheckCircle2Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-1">
        {description}
        {children}
      </AlertDescription>
    </Alert>
  )
}
