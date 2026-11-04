import { ReactNode } from "react";
import Container from "@/components/shared/container";

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  background?: "base" | "elevated" | "transparent";
  id?: string;
}

export default function Section({
  children,
  className = "",
  containerClassName = "",
  background = "base",
  id,
}: SectionProps) {
  const bgClass = {
    base: "bg-base",
    elevated: "bg-elevated",
    transparent: "bg-transparent",
  }[background];

  return (
    <section id={id} className={`${bgClass} ${id ? "scroll-mt-20" : ""} ${className}`}>
      <Container className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}
