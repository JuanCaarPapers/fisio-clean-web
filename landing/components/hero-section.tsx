"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

export function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const btnsRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Staggered entrance animations
    const elements = [badgeRef, titleRef, subtitleRef, descRef, btnsRef]
    elements.forEach((ref, i) => {
      if (ref.current) {
        ref.current.style.opacity = "0"
        ref.current.style.transform = "translateY(28px)"
        setTimeout(() => {
          if (ref.current) {
            ref.current.style.transition = "opacity 0.7s ease, transform 0.7s ease"
            ref.current.style.opacity = "1"
            ref.current.style.transform = "translateY(0)"
          }
        }, 100 + i * 120)
      }
    })
    if (imageRef.current) {
      imageRef.current.style.opacity = "0"
      imageRef.current.style.transform = "translateX(24px) scale(0.97)"
      setTimeout(() => {
        if (imageRef.current) {
          imageRef.current.style.transition = "opacity 0.9s ease, transform 0.9s ease"
          imageRef.current.style.opacity = "1"
          imageRef.current.style.transform = "translateX(0) scale(1)"
        }
      }, 200)
    }

    // Parallax on scroll
    const handleParallax = () => {
      const scrollY = window.scrollY
      if (imageRef.current) {
        imageRef.current.style.transform = `translateY(${scrollY * 0.12}px)`
      }
    }
    window.addEventListener("scroll", handleParallax, { passive: true })
    return () => window.removeEventListener("scroll", handleParallax)
  }, [])

  const handleScroll = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden bg-white pt-20"
    >
      {/* Background decoration */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top right, #079A9D 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 lg:py-24">
          {/* Left — Content */}
          <div className="flex flex-col gap-6 lg:gap-8 order-2 lg:order-1">
            {/* Badge */}
            <div ref={badgeRef}>
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
                style={{ backgroundColor: "#079A9D15", color: "#079A9D" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#079A9D" }} aria-hidden="true" />
                Fisioterapia de vanguardia
              </span>
            </div>

            <h1
              ref={titleRef}
              className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-balance"
              style={{ fontFamily: "var(--font-poppins)", color: "#333333", lineHeight: "1.1" }}
            >
              Fisio<span style={{ color: "#079A9D" }}>Clean</span>
            </h1>

            <p
              ref={subtitleRef}
              className="text-xl lg:text-2xl font-medium leading-relaxed text-pretty"
              style={{ color: "#333333", opacity: 0.85 }}
            >
              Clínica especializada en fisioterapia avanzada y recuperación funcional.
            </p>

            <p
              ref={descRef}
              className="text-base leading-relaxed text-pretty max-w-md"
              style={{ color: "#AAAAAA" }}
            >
              Un equipo de profesionales altamente cualificados con un enfoque personalizado, tecnología de vanguardia y los más altos estándares de calidad asistencial.
            </p>

            <div ref={btnsRef} className="flex flex-wrap gap-4">
              <a
                href={process.env.NEXT_PUBLIC_BOOKING_URL || "http://localhost:5173/book"}
                className="px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 inline-block"
                style={{ backgroundColor: "#079A9D" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#0AB3B7" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#079A9D" }}
              >
                Pedir cita
              </a>
              <button
                onClick={() => handleScroll("#servicios")}
                className="px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 border-2 hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  color: "#079A9D",
                  borderColor: "#079A9D",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.backgroundColor = "#079A9D10"
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.backgroundColor = "transparent"
                }}
              >
                Ver servicios
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4 border-t border-gray-100">
              {[
                { value: "+2.000", label: "Pacientes tratados" },
                { value: "15+", label: "Años de experiencia" },
                { value: "98%", label: "Satisfacción" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-poppins)", color: "#079A9D" }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-xs" style={{ color: "#AAAAAA" }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Image */}
          <div className="order-1 lg:order-2 relative">
            <div
              ref={imageRef}
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{ aspectRatio: "4/5", maxHeight: "600px" }}
            >
              <Image
                src="/images/hero-clinic.jpg"
                alt="Consulta moderna de FisioClean"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Overlay card */}
              <div className="absolute bottom-6 left-6 right-6">
                <div
                  className="rounded-2xl p-4 flex items-center gap-3 backdrop-blur-md"
                  style={{ backgroundColor: "rgba(255,255,255,0.92)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#079A9D15" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M10 2L12.39 7.26L18 8.27L14 12.14L14.9 17.5L10 15L5.1 17.5L6 12.14L2 8.27L7.61 7.26L10 2Z" stroke="#079A9D" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#333333" }}>Excelencia certificada</p>
                    <p className="text-xs" style={{ color: "#AAAAAA" }}>Centro acreditado y certificado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accent circle */}
            <div
              className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-15 pointer-events-none"
              style={{ backgroundColor: "#B298DC" }}
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-20 pointer-events-none"
              style={{ backgroundColor: "#079A9D" }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-xs tracking-widest uppercase" style={{ color: "#333333" }}>Scroll</span>
        <div className="w-px h-8 bg-[#333333] animate-bounce" />
      </div>
    </section>
  )
}
