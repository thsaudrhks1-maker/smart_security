
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 상위 폴더(../)의 .env 파일을 로드합니다.
  const env = loadEnv(mode, process.cwd() + '/../', '')

  return {
    envDir: '../', // .env 파일이 루트(상위 폴더)에 있음
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: parseInt(env.FRONT_PORT) || 3500, // .env에서 가져오거나 실패 시 3500
      host: "0.0.0.0",
      allowedHosts: ["safe.sogething.com", "localhost", "127.0.0.1"] // [허용 도메인 추가]
    }
  }
})
