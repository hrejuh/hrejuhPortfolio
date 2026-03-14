import { AnimatedSection } from "@/components/shared/AnimatedSection";
import type { ProjectNarrative as NarrativeType } from "@/types";

interface Props {
  narrative: NarrativeType;
  accentColor: string;
}

const blocks = [
  { key: "problem" as const, label: "The Problem" },
  { key: "solution" as const, label: "The Solution" },
  { key: "insight" as const, label: "The Insight" },
];

export function ProjectNarrative({ narrative, accentColor }: Props) {
  return (
    <AnimatedSection className="max-w-2xl mx-auto">
      <div className="space-y-12">
        {blocks.map((block, i) => (
          <div key={block.key}>
            <h3
              className="font-display font-semibold text-xl mb-4"
              style={{ color: i === 2 ? accentColor : undefined }}
            >
              {block.label}
            </h3>
            <p className="editorial-body">{narrative[block.key]}</p>
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
}
