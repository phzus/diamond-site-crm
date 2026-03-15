import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Linkedin, Instagram, Facebook } from "lucide-react";

/**
 * Footer navigation links
 */
const footerLinks = {
  company: [
    { href: "#about", label: "Sobre Nós" },
    { href: "#features", label: "Recursos" },
    { href: "#testimonials", label: "Depoimentos" },
    { href: "#pricing", label: "Planos" },
  ],
  legal: [
    { href: "/privacidade", label: "Política de Privacidade" },
    { href: "/termos", label: "Termos de Uso" },
    { href: "/cookies", label: "Política de Cookies" },
    { href: "/lgpd", label: "LGPD" },
  ],
  social: [
    { href: "https://linkedin.com/company/diamond", label: "LinkedIn", icon: Linkedin },
    { href: "https://instagram.com/diamond", label: "Instagram", icon: Instagram },
    { href: "https://facebook.com/diamond", label: "Facebook", icon: Facebook },
  ],
};

/**
 * Footer Component
 * Server Component for better SEO
 * Dark P&B minimal design
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-border bg-background"
      role="contentinfo"
      aria-label="Rodapé do site"
    >
      <div className="container-diamond py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:flex lg:justify-between">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block transition-opacity hover:opacity-80"
              aria-label="Diamond - Ir para página inicial"
            >
              <Image
                src="/logo.svg"
                alt="Diamond Logo"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <p className="max-w-xs pr-0 lg:pr-10 text-base text-muted-foreground">
              Poker Club com a atmosfera envolvente dos grandes cassinos internacionais.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Empresa
            </h3>
            <ul className="space-y-3" role="list">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Legal
            </h3>
            <ul className="space-y-3" role="list">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Contato
            </h3>
            <ul className="space-y-3" role="list">
              <li>
                <a
                  href="mailto:contato@diamond.com.br"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Enviar email para contato@diamond.com.br"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  contato@diamond.com.br
                </a>
              </li>
              <li>
                <a
                  href="tel:+5511999999999"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Ligar para (11) 99999-9999"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  (11) 99999-9999
                </a>
              </li>
              <li className="inline-flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} Diamond. Todos os direitos reservados.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {footerLinks.social.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Visitar ${social.label}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
