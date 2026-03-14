import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const isFlagship = project.tier === "flagship";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to="/projects/$slug"
        params={{ slug: project.slug }}
        className={cn(
          "group block rounded-xl border border-border transition-all hover:-translate-y-1 hover:shadow-lg",
          isFlagship ? "p-8 md:p-10" : "p-6"
        )}
      >
        {/* Accent bar */}
        <div
          className={cn("rounded-full mb-5", isFlagship ? "w-12 h-1" : "w-8 h-0.5")}
          style={{ backgroundColor: project.accentColor }}
        />

        <div className="flex items-start justify-between mb-3">
          <div>
            <h3
              className={cn(
                "font-display font-bold group-hover:text-accent transition-colors",
                isFlagship ? "text-2xl md:text-3xl" : "text-lg"
              )}
            >
              {project.title}
            </h3>
            <p className="text-sm text-accent font-display italic mt-1">{project.tagline}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {project.ownership === "company" && (
              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-muted-foreground">
                DosRicke
              </span>
            )}
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider",
                project.status === "live" && "bg-green-500/10 text-green-600",
                project.status === "beta" && "bg-purple-500/10 text-purple-600",
                project.status === "development" && "bg-amber-500/10 text-amber-600"
              )}
            >
              {project.status}
            </span>
          </div>
        </div>

        <p className={cn("text-muted-foreground mb-5", isFlagship ? "text-base" : "text-sm line-clamp-2")}>
          {project.description}
        </p>

        {/* Highlights — flagships only */}
        {isFlagship && project.highlights.length > 0 && (
          <ul className="space-y-2 mb-6">
            {project.highlights.slice(0, 3).map((h) => (
              <li key={h} className="text-sm text-muted-foreground flex items-start gap-2">
                <span
                  className="w-1 h-1 rounded-full mt-2 shrink-0"
                  style={{ backgroundColor: project.accentColor }}
                />
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Tech pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.technologies.slice(0, isFlagship ? 6 : 4).map((tech) => (
            <span
              key={tech}
              className="text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-muted-foreground border border-border"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > (isFlagship ? 6 : 4) && (
            <span className="text-[10px] px-2 py-0.5 text-muted-foreground">
              +{project.technologies.length - (isFlagship ? 6 : 4)}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {project.liveUrl && (
              <span
                className="text-xs text-accent flex items-center gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(project.liveUrl, "_blank");
                }}
              >
                <ExternalLink size={10} /> Visit live
              </span>
            )}
            <span className="text-xs text-muted-foreground">{project.year}</span>
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors flex items-center gap-1 font-mono uppercase tracking-wider">
            {isFlagship ? "Case study" : "Details"} <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
