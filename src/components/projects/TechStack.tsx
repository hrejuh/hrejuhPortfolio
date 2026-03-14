export function TechStack({ technologies, accentColor }: { technologies: string[]; accentColor?: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h3 className="font-display font-semibold text-xl mb-6">Built With</h3>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech) => (
          <span
            key={tech}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-surface-elevated text-foreground border border-border"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
