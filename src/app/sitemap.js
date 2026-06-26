export default function sitemap() {
  // Hardcoding only your primary public domain entry points.
  // This explicitly keeps your backend APIs and any internal route structures entirely unmapped and secure.
  return [
    {
      url: 'https://krishnakumar.tech',
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 1.0, // Maximum weight for your primary engineering domain
    },
    {
      url: 'https://pebble.krishnakumar.tech',
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.9, // High authority weight for your native compiler infrastructure
    }
  ];
}