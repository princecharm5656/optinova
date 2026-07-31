"use client";

import Section from "@/components/wrapper/section";
import { useEffect, useState, useRef } from "react";

const stats = [
  { value: 10000, suffix: "+", label: "Active Creators", icon: "👥" },
  { value: 500000, suffix: "+", label: "Tools Generated", icon: "⚡" },
  { value: 99.9, suffix: "%", label: "Uptime", icon: "🚀" },
  { value: 4.9, suffix: "★", label: "User Rating", icon: "⭐" },
  { value: 150, suffix: "+", label: "Countries", icon: "🌍" },
  { value: 24, suffix: "/7", label: "AI Available", icon: "🤖" },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(current);
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  const formatted = value % 1 === 0 
    ? Math.floor(count).toLocaleString() 
    : count.toFixed(1);

  return (
    <span ref={ref}>
      {formatted}{suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <Section 
      background="base"
      className="py-20 md:py-24 text-text-base border-y border-base-color"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="text-center space-y-2 group"
          >
            <div className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
              {stat.icon}
            </div>
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-accent to-purple-400 bg-clip-text text-transparent">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </div>
            <p className="text-sm text-text-muted uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
