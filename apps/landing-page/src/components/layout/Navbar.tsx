"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Navigation links configuration
 */
const navLinks = [
  { href: "#quem-somos", label: "Quem Somos" },
  { href: "#estrutura", label: "Estrutura" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#eventos", label: "Eventos" },
  { href: "#localizacao", label: "Localização" },
];

/**
 * Premium Navbar Component
 * Features:
 * - Fixed position with backdrop blur
 * - 3-column grid for optical centering
 * - Framer Motion fade-in animation
 * - Mobile Sheet menu
 */
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/[0.12] bg-black/50 backdrop-blur-[8px]"
      role="banner"
    >
      <div className="container-diamond">
        {/* Desktop Navigation - 3 Column Grid for Optical Centering */}
        <nav
          className="hidden h-20 grid-cols-[1fr_auto_1fr] items-center lg:grid"
          aria-label="Navegação principal"
        >
          {/* Left Column - Logo */}
          <div className="flex items-center justify-start">
            <Link
              href="/"
              className="flex items-center transition-opacity hover:opacity-80"
              aria-label="Diamond - Ir para página inicial"
            >
              <Image
                src="/logo.svg"
                alt="Diamond Logo"
                width={140}
                height={40}
                className="h-11 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Center Column - Navigation Links */}
          <ul
            className="flex items-center gap-1"
            role="menubar"
            aria-label="Menu de navegação"
          >
            {navLinks.map((link) => (
              <li
                key={link.href}
                role="none"
              >
                <Link
                  href={link.href}
                  className="px-4 py-2 font-helvetica text-base font-light text-white/70 transition-all duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  role="menuitem"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Column - CTA Button */}
          <div className="flex items-center justify-end">
              <Link
                href="#contato"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-8 py-3.5 font-helvetica text-sm font-normal text-white transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                ENTRAR EM CONTATO
              </Link>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <nav
          className="flex h-16 items-center justify-between lg:hidden"
          aria-label="Navegação mobile"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
            aria-label="Diamond - Ir para página inicial"
          >
            <Image
              src="/logo.svg"
              alt="Diamond Logo"
              width={120}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-white transition-colors hover:bg-white/10"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-xs border-white/10 bg-black/95 backdrop-blur-xl"
            >
              <SheetHeader className="text-left">
                <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
                <div className="flex items-center justify-between">
                  <Image
                    src="/logo.svg"
                    alt="Diamond Logo"
                    width={120}
                    height={32}
                    className="h-8 w-auto"
                  />
                </div>
              </SheetHeader>

              <nav className="mt-8 flex flex-col gap-1" aria-label="Menu mobile">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg px-4 py-3 font-helvetica text-lg font-light text-white/70 transition-all duration-300 hover:bg-white/5 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile CTA */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: navLinks.length * 0.05 + 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-4"
                >
                  <Link
                    href="#contato"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-9 py-4 font-helvetica text-base font-normal text-white transition-all duration-300 hover:border-white hover:bg-white/10 ml-4"
                  >
                    ENTRAR EM CONTATO
                  </Link>
                </motion.div>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </motion.header>
  );
}
