import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@holiday-planner/shared'],
  webpack(config) {
    config.resolve.alias['react'] = path.resolve(__dirname, '../../node_modules/react')
    config.resolve.alias['react-dom'] = path.resolve(__dirname, '../../node_modules/react-dom')
    return config
  },
}

export default nextConfig
