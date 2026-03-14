export type ProjectTier = "flagship" | "strong" | "other";

export type ProjectNarrative = {
  problem: string;
  solution: string;
  insight: string;
};

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  longDescription: string;
  tier: ProjectTier;
  year: number;
  status: "live" | "beta" | "development" | "archived";
  ownership: "personal-ip" | "company";
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  accentColor: string;
  highlights: string[];
  role: string;
  narrative?: ProjectNarrative;
};

export type Skill = {
  name: string;
  category: "frontend" | "backend" | "devops" | "design" | "other";
  level: "expert" | "proficient" | "familiar";
};

export type Venture = {
  name: string;
  tagline: string;
  description: string;
  status: "live" | "building" | "concept";
  url?: string;
  accentColor: string;
  type: "company" | "product" | "community";
  parentCompany?: string;
  products?: string[];
  role?: string;
};

export type AggregateStats = {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
};

export type FounderNarrative = {
  headline: string;
  paragraphs: string[];
  pullQuote: string;
};

export type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};
