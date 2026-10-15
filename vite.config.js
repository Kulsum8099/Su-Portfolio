import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Only PORT is read here; server secrets in .env never reach the client
  // bundle (Vite exposes VITE_* variables only).
  const { PORT } = loadEnv(mode, process.cwd(), 'PORT')
  // `vite` and `vite preview` forward /api to the Node API (npm run dev:api).
  const proxy = { '/api': { target: `http://localhost:${PORT || 5050}` } }

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
    preview: { proxy },
  }
})
