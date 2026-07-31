"use client";

import Section from "@/components/wrapper/section";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ahmed Khan",
    role: "YouTube Creator",
    avatar: "AK",
    content: "OptiNova replaced 6 tools in my workflow. Caption generator alone saves me 2 hours daily. The Urdu support is a game-changer for Pakistani creators.",
    rating: 5,
    location: "Lahore, Pakistan",
  },
  {
    name: "Sara Mohammed",
    role: "Instagram Influencer",
    avatar: "SM",
    content: "The hashtag generator is incredibly accurate. My engagement went up 340% in just one month after using OptiNova's optimizer tools.",
    rating: 5,
    location: "Dubai, UAE",
  },
  {
    name: "Bilal Hussain",
    role: "SEO Specialist",
    avatar: "BH",
    content: "Best free SEO toolkit I've used. The keyword research and meta generator are on par with paid tools costing $100/month.",
    rating: 5,
    location: "Karachi, Pakistan",
  },
  {
    name: "Ayesha Tariq",
    role: "Freelance Writer",
    avatar: "AT",
    content: "AI writer in OptiNova understands context better than ChatGPT. The blog generator produces publish-ready content with minimal editing.",
    rating: 5,
    location: "Islamabad, Pakistan",
  },
  {
    name: "Hamza Ali",
    role: "Digital Marketer",
    avatar: "HA",
    content: "Finally, a workspace where everything connects. I don't switch tabs anymore. Found 3 tools I didn't know I needed until I tried them.",
    rating: 5,
    location: "Istanbul, Turkey",
  },
  {
    name: "Zainab Rauf",
    role: "Blogger",
    avatar: "ZR",
    content: "The PDF and image tools are perfect for my blog workflow. Everything is fast, clean, and the dark mode is gorgeous.",
    rating: 5,
    location: "London, UK",
  },
];

export default function Testimonials() {
  return (
    <Section 
      background="base"
      className="py-24 md:py-32 text-text-base"
    >
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <p className="uppercase tracking-[0.3em] text-cyan-accent text-sm font-semibold">
          Loved by Creators
        </p>
        <h2 className="text-4xl md:text-6xl font-bold leading-tight">
          Real people.
          <span className="bg-gradient-to-r from-cyan-accent via-purple-400 to-cyan-accent bg-clip-text text-transparent">
            {" "}Real results.
          </span>
        </h2>
        <p className="text-lg text-text-muted">
          Join thousands of creators who turned chaos into clarity.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="group relative p-6 rounded-2xl bg-elevated/40 border border-base-color hover:border-cyan-accent/40 transition-all duration-300"
          >
            {/* Quote Icon */}
            <Quote className="w-8 h-8 text-cyan-accent/20 absolute top-6 right-6" />

            <div className="space-y-4 relative">
              {/* Rating */}
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4 fill-yellow-400 text-yellow-400" 
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-text-base leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-base-color">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-accent to-purple-400 flex items-center justify-center text-black font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {testimonial.role} • {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
