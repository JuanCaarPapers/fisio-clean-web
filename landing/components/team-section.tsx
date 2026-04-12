"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

const team = [
  {
    name: "Dra. Laura Martínez",
    role: "Fisioterapeuta & Directora",
    specialty: "Fisioterapia deportiva · Neurológica",
    image: "/images/team-1.jpg",
  },
  {
    name: "Dr. Carlos Ruiz",
    role: "Fisioterapeuta Senior",
    specialty: "Osteopatía · Terapia manual",
    image: "/images/team-2.jpg",
  },
  {
    name: "Dra. Elena Sánchez",
    role: "Fisioterapeuta Especialista",
    specialty: "Suelo pélvico · Pilates terapéutico",
    image: "/images/team-3.jpg",
  },
]

export function TeamSection() {
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
              }, i * 130)
            }
          })
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="equipo" className="py-24 lg:py-32" style={{ backgroundColor: "var(--section-alt, #F8F8F8)" }}>
      <div ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#079A9D" }}>
            Nuestro equipo
          </span>
          <h2
            className="mt-3 text-4xl lg:text-5xl font-bold leading-tight text-balance"
            style={{ fontFamily: "var(--font-poppins)", color: "#333333" }}
          >
            Profesionales a tu servicio
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "#AAAAAA" }}>
            Un equipo multidisciplinar con amplia experiencia clínica y formación continua en las últimas técnicas terapéuticas.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <div
              key={member.name}
              ref={(el) => { cardsRef.current[i] = el }}
              style={{ opacity: 0, transform: "translateY(28px)" }}
              className="group flex flex-col items-center text-center rounded-3xl p-8 bg-white shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Photo */}
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-md group-hover:ring-[#079A9D]/20 transition-all duration-300">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={112}
                    height={112}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-400"
                  />
                </div>
                {/* Online indicator */}
                <div
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: "#079A9D" }}
                  aria-hidden="true"
                />
              </div>

              <h3
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-poppins)", color: "#333333" }}
              >
                {member.name}
              </h3>
              <p className="text-sm font-medium mt-1" style={{ color: "#079A9D" }}>
                {member.role}
              </p>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: "#AAAAAA" }}>
                {member.specialty}
              </p>

              {/* Social icons */}
              <div className="flex gap-3 mt-5">
                {["linkedin", "mail"].map((icon) => (
                  <div
                    key={icon}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer hover:bg-[#079A9D] hover:text-white"
                    style={{ backgroundColor: "#079A9D10", color: "#079A9D" }}
                  >
                    {icon === "linkedin" ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                        <path d="M1.5 4.5H3.5V12.5H1.5V4.5ZM2.5 3.5C3.05 3.5 3.5 3.05 3.5 2.5C3.5 1.95 3.05 1.5 2.5 1.5C1.95 1.5 1.5 1.95 1.5 2.5C1.5 3.05 1.95 3.5 2.5 3.5ZM5 4.5H6.9V5.4H6.93C7.2 4.87 7.9 4.3 8.9 4.3C10.9 4.3 11.3 5.6 11.3 7.3V12.5H9.3V7.7C9.3 6.9 9.28 5.9 8.2 5.9C7.1 5.9 6.93 6.73 6.93 7.65V12.5H5V4.5Z"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                        <rect x="1.5" y="3" width="11" height="8" rx="1.5"/>
                        <path d="M1.5 4L7 8L12.5 4"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
