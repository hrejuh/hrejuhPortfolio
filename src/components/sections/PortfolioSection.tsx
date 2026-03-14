import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects } from "@/data/projects";

export function PortfolioSection() {
  const flagships = projects.filter((p) => p.tier === "flagship");
  const strong = projects.filter((p) => p.tier === "strong");

  return (
    <AnimatedSection id="portfolio" className="max-w-6xl mx-auto">
      <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
        Product Portfolio
      </h2>
      <p className="text-muted-foreground mb-16 max-w-2xl">
        Every product starts the same way: I notice something broken, build the fix,
        and ship it to people who need it.
      </p>

      {/* Flagship — large editorial cards */}
      <div className="space-y-6 mb-16">
        {flagships.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>

      {/* Strong — smaller grid */}
      {strong.length > 0 && (
        <>
          <p className="editorial-caption mb-6">More Projects</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strong.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </>
      )}
    </AnimatedSection>
  );
}
