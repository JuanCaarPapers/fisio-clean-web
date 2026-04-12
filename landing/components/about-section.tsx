"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

function useIntersection(ref: React.RefObject<Element | null>, options?: IntersectionObserverInit) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("intersected")
          observer.disconnect()
        }
      },
      { threshold: 0.2, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, options])
}

export function AboutSection() {
  const textRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (textRef.current) {
            textRef.current.style.transition = "opacity 0.7s ease, transform 0.7s ease"
            textRef.current.style.opacity = "1"
            textRef.current.style.transform = "translateX(0)"
          }
          setTimeout(() => {
            if (imageRef.current) {
              imageRef.current.style.transition = "opacity 0.8s ease, transform 0.8s ease"
              imageRef.current.style.opacity = "1"
              imageRef.current.style.transform = "scale(1)"
            }
          }, 150)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="quienes-somos" className="py-24 lg:py-32 bg-white">
      <div ref={wrapRef} className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div
            ref={textRef}
            style={{ opacity: 0, transform: "translateX(-30px)" }}
            className="flex flex-col gap-6"
          >
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#079A9D" }}
              >
                Quiénes somos
              </span>
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold leading-tight text-balance"
              style={{ fontFamily: "var(--font-poppins)", color: "#333333" }}
            >
              Tu salud,{" "}
              <span style={{ color: "#079A9D" }}>nuestra prioridad</span>
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#AAAAAA" }}>
              En FisioClean somos un equipo de fisioterapeutas apasionados por la salud y el bienestar de nuestros pacientes. Combinamos conocimiento clínico de vanguardia con un trato humano y cercano.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "#AAAAAA" }}>
              Nuestro enfoque integrador nos permite tratar a cada paciente de forma individualizada, diseñando planes de recuperación adaptados a sus necesidades específicas para obtener los mejores resultados posibles.
            </p>
            <div className="flex flex-col gap-4 pt-2">
              {[
                "Tratamientos avalados por la evidencia científica",
                "Equipamiento de última generación",
                "Atención personalizada y seguimiento continuo",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: "#079A9D15" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5L4 7L8 3" stroke="#079A9D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm leading-relaxed" style={{ color: "#333333" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div
            ref={imageRef}
            style={{ opacity: 0, transform: "scale(0.95)" }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-xl" style={{ aspectRatio: "4/3" }}>
              <Image
                src="/images/about-clinic.jpg"
                alt="Interior de la clínica FisioClean"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Accent */}
            <div
              className="absolute -bottom-5 -right-5 w-24 h-24 rounded-2xl -z-10"
              style={{ backgroundColor: "#079A9D20" }}
              aria-hidden="true"
            />
            {/* Floating badge */}
            <div
              className="absolute -top-5 -left-5 rounded-2xl p-4 shadow-lg"
              style={{ backgroundColor: "white" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#B298DC15" }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M10 2C10 2 4 6 4 11C4 14.3 6.7 17 10 17C13.3 17 16 14.3 16 11C16 6 10 2 10 2Z" stroke="#B298DC" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M7 10.5L9 12.5L13 8.5" stroke="#B298DC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ fontFamily: "var(--font-poppins)", color: "#333333" }}>Certificados</p>
                  <p className="text-xs" style={{ color: "#AAAAAA" }}>ISO 9001 calidad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
