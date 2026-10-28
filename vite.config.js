import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  base: '/company-portal/',
  server: {
    port: 3000,
    open: '/app-home.html'
  },
  build: {
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        appHome: resolve(__dirname, 'app-home.html'),
        uniform: resolve(__dirname, 'uniform.html'),
        welfare: resolve(__dirname, 'welfare.html'),
        resort:  resolve(__dirname, 'resort.html'),
        clothing:resolve(__dirname, 'clothing.html'),
        login:   resolve(__dirname, 'login.html'),
        register:resolve(__dirname, 'register.html'),
        chatbot:               resolve(__dirname, 'chatbot.html'),
        insightFeedback:       resolve(__dirname, 'insight-feedback.html'),
        payslip:               resolve(__dirname, 'payslip.html'),
        leaveBalance:          resolve(__dirname, 'leave-balance.html'),
        grievance:             resolve(__dirname, 'grievance.html'),
        attendanceDaily:       resolve(__dirname, 'attendance-daily.html'),
        attendanceSpecial:     resolve(__dirname, 'attendance-special.html'),
        attendanceCorrection:  resolve(__dirname, 'attendance-correction.html'),
        shiftSwap:             resolve(__dirname, 'shift-swap.html'),
      }
    }
  }
})
