import {config} from 'dotenv'
import type {NextConfig} from 'next'

// One .env at the repo root is shared by the Studio, the seed script and this app.
config({path: '../.env', quiet: true})

const nextConfig: NextConfig = {}

export default nextConfig
