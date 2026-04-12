"use client"

import { useEffect, useRef, useState } from "react"

export function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (infoRef.current) {
            infoRef.current.style.transition = "opacity 0.7s ease, transform 0.7s ease"
            infoRef.current.style.opacity = "1"
            infoRef.current.style.transform = "translateX(0)"
          }
          setTimeout(() => {
            if (formRef.current) {
              formRef.current.style.transition = "opacity 0.7s ease, transform 0.7s ease"
              formRef.current.style.opacity = "1"
              formRef.current.style.transform = "translateX(0)"
            }
          }, 150)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const contactInfo = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 2C7.24 2 5 4.24 5 7C5 11 10 18 10 18C10 18 15 11 15 7C15 4.24 12.76 2 10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="10" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
      label: "Dirección",
      value: "Calle Mayor 42, 28001 Madrid",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 4H8L9.5 8L7.5 9C8.5 11 11 13.5 13 14.5L14 12.5L18 14V18C18 18 16 20 13 18C8 15 4 10 4 5C2 2 4 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      ),
      label: "Teléfono",
      value: "+34 91 123 45 67",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 7L10 12L17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      label: "Email",
      value: "info@fisioclean.es",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: "Horario",
      value: "Lun – Vie: 9:00 – 20:00",
    },
  ]

  return (
    <section id="contacto" className="py-24 lg:py-32 bg-white">
      <div ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#079A9D" }}>
            Contacto
          </span>
          <h2
            className="mt-3 text-4xl lg:text-5xl font-bold leading-tight text-balance"
            style={{ fontFamily: "var(--font-poppins)", color: "#333333" }}
          >
            Reserva tu cita
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "#AAAAAA" }}>
            Estamos aquí para ayudarte. Contacta con nosotros y uno de nuestros especialistas se pondrá en contacto contigo.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Info */}
          <div
            ref={infoRef}
            style={{ opacity: 0, transform: "translateX(-20px)" }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <div
              className="rounded-3xl p-8 flex flex-col gap-6"
              style={{ backgroundColor: "#F8FAFA" }}
            >
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#079A9D15", color: "#079A9D" }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#AAAAAA" }}>
                      {item.label}
                    </p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: "#333333" }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div
              className="rounded-3xl overflow-hidden h-40 flex items-center justify-center"
              style={{ backgroundColor: "#079A9D12" }}
            >
              <div className="text-center">
                <div style={{ color: "#079A9D" }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2" aria-hidden="true">
                    <path d="M16 3C11.6 3 8 6.6 8 11C8 17 16 29 16 29C16 29 24 17 24 11C24 6.6 20.4 3 16 3Z" stroke="#079A9D" strokeWidth="1.8" strokeLinejoin="round"/>
                    <circle cx="16" cy="11" r="3" stroke="#079A9D" strokeWidth="1.8"/>
                  </svg>
                </div>
                <p className="text-xs font-medium" style={{ color: "#079A9D" }}>Calle Mayor 42, Madrid</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div
            ref={formRef}
            style={{ opacity: 0, transform: "translateX(20px)" }}
            className="lg:col-span-3"
          >
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 rounded-3xl border" style={{ borderColor: "#f0f0f0" }}>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#079A9D15" }}
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <path d="M5 14L11 20L23 8" stroke="#079A9D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-poppins)", color: "#333333" }}>
                  ¡Solicitud enviada!
                </h3>
                <p className="text-sm" style={{ color: "#AAAAAA" }}>
                  Nos pondremos en contacto contigo en menos de 24 horas.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl p-8 border flex flex-col gap-5"
                style={{ borderColor: "#f0f0f0" }}
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    { name: "nombre", label: "Nombre", type: "text", placeholder: "Tu nombre" },
                    { name: "apellidos", label: "Apellidos", type: "text", placeholder: "Tus apellidos" },
                  ].map((field) => (
                    <div key={field.name} className="flex flex-col gap-1.5">
                      <label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#333333" }}>
                        {field.label}
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        required
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 placeholder:text-gray-300"
                        style={{ borderColor: "#e8e8e8", color: "#333333" }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#079A9D"; e.currentTarget.style.boxShadow = "0 0 0 3px #079A9D18" }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.boxShadow = "none" }}
                      />
                    </div>
                  ))}
                </div>

                {[
                  { name: "email", label: "Email", type: "email", placeholder: "tu@email.com" },
                  { name: "telefono", label: "Teléfono", type: "tel", placeholder: "+34 600 000 000" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#333333" }}>
                      {field.label}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      required
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 placeholder:text-gray-300"
                      style={{ borderColor: "#e8e8e8", color: "#333333" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#079A9D"; e.currentTarget.style.boxShadow = "0 0 0 3px #079A9D18" }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.boxShadow = "none" }}
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="servicio" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#333333" }}>
                    Servicio
                  </label>
                  <select
                    id="servicio"
                    name="servicio"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200"
                    style={{ borderColor: "#e8e8e8", color: "#333333" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#079A9D"; e.currentTarget.style.boxShadow = "0 0 0 3px #079A9D18" }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.boxShadow = "none" }}
                  >
                    <option value="">Selecciona un servicio</option>
                    <option>Fisioterapia deportiva</option>
                    <option>Rehabilitación</option>
                    <option>Osteopatía</option>
                    <option>Suelo pélvico</option>
                    <option>Pilates terapéutico</option>
                    <option>Readaptación funcional</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="mensaje" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#333333" }}>
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={4}
                    placeholder="Cuéntanos tu caso o realiza cualquier consulta..."
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 placeholder:text-gray-300 resize-none"
                    style={{ borderColor: "#e8e8e8", color: "#333333" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#079A9D"; e.currentTarget.style.boxShadow = "0 0 0 3px #079A9D18" }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.boxShadow = "none" }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  style={{ backgroundColor: "#079A9D" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0AB3B7" }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#079A9D" }}
                >
                  Solicitar cita
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
