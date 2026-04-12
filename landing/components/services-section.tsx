"use client"

import { useEffect, useRef } from "react"

const services = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 4C14 4 7 8 7 14.5C7 18.1 10.1 21 14 21C17.9 21 21 18.1 21 14.5C21 8 14 4 14 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
        <path d="M14 10C14 10 11 12 11 14.5C11 16 12.3 17 14 17C15.7 17 17 16 17 14.5C17 12 14 10 14 10Z" fill="currentColor" opacity="0.3"/>
        <path d="M10 22H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: "Fisioterapia deportiva",
    text: "Recuperación de lesiones musculares, tendinosas y articulares. Vuelta al deporte de forma segura y óptima.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="4" y="10" width="20" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" fill="none"/>
        <path d="M10 10V8C10 6.3 11.3 5 13 5H15C16.7 5 18 6.3 18 8V10" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M14 15V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="14" cy="14" r="1.5" fill="currentColor"/>
      </svg>
    ),
    title: "Rehabilitación",
    text: "Programas de rehabilitación postquirúrgica y tras traumatismos para una recuperación completa y duradera.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.6" fill="none"/>
        <path d="M10 14C10 14 11 10 14 10C17 10 18 14 18 14C18 14 17 18 14 18C11 18 10 14 10 14Z" stroke="currentColor" strokeWidth="1.6" fill="none"/>
        <circle cx="14" cy="14" r="2" fill="currentColor" opacity="0.4"/>
      </svg>
    ),
    title: "Osteopatía",
    text: "Diagnóstico y tratamiento manual de disfunciones del sistema músculo-esquelético, visceral y craneal.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 6C14 6 9 9 9 13C9 14.7 9.9 16.2 11 17.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M14 6C14 6 19 9 19 13C19 14.7 18.1 16.2 17 17.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M11 17.1C11 17.1 12 19 14 19C16 19 17 17.1 17 17.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M14 19V23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M11 21H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: "Suelo pélvico",
    text: "Tratamiento especializado de disfunciones del suelo pélvico, incontinencia, prolapsos y dolor pélvico.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M7 18L11 10L14 15L17 12L21 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 21H23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: "Pilates terapéutico",
    text: "Método Pilates adaptado a patologías específicas para mejorar la postura, fuerza y control motor.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M8 20L14 8L20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.5 16H17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="14" cy="6" r="1.5" fill="currentColor" opacity="0.4"/>
      </svg>
    ),
    title: "Readaptación funcional",
    text: "Programas de readaptación al movimiento y a la actividad física para prevenir recaídas y optimizar el rendimiento.",
  },
]

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cardsRef.current.forEach((card, i) => {
            if (card) {
              setTimeout(() => {
                card.style.transition = "opacity 0.6s ease, transform 0.6s ease"
                card.style.opacity = "1"
                card.style.transform = "translateY(0)"
              }, i * 90)
            }
          })
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="servicios" className="py-24 lg:py-32 bg-white">
      <div ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#079A9D" }}
          >
            Nuestros servicios
          </span>
          <h2
            className="mt-3 text-4xl lg:text-5xl font-bold leading-tight text-balance"
            style={{ fontFamily: "var(--font-poppins)", color: "#333333" }}
          >
            Especialidades clínicas
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "#AAAAAA" }}>
            Ofrecemos una amplia gama de tratamientos especializados para atender todas tus necesidades de salud y bienestar.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div
              key={s.title}
              ref={(el) => { cardsRef.current[i] = el }}
              className="group rounded-2xl p-7 border transition-all duration-300 cursor-default hover:shadow-lg hover:-translate-y-1"
              style={{
                backgroundColor: "white",
                borderColor: "#f0f0f0",
                opacity: 0,
                transform: "translateY(24px)",
              }}
            >
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-[#079A9D] group-hover:text-white"
                style={{ backgroundColor: "#079A9D12", color: "#079A9D" }}
              >
                {s.icon}
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ fontFamily: "var(--font-poppins)", color: "#333333" }}
              >
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#AAAAAA" }}>
                {s.text}
              </p>
              {/* Arrow */}
              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "#079A9D" }}>
                Saber más
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 7H11M11 7L8 4M11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
