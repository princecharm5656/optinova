import Link from "next/link";
import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/marketing/footer";
import Container from "@/components/shared/container";

export const metadata = {
  title: "All Tools | OptiNova",
  description: "Every OptiNova tool in one place: AI writing, SEO, creator, image and PDF tools.",
};

type Tool = { name: string; desc: string; href: string };
type Group = { id: string; title: string; blurb: string; tools: Tool[] };

// Only tools that exist today. Add a tool here when you build it.
const groups: Group[] = [
  {
    id: "writing",
    title: "AI Writing",
    blurb: "Generate content in seconds",
    tools: [
      { name: "Caption Generator", desc: "Captions for Instagram, TikTok and more.", href: "/tools/caption" },
      { name: "Bio Generator", desc: "Profile bios in different tones.", href: "/tools/bio" },
      { name: "Email Writer", desc: "Draft clear, professional emails.", href: "/tools/email" },
      { name: "Story Generator", desc: "Short stories from a simple idea.", href: "/tools/story" },
      { name: "Blog Writer", desc: "Blog posts from a topic.", href: "/tools/blog" },
      { name: "Product Descriptions", desc: "Descriptions that sell.", href: "/tools/product" },
      { name: "Rewriter", desc: "Rephrase text in a new style.", href: "/tools/rewriter" },
      { name: "Summarizer", desc: "Shorten long text quickly.", href: "/tools/summarizer" },
      { name: "Translator", desc: "Translate between languages.", href: "/tools/translator" },
    ],
  },
  {
    id: "seo",
    title: "SEO Tools",
    blurb: "Find what people search for",
    tools: [{ name: "Keyword Research", desc: "Keyword ideas for any topic.", href: "/tools/keyword" }],
  },
  {
    id: "creator",
    title: "Creator Suite",
    blurb: "For social media creators",
    tools: [
      { name: "Hashtag Generator", desc: "Relevant hashtags for your posts.", href: "/tools/hashtag" },
      { name: "Caption Templates", desc: "Ready-made caption templates.", href: "/tools/templates" },
      { name: "Voice Transcription", desc: "Turn audio into text.", href: "/tools/transcribe" },
    ],
  },
  {
    id: "image",
    title: "Image Studio",
    blurb: "Create and optimise images",
    tools: [
      { name: "Image Generator", desc: "Generate images from a text prompt.", href: "/tools/image" },
      { name: "Image Compressor", desc: "Make images smaller for the web.", href: "/tools/image-compress" },
    ],
  },
  {
    id: "pdf",
    title: "PDF Workshop",
    blurb: "Work with PDF files",
    tools: [{ name: "PDF Merge", desc: "Combine several PDFs into one.", href: "/tools/pdf-merge" }],
  },
];

export default function ToolsIndexPage() {
  return (
    <>
      <Navbar />
      <main className="bg-base text-text-base min-h-screen pt-28 pb-24">
        <Container>
          <div className="max-w-3xl space-y-4 mb-12">
            <p className="uppercase tracking-[0.3em] text-cyan-accent text-sm font-semibold">All tools</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Everything OptiNova can do today</h1>
            <p className="text-lg text-text-muted">
              Log in to use the tools. More are on the way.
            </p>
          </div>

          {/* Featured: Magic */}
          <Link
            href="/magic"
            className="block mb-14 rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-900/30 to-indigo-900/20 p-8 hover:border-purple-400/70 transition-colors"
          >
            <p className="text-sm font-semibold text-purple-300 mb-2">Featured</p>
            <h2 className="text-2xl font-bold mb-2">Business Blueprint (Magic)</h2>
            <p className="text-text-muted max-w-2xl">
              Describe a business idea in one sentence and get costs, a 24-month projection, strategy, brand visuals and a 7-day action plan. Export it as a PDF.
            </p>
            <span className="inline-block mt-4 text-cyan-accent font-semibold">Try it →</span>
          </Link>

          <div className="space-y-14">
            {groups.map((g) => (
              <section key={g.id} id={g.id} className="scroll-mt-28">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold">{g.title}</h2>
                  <p className="text-text-muted">{g.blurb}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {g.tools.map((t) => (
                    <Link
                      key={t.href + t.name}
                      href={t.href}
                      className="group rounded-2xl border border-base-color bg-elevated/40 p-5 hover:border-cyan-accent/50 hover:-translate-y-0.5 transition-all"
                    >
                      <h3 className="font-semibold text-text-base group-hover:text-cyan-accent transition-colors">{t.name}</h3>
                      <p className="text-sm text-text-muted mt-1">{t.desc}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
