import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialDivider } from "@/components/shared/EditorialDivider";

interface Props {
  content: string;
}

export function ProjectDeepDive({ content }: Props) {
  const paragraphs = content.split("\n\n").filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <AnimatedSection className="max-w-2xl mx-auto">
      <EditorialDivider />
      <h3 className="font-display font-semibold text-xl mb-8">The Full Story</h3>
      <div className="space-y-6">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="editorial-body">
            {paragraph}
          </p>
        ))}
      </div>
    </AnimatedSection>
  );
}
