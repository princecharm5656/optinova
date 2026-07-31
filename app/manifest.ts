import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OptiNova — Creator OS",
    short_name: "OptiNova",
    description: "AI Writing, SEO, Image, PDF and Creator Tools in one workspace.",
    start_url: "/",
    display: "standalone",
    background_color: "#08080F",
    theme_color: "#06B6D4",
  };
}
