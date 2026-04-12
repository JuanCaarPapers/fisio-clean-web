import Link from "next/link"

const quickLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Quiénes somos", href: "#quienes-somos" },
  { label: "Nuestra historia", href: "#historia" },
  { label: "Servicios", href: "#servicios" },
  { label: "Equipo", href: "#equipo" },
  { label: "Contacto", href: "#contacto" },
]

const services = [
  "Fisioterapia deportiva",
  "Rehabilitación",
  "Osteopatía",
  "Suelo pélvico",
  "Pilates terapéutico",
  "Readaptación funcional",
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{ backgroundColor: "#333333", color: "white" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#079A9D" }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M9 2C9 2 4 5 4 9.5C4 12.5 6.5 15 9 15C11.5 15 14 12.5 14 9.5C14 5 9 2 9 2Z" fill="white" opacity="0.9"/>
                  <path d="M9 5C9 5 6.5 7 6.5 9.5C6.5 11 7.6 12 9 12C10.4 12 11.5 11 11.5 9.5C11.5 7 9 5 9 5Z" fill="white"/>
                </svg>
              </div>
              <span
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Fisio<span style={{ color: "#079A9D" }}>Clean</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Clínica especializada en fisioterapia avanzada y recuperación funcional con más de 15 años de experiencia.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { label: "Instagram", path: "M8 2H12C14.2 2 16 3.8 16 6V10C16 12.2 14.2 14 12 14H8C5.8 14 4 12.2 4 10V6C4 3.8 5.8 2 8 2Z M10 7C10 8.66 8.66 10 7 10" },
                { label: "Facebook", path: "M10 2C6.69 2 4 4.69 4 8C4 11.31 6.69 14 10 14V9H8V7H10V5.5C10 3.57 11.07 2.5 12.83 2.5C13.68 2.5 14.5 2.65 14.5 2.65V4.5H13.6C12.7 4.5 12.5 5.07 12.5 5.64V7H14.4L14.08 9H12.5V14C14.81 13.61 16.5 11.56 16.5 9.1C16.5 5.79 13.81 2.5 10 2.5" },
                { label: "LinkedIn", path: "M3.5 5H5.5V13H3.5V5ZM4.5 4C5.05 4 5.5 3.55 5.5 3C5.5 2.45 5.05 2 4.5 2C3.95 2 3.5 2.45 3.5 3C3.5 3.55 3.95 4 4.5 4ZM7 5H8.9V5.9H8.93C9.2 5.37 9.9 4.8 10.9 4.8C12.9 4.8 13.3 6.1 13.3 7.8V13H11.3V8.2C11.3 7.4 11.28 6.4 10.2 6.4C9.1 6.4 8.93 7.23 8.93 8.15V13H7V5Z" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[#079A9D]"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="white" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: "rgba(255,255,255,0.8)" }}>
              Navegación
            </h3>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-[#0AB3B7]"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: "rgba(255,255,255,0.8)" }}>
              Servicios
            </h3>
            <ul className="flex flex-col gap-3">
              {services.map((s) => (
                <li key={s}>
                  <a
                    href="#servicios"
                    className="text-sm transition-colors duration-200 hover:text-[#0AB3B7]"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: "rgba(255,255,255,0.8)" }}>
              Contacto
            </h3>
            <ul className="flex flex-col gap-4">
              {[
                { icon: "📍", label: "Calle Mayor 42, 28001 Madrid" },
                { icon: "📞", label: "+34 91 123 45 67" },
                { icon: "✉️", label: "info@fisioclean.es" },
                { icon: "🕐", label: "Lun – Vie: 9:00 – 20:00" },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className="text-sm mt-0.5" aria-hidden="true">{item.icon}</span>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{item.label}</span>
                </li>
              ))}
            </ul>
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: "#079A9D" }}
            >
              Pedir cita
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7H11M11 7L8 4M11 7L8 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            © {currentYear} FisioClean. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {["Política de privacidad", "Aviso legal", "Cookies"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs transition-colors duration-200 hover:text-[#0AB3B7]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
