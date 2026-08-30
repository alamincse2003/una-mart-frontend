import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "cta" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  cta: "btn-cta",
  secondary: "btn-secondary",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={`${variantClass[variant]} ${className}`} {...props} />
  );
}
