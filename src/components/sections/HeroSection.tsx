import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Name — large editorial serif */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display font-bold text-6xl md:text-8xl lg:text-9xl tracking-tight"
        >
          Abdul Ahad
        </motion.h1>

        {/* Pseudonym with pronunciation */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-4 text-lg text-muted-foreground"
        >
          also known as{" "}
          <span className="font-display font-medium text-foreground">hrejuh</span>{" "}
          <span className="font-mono text-sm text-accent">(hreh-juh)</span>
        </motion.p>

        {/* Title — editorial caption style */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="editorial-caption mt-6"
        >
          Founder & Managing Director
        </motion.p>

        {/* Company */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm text-muted-foreground mt-1"
        >
          DosRicke Ventures Pvt Ltd
        </motion.p>

        {/* One-liner */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed font-display font-light italic"
        >
          I build the software that Indian businesses depend on.
        </motion.p>

        {/* Scroll hint */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() =>
            document.getElementById("narrative")?.scrollIntoView({ behavior: "smooth" })
          }
          className="mt-16 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
        >
          Explore my work
          <ArrowDown size={14} className="animate-bounce" />
        </motion.button>
      </div>
    </section>
  );
}
