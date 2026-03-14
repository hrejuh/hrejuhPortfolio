import { motion } from "framer-motion";

interface Props {
  highlights: string[];
  accentColor: string;
}

export function ProjectFeatures({ highlights, accentColor }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h3 className="font-display font-semibold text-xl mb-8">Key Highlights</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {highlights.map((highlight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-4"
          >
            <span
              className="font-display font-bold text-2xl shrink-0 w-10"
              style={{ color: accentColor }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">
              {highlight}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
