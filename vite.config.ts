import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // if theres an error here, run "npm i" in terminal
// run this also: npm install react-router-dom

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
