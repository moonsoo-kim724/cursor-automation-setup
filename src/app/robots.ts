import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/admin/', '/dashboard/', '/api/'],
    },
    sitemap: 'https://ysk-eye.clinic/sitemap.xml',
  }
}
