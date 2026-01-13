import { execSync } from 'child_process'

try {
  console.log('Running seed script...')
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' })
} catch (error) {
  console.error('Seed script failed:', error)
  process.exit(1)
}
