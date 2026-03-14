import type { Skill } from "@/types";

export const skills: Skill[] = [
  // Frontend - Expert
  { name: "React", category: "frontend", level: "expert" },
  { name: "Next.js", category: "frontend", level: "expert" },
  { name: "TypeScript", category: "frontend", level: "expert" },
  { name: "Tailwind CSS", category: "frontend", level: "expert" },
  { name: "Framer Motion", category: "frontend", level: "expert" },
  { name: "TanStack Router", category: "frontend", level: "proficient" },
  { name: "Zustand", category: "frontend", level: "proficient" },
  { name: "React Hook Form", category: "frontend", level: "proficient" },
  { name: "Radix UI", category: "frontend", level: "proficient" },
  { name: "Vue.js", category: "frontend", level: "familiar" },

  // Backend
  { name: "Convex", category: "backend", level: "expert" },
  { name: "Supabase", category: "backend", level: "expert" },
  { name: "Node.js", category: "backend", level: "proficient" },
  { name: "Python", category: "backend", level: "proficient" },
  { name: "FastAPI", category: "backend", level: "proficient" },
  { name: "PostgreSQL", category: "backend", level: "proficient" },
  { name: "Drizzle ORM", category: "backend", level: "proficient" },
  { name: "GraphQL", category: "backend", level: "familiar" },
  { name: "Redis", category: "backend", level: "familiar" },

  // DevOps
  { name: "Cloudflare Pages", category: "devops", level: "expert" },
  { name: "Cloudflare Workers", category: "devops", level: "proficient" },
  { name: "Docker", category: "devops", level: "proficient" },
  { name: "GitHub Actions", category: "devops", level: "proficient" },
  { name: "Turborepo", category: "devops", level: "proficient" },
  { name: "Vite", category: "devops", level: "expert" },

  // Design
  { name: "Adobe Illustrator", category: "design", level: "proficient" },
  { name: "Adobe Photoshop", category: "design", level: "proficient" },
  { name: "Figma", category: "design", level: "proficient" },
  { name: "UI/UX Design", category: "design", level: "proficient" },
  { name: "Brand Identity", category: "design", level: "proficient" },
];
