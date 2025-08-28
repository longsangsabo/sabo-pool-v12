// Button component type definitions
export type ButtonSize = "sm" | "lg" | "md" | "xs";
export type ButtonVariant = "outline" | "ghost" | "secondary" | "destructive" | "link";

export interface ButtonProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}
