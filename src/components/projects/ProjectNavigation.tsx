import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { projects } from "@/data/projects";

interface Props {
  currentSlug: string;
}

export function ProjectNavigation({ currentSlug }: Props) {
  const currentIndex = projects.findIndex((p) => p.slug === currentSlug);
  const prev = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const next = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 border-t border-border mt-16">
      <div className="grid grid-cols-3 items-start">
        {/* Previous */}
        <div>
          {prev && (
            <Link
              to="/projects/$slug"
              params={{ slug: prev.slug }}
              className="group inline-flex flex-col gap-1"
            >
              <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                <ArrowLeft size={12} /> Previous
              </span>
              <span className="font-display font-medium text-sm group-hover:text-accent transition-colors">
                {prev.title}
              </span>
            </Link>
          )}
        </div>

        {/* Center — back to all */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs font-mono text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            All Work
          </Link>
        </div>

        {/* Next */}
        <div className="text-right">
          {next && (
            <Link
              to="/projects/$slug"
              params={{ slug: next.slug }}
              className="group inline-flex flex-col items-end gap-1"
            >
              <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                Next <ArrowRight size={12} />
              </span>
              <span className="font-display font-medium text-sm group-hover:text-accent transition-colors">
                {next.title}
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
