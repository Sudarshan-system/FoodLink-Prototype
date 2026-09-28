import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Enforce required Firebase environment variables on production builds
  if (command === 'build') {
    const isEmulatorBuild = env.VITE_USE_FIREBASE_EMULATOR === 'true'

    if (!isEmulatorBuild) {
      const requiredFirebaseVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID'
      ]

      const missing = requiredFirebaseVars.filter((key) => {
        const val = env[key]
        return !val || val.trim() === '' || val.includes('your_') || val.includes('_here')
      })

      if (missing.length > 0) {
        console.error('\n' + '='.repeat(70))
        console.error('❌ [FoodLink Build Error]: Missing Required Firebase Environment Variables!')
        console.error('='.repeat(70))
        console.error('Production builds require your live Firebase project configuration.\n')
        console.error('The following variables are missing or unset in your environment (.env.local):')
        missing.forEach((v) => console.error(`  - ${v}`))
        console.error('\nTo fix this:')
        console.error('  1. Copy .env.example to .env.local: (or create .env.local)')
        console.error('  2. Open Firebase Console -> Project Settings -> General -> Your apps -> Web app')
        console.error('  3. Paste your live project credentials into .env.local')
        console.error('='.repeat(70) + '\n')
        throw new Error(
          `Production build aborted: Missing ${missing.length} required Firebase environment variable(s). See instructions above.`
        )
      }
    }
  }

  return {
    plugins: [react()]
  }
})
