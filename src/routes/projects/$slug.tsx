import { createFileRoute, notFound } from "@tanstack/react-router";
import { projects } from "@/data/projects";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectNarrative } from "@/components/projects/ProjectNarrative";
import { ProjectFeatures } from "@/components/projects/ProjectFeatures";
import { ProjectStats } from "@/components/projects/ProjectStats";
import { TechStack } from "@/components/projects/TechStack";
import { ProjectDeepDive } from "@/components/projects/ProjectDeepDive";
import { ProjectNavigation } from "@/components/projects/ProjectNavigation";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const project = projects.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return project;
  },
  component: ProjectDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center font-display text-2xl text-muted-foreground">
      Project not found
    </div>
  ),
});

function ProjectDetailPage() {
  const project = Route.useLoaderData();

  return (
    <article className="min-h-screen">
      <ProjectHero project={project} />

      {project.narrative && (
        <ProjectNarrative
          narrative={project.narrative}
          accentColor={project.accentColor}
        />
      )}

      <ProjectFeatures
        highlights={project.highlights}
        accentColor={project.accentColor}
      />

      <ProjectStats project={project} />

      <TechStack
        technologies={project.technologies}
        accentColor={project.accentColor}
      />

      {project.longDescription && (
        <ProjectDeepDive content={project.longDescription} />
      )}

      <ProjectNavigation currentSlug={project.slug} />
    </article>
  );
}
