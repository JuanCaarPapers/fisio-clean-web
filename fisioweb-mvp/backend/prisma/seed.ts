import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Limpiar datos existentes en orden correcto
  await prisma.appointment.deleteMany()
  await prisma.block.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.professional.deleteMany()
  await prisma.treatment.deleteMany()

  // Tratamientos
  const treatments = await Promise.all([
    prisma.treatment.create({
      data: {
        name: 'Fisioterapia General',
        description: 'Evaluación y tratamiento de lesiones musculoesqueléticas mediante técnicas manuales y ejercicio terapéutico.',
        durationMins: 60,
        isActive: true,
      },
    }),
    prisma.treatment.create({
      data: {
        name: 'Masaje Deportivo',
        description: 'Técnicas de masaje específicas para deportistas orientadas a la recuperación muscular y prevención de lesiones.',
        durationMins: 45,
        isActive: true,
      },
    }),
    prisma.treatment.create({
      data: {
        name: 'Rehabilitación Postquirúrgica',
        description: 'Programa individualizado de recuperación funcional tras intervenciones quirúrgicas ortopédicas.',
        durationMins: 90,
        isActive: true,
      },
    }),
    prisma.treatment.create({
      data: {
        name: 'Electroterapia',
        description: 'Aplicación de corrientes eléctricas terapéuticas para alivio del dolor y estimulación muscular.',
        durationMins: 30,
        isActive: true,
      },
    }),
    prisma.treatment.create({
      data: {
        name: 'Punción Seca',
        description: 'Técnica invasiva de fisioterapia para el tratamiento de puntos gatillo miofasciales.',
        durationMins: 45,
        isActive: true,
      },
    }),
  ])

  console.log(`Creados ${treatments.length} tratamientos`)

  const profPassword = await bcrypt.hash('prof123', 12)

  // Profesionales
  const professionals = await Promise.all([
    prisma.professional.create({
      data: {
        name: 'María López García',
        email: 'maria.lopez@fisioweb.com',
        passwordHash: profPassword,
        specialty: 'Fisioterapia General y Deportiva',
        bio: 'Fisioterapeuta colegiada con más de 10 años de experiencia en el tratamiento de lesiones deportivas y patologías musculoesqueléticas. Especializada en terapia manual y ejercicio terapéutico.',
        isActive: true,
      },
    }),
    prisma.professional.create({
      data: {
        name: 'Carlos Ruiz Martínez',
        email: 'carlos.ruiz@fisioweb.com',
        passwordHash: profPassword,
        specialty: 'Fisioterapia Deportiva',
        bio: 'Fisioterapeuta especializado en medicina deportiva con experiencia en equipos de fútbol profesional. Experto en recuperación de lesiones de alta competición y rendimiento deportivo.',
        isActive: true,
      },
    }),
    prisma.professional.create({
      data: {
        name: 'Ana Torres Sánchez',
        email: 'ana.torres@fisioweb.com',
        passwordHash: profPassword,
        specialty: 'Fisioterapia Neurológica',
        bio: 'Fisioterapeuta con máster en neurorrehabilitación. Especializada en el tratamiento de pacientes con patologías neurológicas como ictus, Parkinson y esclerosis múltiple.',
        isActive: true,
      },
    }),
  ])

  console.log(`Creados ${professionals.length} profesionales`)

  // Disponibilidades: lunes a viernes (0-4), 09:00-18:00
  const diasLaborables = [0, 1, 2, 3, 4]

  for (const professional of professionals) {
    await prisma.availability.createMany({
      data: diasLaborables.map((dayOfWeek) => ({
        professionalId: professional.id,
        dayOfWeek,
        startTime: '09:00',
        endTime: '18:00',
      })),
    })
  }

  console.log(`Creadas disponibilidades para ${professionals.length} profesionales (lunes a viernes 09:00-18:00)`)

  // Paciente demo
  const patientPassword = await bcrypt.hash('demo1234', 12)
  const patient = await prisma.patient.create({
    data: {
      name: 'Paciente Demo',
      email: 'paciente@demo.com',
      phone: '600123456',
      passwordHash: patientPassword,
    },
  })

  console.log(`Creado paciente demo: ${patient.email}`)

  // Cita demo para el paciente (mañana a las 10:00)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setMinutes(tomorrowEnd.getMinutes() + treatments[0].durationMins)

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      professionalId: professionals[0].id,
      treatmentId: treatments[0].id,
      startTime: tomorrow,
      endTime: tomorrowEnd,
      status: 'CONFIRMED',
    },
  })

  console.log('Creada cita demo para el paciente')
  console.log('\nSeed completado.')
  console.log('Credenciales demo:')
  console.log('  Paciente:       paciente@demo.com / demo1234')
  console.log('  Profesionales:  *@fisioweb.com / prof123')
  console.log('  Admin:          admin@fisioweb.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
