import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export function EditorialDivider({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const prefersReduced = useReducedMotion();

  return (
    <div ref={ref} className={cn("my-16 flex justify-center", className)}>
      <motion.div
        initial={prefersReduced ? false : { width: 0 }}
        animate={isInView ? { width: "6rem" } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-px bg-accent"
      />
    </div>
  );
}
