"use client"

import { useEffect, useRef } from "react"

const milestones = [
  { year: "2008", title: "Fundación", text: "Abrimos nuestras puertas con la misión de ofrecer fisioterapia de la más alta calidad en un entorno acogedor y profesional." },
  { year: "2013", title: "Expansión del equipo", text: "Incorporamos especialistas en osteopatía, suelo pélvico y pilates terapéutico para ofrecer una atención más completa." },
  { year: "2018", title: "Nueva sede", text: "Nos trasladamos a nuestras instalaciones actuales, dotadas con equipamiento de última generación para diagnóstico y tratamiento." },
  { year: "2024", title: "Excelencia reconocida", text: "Más de 2.000 pacientes tratados y reconocidos como una de las mejores clínicas de fisioterapia de la región." },
]

export function HistorySection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          itemsRef.current.forEach((item, i) => {
            if (item) {
              setTimeout(() => {
                item.style.transition = "opacity 0.6s ease, transform 0.6s ease"
                item.style.opacity = "1"
                item.style.transform = "translateY(0)"
              }, i * 120)
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
    <section id="historia" className="py-24 lg:py-32" style={{ backgroundColor: "var(--section-alt, #F8F8F8)" }}>
      <div ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#079A9D" }}
          >
            Nuestra historia
          </span>
          <h2
            className="mt-3 text-4xl lg:text-5xl font-bold leading-tight text-balance"
            style={{ fontFamily: "var(--font-poppins)", color: "#333333" }}
          >
            Más de 15 años cuidando personas
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "#AAAAAA" }}>
            Un recorrido de dedicación, formación continua y compromiso con la salud y el bienestar de nuestros pacientes.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Central line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden lg:block"
            style={{ backgroundColor: "#079A9D20" }}
            aria-hidden="true"
          />

          <div className="flex flex-col gap-8">
            {milestones.map((m, i) => (
              <div
                key={m.year}
                ref={(el) => { itemsRef.current[i] = el }}
                style={{ opacity: 0, transform: "translateY(20px)" }}
                className={`flex flex-col lg:flex-row items-center gap-6 ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              >
                {/* Card */}
                <div className="lg:w-5/12 w-full">
                  <div
                    className="rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-300"
                    style={{ backgroundColor: "white", borderColor: "#f0f0f0" }}
                  >
                    <span
                      className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{ backgroundColor: "#079A9D15", color: "#079A9D" }}
                    >
                      {m.year}
                    </span>
                    <h3
                      className="mt-3 text-lg font-bold"
                      style={{ fontFamily: "var(--font-poppins)", color: "#333333" }}
                    >
                      {m.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "#AAAAAA" }}>
                      {m.text}
                    </p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="hidden lg:flex w-2/12 justify-center">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: "#079A9D" }}
                    aria-hidden="true"
                  />
                </div>

                <div className="lg:w-5/12 hidden lg:block" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
