import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Github, Linkedin, Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Invalid email"),
  subject: z.string().min(5, "Subject is too short").max(120),
  message: z.string().min(10, "Message is too short").max(5000),
});

type FormData = z.infer<typeof schema>;

export function ContactSection() {
  const submitContact = useMutation(api.mutations.contact.submitContact);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await submitContact({
        ...data,
        userAgent: navigator.userAgent,
      });
      toast.success("Message sent! I'll get back to you soon.");
      reset();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 30000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <AnimatedSection id="contact" className="max-w-4xl mx-auto">
      <h2 className="font-display font-bold text-3xl md:text-4xl mb-16">
        Let's Build Something
      </h2>

      <div className="grid md:grid-cols-[1fr_1.5fr] gap-12">
        {/* Contact info */}
        <div className="space-y-6">
          <p className="editorial-body">
            Interested in partnering, licensing a product, or exploring what
            DosRicke Ventures can build for your business? I'd love to hear from you.
          </p>
          <div className="space-y-3">
            <a
              href="mailto:me@hrejuh.com"
              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail size={16} /> me@hrejuh.com
            </a>
            <a
              href="https://github.com/hrejuh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github size={16} /> github.com/hrejuh
            </a>
            <a
              href="https://linkedin.com/in/hrejuh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin size={16} /> linkedin.com/in/hrejuh
            </a>
            <p className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin size={16} /> Bangalore, India
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register("name")}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg bg-surface-elevated border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
            />
            {errors.name && <p className="text-xs text-[var(--error)] mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <input
              {...register("email")}
              placeholder="your@email.com"
              type="email"
              className="w-full px-4 py-3 rounded-lg bg-surface-elevated border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
            />
            {errors.email && <p className="text-xs text-[var(--error)] mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input
              {...register("subject")}
              placeholder="Subject"
              className="w-full px-4 py-3 rounded-lg bg-surface-elevated border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
            />
            {errors.subject && <p className="text-xs text-[var(--error)] mt-1">{errors.subject.message}</p>}
          </div>
          <div>
            <textarea
              {...register("message")}
              placeholder="Your message..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-surface-elevated border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none transition-colors"
            />
            {errors.message && <p className="text-xs text-[var(--error)] mt-1">{errors.message.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || submitted}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <Send size={16} />
            {isSubmitting ? "Sending..." : submitted ? "Sent!" : "Send Message"}
          </button>
        </form>
      </div>
    </AnimatedSection>
  );
}
