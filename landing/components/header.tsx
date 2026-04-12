"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Especialidades", href: "#servicios" },
  { label: "Técnicas", href: "#historia" },
  { label: "Equipo", href: "#equipo" },
  { label: "Contacto", href: "#contacto" },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link href="#inicio" onClick={() => handleNavClick("#inicio")} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#079A9D" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M9 2C9 2 4 5 4 9.5C4 12.5 6.5 15 9 15C11.5 15 14 12.5 14 9.5C14 5 9 2 9 2Z" fill="white" opacity="0.9"/>
                <path d="M9 5C9 5 6.5 7 6.5 9.5C6.5 11 7.6 12 9 12C10.4 12 11.5 11 11.5 9.5C11.5 7 9 5 9 5Z" fill="white"/>
              </svg>
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-poppins)", color: "#333333" }}
            >
              Fisio<span style={{ color: "#079A9D" }}>Clean</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="relative text-sm font-medium text-[#333333]/70 hover:text-[#079A9D] transition-colors duration-200 group py-1"
              >
                {link.label}
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 rounded-full"
                  style={{ backgroundColor: "#079A9D" }}
                />
              </button>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a
              href={process.env.NEXT_PUBLIC_BOOKING_URL || "http://localhost:5173/book"}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 inline-block"
              style={{
                backgroundColor: "#079A9D",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#0AB3B7" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#079A9D" }}
            >
              Pedir cita
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-[#333333]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="4" y1="4" x2="18" y2="18" />
                  <line x1="18" y1="4" x2="4" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="7" x2="19" y2="7" />
                  <line x1="3" y1="11" x2="19" y2="11" />
                  <line x1="3" y1="15" x2="19" y2="15" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-left text-sm font-medium text-[#333333]/70 hover:text-[#079A9D] transition-colors py-1"
            >
              {link.label}
            </button>
          ))}
          <a
            href={process.env.NEXT_PUBLIC_BOOKING_URL || "http://localhost:5173/book"}
            className="mt-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white w-full text-center block"
            style={{ backgroundColor: "#079A9D" }}
          >
            Pedir cita
          </a>
        </div>
      )}
    </header>
  )
}
