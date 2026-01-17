import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@services': path.resolve(__dirname, './src/services'),
            '@store': path.resolve(__dirname, './src/store'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@types': path.resolve(__dirname, './src/types'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://ems-backend-q0vm.onrender.com',
                changeOrigin: true,
                secure: true,
            },
            '/uploads': {
                target: 'https://ems-backend-q0vm.onrender.com',
                changeOrigin: true,
                secure: true,
            },
            '/socket.io': {
                target: 'https://ems-backend-q0vm.onrender.com',
                changeOrigin: true,
                ws: true,
                secure: true,
            },
        },
    },
})
