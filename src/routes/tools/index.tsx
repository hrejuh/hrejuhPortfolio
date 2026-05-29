import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, Play, Youtube } from "lucide-react";

export const Route = createFileRoute("/tools/")({
  component: ToolsHubPage,
});

const TOOLS = [
  {
    to: "/tools/youtube" as const,
    title: "YouTube Transcript",
    description: "Extract captions from any YouTube video. Summarize with your own LLM API key.",
    icon: Youtube,
    accent: "#EF4444",
  },
  {
    to: "/tools/finance" as const,
    title: "Finance Calculator",
    description: "EMI, interest, RD, FD, ROI, profit & loss, percentages, and loan affordability.",
    icon: Calculator,
    accent: "#D97706",
  },
];

const EXTERNAL = [
  {
    href: "https://vela.hrejuh.com",
    title: "Vela",
    description: "Universal streaming — movies, TV, anime, and watch together.",
    icon: Play,
    accent: "#7C3AED",
  },
];

function ToolsHubPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-mono uppercase tracking-wider"
        >
          ← Home
        </Link>

        <h1 className="font-display font-bold text-4xl md:text-5xl mb-3">Tools</h1>
        <p className="text-muted-foreground mb-12 max-w-xl">
          Free utilities — no account needed. Everything runs in your browser except transcript fetching
          and optional LLM summarization (your key stays encrypted locally).
        </p>

        <div className="grid gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group block rounded-xl border border-border p-6 md:p-8 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="w-10 h-1 rounded-full mb-4"
                style={{ backgroundColor: tool.accent }}
              />
              <div className="flex items-start gap-4">
                <tool.icon size={24} className="text-muted-foreground group-hover:text-accent transition-colors shrink-0 mt-1" />
                <div>
                  <h2 className="font-display font-bold text-xl group-hover:text-accent transition-colors">
                    {tool.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                </div>
              </div>
            </Link>
          ))}
          {EXTERNAL.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-border p-6 md:p-8 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="w-10 h-1 rounded-full mb-4"
                style={{ backgroundColor: item.accent }}
              />
              <div className="flex items-start gap-4">
                <item.icon size={24} className="text-muted-foreground group-hover:text-accent transition-colors shrink-0 mt-1" />
                <div>
                  <h2 className="font-display font-bold text-xl group-hover:text-accent transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
