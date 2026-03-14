import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ventures } from "@/data/ventures";
import { motion } from "framer-motion";
import { ExternalLink, Building2, Package, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons = {
  company: Building2,
  product: Package,
  community: Users,
};

export function VenturesSection() {
  const company = ventures.find((v) => v.type === "company");
  const products = ventures.filter((v) => v.type === "product");
  const community = ventures.filter((v) => v.type === "community");

  return (
    <AnimatedSection id="ventures" className="max-w-6xl mx-auto">
      <h2 className="font-display font-bold text-3xl md:text-4xl mb-16">Ventures</h2>

      {/* Company umbrella — large banner */}
      {company && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 md:p-12 rounded-xl border border-border mb-8"
          style={{ borderTopColor: company.accentColor, borderTopWidth: 3 }}
        >
          <p className="editorial-caption mb-3">{company.role}</p>
          <h3 className="font-display font-bold text-2xl md:text-3xl mb-2">
            {company.name}
          </h3>
          <p className="font-display italic text-lg text-accent mb-4">
            {company.tagline}
          </p>
          <p className="editorial-body mb-6">{company.description}</p>

          {company.products && (
            <div className="flex flex-wrap gap-2">
              {company.products.map((p) => (
                <span
                  key={p}
                  className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-surface-elevated border border-border"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Products grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {products.map((venture, i) => {
          const Icon = typeIcons[venture.type];
          return (
            <motion.div
              key={venture.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-xl border border-border hover:-translate-y-1 transition-all group"
              style={{ borderLeftColor: venture.accentColor, borderLeftWidth: 3 }}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon size={18} className="text-muted-foreground" />
                <span
                  className={cn(
                    "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full",
                    venture.status === "live" && "bg-green-500/10 text-green-600",
                    venture.status === "building" && "bg-amber-500/10 text-amber-600"
                  )}
                >
                  {venture.status}
                </span>
              </div>
              <h4 className="font-display font-semibold text-lg mb-1">{venture.name}</h4>
              <p className="text-sm text-accent mb-3">{venture.tagline}</p>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {venture.description}
              </p>

              {venture.parentCompany && (
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Under {venture.parentCompany}
                </p>
              )}

              {venture.url && (
                <a
                  href={venture.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  Visit <ExternalLink size={10} />
                </a>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Community ventures */}
      {community.length > 0 && (
        <div>
          <p className="editorial-caption mb-4">Community</p>
          <div className="grid md:grid-cols-2 gap-4">
            {community.map((v) => (
              <div
                key={v.name}
                className="p-5 rounded-xl border border-border"
                style={{ borderLeftColor: v.accentColor, borderLeftWidth: 3 }}
              >
                <h4 className="font-display font-semibold mb-1">{v.name}</h4>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AnimatedSection>
  );
}
