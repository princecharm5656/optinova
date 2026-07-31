import Section from "@/components/wrapper/section";

export default function Hero() {
  return (
    <Section 
      background="base"
      className="min-h-screen text-text-base flex items-center pt-16"
    >
      <div className="max-w-3xl space-y-8">
        <p className="uppercase tracking-[0.3em] text-cyan-accent">
          OptiNova
        </p>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          The Operating System
          <br />
          For Creators
        </h1>

        <p className="text-xl text-text-muted">
          AI Writing, SEO, Image, PDF and Creator Tools—
          all inside one intelligent workspace.
        </p>
      </div>
    </Section>
  );
}
