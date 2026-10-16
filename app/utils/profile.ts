export const SITE_URL = 'https://rezansrv.ir'
export const PROFILE_IMAGE_URL = `${SITE_URL}/images/me.jpg`

export const profile = {
  name: 'Reza Naserivand',
  persianName: 'رضا ناصری‌وند',
  alternateNames: [
    'Reza Naseri Vand',
    'رضا ناصری وند',
    'رضا ناصریوند',
  ],
  jobTitle: 'Software Engineer',
  url: SITE_URL,
  image: PROFILE_IMAGE_URL,
  sameAs: [
    'https://github.com/rezansrv',
    'https://www.linkedin.com/in/reza-naserivand',
  ],
  knowsAbout: [
    'Software engineering',
    'Web development',
    'Vue.js',
    'Nuxt',
    'React',
    'SQL Server',
    'Data-intensive systems',
    'Artificial intelligence',
    'Computer vision',
    'Medical image analysis',
  ],
} as const

export function siteUrlFor(path: string) {
  return new URL(path, SITE_URL).toString()
}

export function createPersonSchema(description: string) {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: profile.name,
    alternateName: [profile.persianName, ...profile.alternateNames],
    url: profile.url,
    image: profile.image,
    description,
    jobTitle: profile.jobTitle,
    sameAs: [...profile.sameAs],
    knowsAbout: [...profile.knowsAbout],
  }
}
