import { ReactNode } from "react";
import Container from "@/components/shared/container";

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  background?: "base" | "elevated" | "transparent";
}

export default function Section({
  children,
  className = "",
  containerClassName = "",
  background = "base",
}: SectionProps) {
  const bgClass = {
    base: "bg-base",
    elevated: "bg-elevated",
    transparent: "bg-transparent",
  }[background];

  return (
    <section className={`${bgClass} ${className}`}>
      <Container className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}
