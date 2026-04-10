import 'dotenv/config'
import { execSync } from 'child_process'
import app from './app'
import prisma from './prisma'

const PORT = process.env.PORT ?? 3000

async function main() {
  // Sincronizar schema con la base de datos
  console.log('Sincronizando schema de base de datos...')
  execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' })

  // Ejecutar seed si la BD está vacía
  const count = await prisma.professional.count()
  if (count === 0) {
    console.log('Base de datos vacía, ejecutando seed...')
    execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' })
  }

  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error('Error al iniciar el servidor:', err)
  process.exit(1)
})
