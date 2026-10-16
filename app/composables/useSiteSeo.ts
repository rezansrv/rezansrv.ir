import { PROFILE_IMAGE_URL, siteUrlFor } from '~/utils/profile'

type SiteLanguage = 'en' | 'fa'

type SiteSeoOptions = {
  path: string
  title: string
  description: string
  language?: SiteLanguage
}

const localeByLanguage: Record<SiteLanguage, string> = {
  en: 'en_US',
  fa: 'fa_IR',
}

export function useSiteSeo(options: SiteSeoOptions) {
  const language = options.language ?? 'en'
  const canonicalUrl = siteUrlFor(options.path)

  useSeoMeta({
    title: options.title,
    description: options.description,
    robots: 'index, follow',
    author: 'Reza Naserivand',
    ogTitle: options.title,
    ogDescription: options.description,
    ogType: 'website',
    ogUrl: canonicalUrl,
    ogSiteName: 'Reza Naserivand',
    ogLocale: localeByLanguage[language],
    ogImage: PROFILE_IMAGE_URL,
    ogImageAlt: 'Portrait of Reza Naserivand',
    ogImageType: 'image/jpeg',
    ogImageWidth: 1538,
    ogImageHeight: 1538,
    twitterCard: 'summary',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: PROFILE_IMAGE_URL,
    twitterImageAlt: 'Portrait of Reza Naserivand',
  })

  useHead({
    htmlAttrs: {
      lang: language,
      dir: language === 'fa' ? 'rtl' : 'ltr',
    },
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
  })

  return canonicalUrl
}
