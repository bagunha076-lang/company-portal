import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  base: '/company-portal/',
  server: {
    port: 3000,
    open: '/index.html'
  },
  build: {
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        uniform: resolve(__dirname, 'uniform.html'),
        sports:  resolve(__dirname, 'sports.html'),
        welfare: resolve(__dirname, 'welfare.html'),
        resort:  resolve(__dirname, 'resort.html'),
        admin:   resolve(__dirname, 'admin.html'),
        clothing:resolve(__dirname, 'clothing.html'),
        login:   resolve(__dirname, 'login.html'),
        register:resolve(__dirname, 'register.html'),
      }
    }
  }
})
