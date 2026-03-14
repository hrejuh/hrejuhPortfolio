import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

export function ProjectHero({ project }: { project: Project }) {
  return (
    <section
      className="pt-24 pb-20 px-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${project.accentColor}08 0%, transparent 40%, ${project.accentColor}04 100%)`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground mb-12 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to portfolio
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Accent bar */}
          <div
            className="w-16 h-1 rounded-full mb-8"
            style={{ backgroundColor: project.accentColor }}
          />

          <h1 className="font-display font-bold text-5xl md:text-7xl tracking-tight mb-4">
            {project.title}
          </h1>

          <p className="font-display italic text-xl md:text-2xl text-muted-foreground mb-4">
            {project.tagline}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span>{project.role}</span>
            <span>&middot;</span>
            <span>{project.year}</span>
            <span>&middot;</span>
            <span
              className={cn(
                "text-xs px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider",
                project.status === "live" && "bg-green-500/10 text-green-600",
                project.status === "beta" && "bg-purple-500/10 text-purple-600",
                project.status === "development" && "bg-amber-500/10 text-amber-600"
              )}
            >
              {project.status}
            </span>
            {project.ownership === "company" && (
              <>
                <span>&middot;</span>
                <span className="text-xs font-mono text-accent">DosRicke Ventures</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github size={14} /> Source
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                <ExternalLink size={14} /> Live
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
