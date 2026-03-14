import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { motion } from "framer-motion";

const designWork = [
  // Brand Identity
  { name: "The Indi Mums", type: "Brand Identity", description: "Baby product labels — 7 SKUs across multiple size variants", category: "brand" },
  { name: "K-Khane", type: "Brand Identity", description: "Restaurant branding & logo system", category: "brand" },
  { name: "Taj Bakery", type: "Brand Identity", description: "Bakery logo & social media presence", category: "brand" },
  { name: "Eato Foods", type: "Brand Identity", description: "Food brand pamphlets & company profile", category: "brand" },
  { name: "Gusto", type: "Brand Identity", description: "Restaurant logo design system", category: "brand" },

  // Event Design
  { name: "TEDx", type: "Event Design", description: "Posters, t-shirts, mugs, banners, speaker collateral", category: "event" },
  { name: "Funtainment", type: "Event Design", description: "Event booking platform branding & show materials", category: "event" },

  // Content Design
  { name: "Startup Indian", type: "Content Design", description: "8-part design series on the Indian startup ecosystem", category: "content" },
];

const categories = [
  { key: "brand", label: "Brand Identity" },
  { key: "event", label: "Event Design" },
  { key: "content", label: "Content Design" },
];

export function DesignSection() {
  return (
    <AnimatedSection id="design" className="max-w-6xl mx-auto">
      <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
        Design & Brand Work
      </h2>
      <p className="text-muted-foreground mb-16 max-w-2xl">
        Brand identities, product packaging, event collateral, and content design
        across industries.
      </p>

      {categories.map((cat) => {
        const items = designWork.filter((d) => d.category === cat.key);
        return (
          <div key={cat.key} className="mb-12 last:mb-0">
            <p className="editorial-caption mb-4">{cat.label}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group p-6 rounded-xl border border-border hover:border-accent/30 transition-all hover:-translate-y-0.5"
                >
                  {/* Image placeholder */}
                  <div className="aspect-[4/3] rounded-lg bg-surface-sunken border border-border mb-4 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-mono">{item.type}</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </AnimatedSection>
  );
}
