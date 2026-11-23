import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

const basePath = (process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? '').replace(
  /\/$/,
  '',
);

export default function nextConfig(phase: string): NextConfig {
  return {
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.cache/next-dev' : '.next',
    output: 'export',
    trailingSlash: true,
    outputFileTracingRoot: process.cwd(),
    basePath,
    assetPrefix: basePath || undefined,
    images: { unoptimized: true },
  };
}
