import { Github, Linkedin, Mail, MapPin } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Left — Identity */}
          <div>
            <p className="font-display font-semibold text-lg">Abdul Ahad</p>
            <p className="text-sm text-muted-foreground mt-1">
              Founder & Managing Director
            </p>
            <p className="text-sm text-muted-foreground">
              DosRicke Ventures Pvt Ltd
            </p>
          </div>

          {/* Center — Brand */}
          <div className="text-center">
            <p className="font-display text-lg">hrejuh</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono tracking-wider">
              (hreh-juh)
            </p>
          </div>

          {/* Right — Links */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/hrejuh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github size={16} />
              </a>
              <a
                href="https://linkedin.com/in/hrejuh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="mailto:me@hrejuh.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin size={12} /> Bangalore, India
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {year} Abdul Ahad. All intellectual property rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
