import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { aggregateStats } from "@/data/stats";

export function NumbersSection() {
  return (
    <AnimatedSection id="numbers" className="max-w-5xl mx-auto">
      <h2 className="font-display font-bold text-3xl md:text-4xl mb-16 text-center">
        By The Numbers
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
        {aggregateStats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display font-bold text-4xl md:text-5xl">
              <AnimatedCounter
                target={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
              />
            </p>
            <p className="text-xs text-muted-foreground mt-3 font-mono uppercase tracking-wider leading-relaxed">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
}
