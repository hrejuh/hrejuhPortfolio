import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EditorialDivider } from "@/components/shared/EditorialDivider";
import { founderNarrative } from "@/data/narrative";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function NarrativeSection() {
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const quoteInView = useInView(quoteRef, { once: true, margin: "-10% 0px" });

  return (
    <AnimatedSection id="narrative" className="max-w-3xl mx-auto">
      {/* Headline */}
      <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight mb-12">
        {founderNarrative.headline}
      </h2>

      {/* Body paragraphs */}
      <div className="space-y-6">
        {founderNarrative.paragraphs.map((paragraph, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="editorial-body"
          >
            {paragraph}
          </motion.p>
        ))}
      </div>

      <EditorialDivider />

      {/* Pull quote */}
      <motion.blockquote
        ref={quoteRef}
        initial={{ opacity: 0, x: -20 }}
        animate={quoteInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="editorial-pullquote max-w-2xl"
      >
        {founderNarrative.pullQuote}
      </motion.blockquote>
    </AnimatedSection>
  );
}
