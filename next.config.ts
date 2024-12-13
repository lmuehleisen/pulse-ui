import type { NextConfig } from 'next'

const allowedBots = '.*(bot|telegram|baidu|bing|yandex|iframely|whatsapp|facebook).*'

export default {
  async rewrites() {
    return [
      {
        source: '/:match*',
        destination: '/og_page',
        has: [{ key: 'user-agent', type: 'header', value: allowedBots }],
      },
    ]
  },
} as NextConfig
