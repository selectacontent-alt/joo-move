export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/AdminPage/'],
    },
    sitemap: 'https://Al Rehab.com/sitemap.xml',
  }
}
