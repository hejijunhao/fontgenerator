import { useEffect } from 'react'
import type { AppRoute } from '@/lib/navigation'
import { absoluteUrl, metaForRoute } from '@/lib/pageMeta'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string) {
  const selector = `link[rel="${rel}"]`
  let el = document.head.querySelector(selector) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

export function usePageMeta(route: AppRoute) {
  useEffect(() => {
    const meta = metaForRoute(route)
    const url = absoluteUrl(meta.path)

    document.title = meta.title
    upsertMeta('name', 'description', meta.description)
    upsertLink('canonical', url)

    upsertMeta('property', 'og:title', meta.title)
    upsertMeta('property', 'og:description', meta.description)
    upsertMeta('property', 'og:type', meta.ogType)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:site_name', 'Glyphmill')
    upsertMeta('property', 'og:image', absoluteUrl(meta.ogImage))
    upsertMeta('property', 'og:image:width', '1200')
    upsertMeta('property', 'og:image:height', '630')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', meta.title)
    upsertMeta('name', 'twitter:description', meta.description)
    upsertMeta('name', 'twitter:image', absoluteUrl(meta.ogImage))

    if (meta.modifiedTime) {
      upsertMeta('property', 'article:modified_time', meta.modifiedTime)
    } else {
      document.head.querySelector('meta[property="article:modified_time"]')?.remove()
    }
  }, [route])
}