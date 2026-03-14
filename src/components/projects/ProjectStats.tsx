import type { Project } from "@/types";

export function ProjectStats({ project }: { project: Project }) {
  const details = [
    { label: "Role", value: project.role },
    { label: "Year", value: String(project.year) },
    { label: "Status", value: project.status.charAt(0).toUpperCase() + project.status.slice(1) },
    { label: "Ownership", value: project.ownership === "company" ? "DosRicke Ventures" : "Personal IP" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="text-center p-4 rounded-lg bg-surface-elevated border border-border"
          >
            <p className="font-display font-semibold text-lg">{detail.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">
              {detail.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
