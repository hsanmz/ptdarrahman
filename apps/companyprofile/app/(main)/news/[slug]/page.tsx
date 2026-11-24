import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getNewsBySlug, getNewsCached } from '@/app/lib/api'
import { mergeNewsArticles, fallbackNews } from '@/app/lib/news'
import { fetchActivePpdbWave } from '@/app/lib/ppdb'
import { resolveImageSrc, getSafeImageSrc } from '@/app/lib/image-file'
import type { NewsArticle } from '@/app/lib/types'
import NewsDetailClient from './_components/NewsDetailClient'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  let article: NewsArticle | null = null
  try {
    article = await getNewsBySlug(slug)
  } catch {
    article = null
  }

  if (!article) {
    let allNews: NewsArticle[] | null = null
    try { allNews = await getNewsCached() } catch { allNews = null }
    const sourceNews = allNews && allNews.length > 0 ? allNews : fallbackNews()
    article = mergeNewsArticles(sourceNews).find((a) => a.slug === slug) ?? null
  }

  if (!article) {
    return { title: 'Berita Tidak Ditemukan' }
  }

  const imageUrl = getSafeImageSrc(article.image, 'news')

  return {
    title: article.content?.title,
    description: article.content?.excerpt,
    openGraph: {
      title: `${article.content?.title} | PTDARRAHMAN`,
      description: article.content?.excerpt,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.content?.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.content?.title} | PTDARRAHMAN`,
      description: article.content?.excerpt,
      images: [imageUrl],
    },
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let article: NewsArticle | null = null
  try {
    article = await getNewsBySlug(slug)
  } catch {
    article = null
  }

  let allNews: NewsArticle[] | null = null
  try { allNews = await getNewsCached() } catch { allNews = null }
  const sourceNews = allNews && allNews.length > 0 ? allNews : fallbackNews()
  const safeNews = mergeNewsArticles(sourceNews)

  if (!article) {
    article = safeNews.find((a) => a.slug === slug) ?? null
  }

  if (!article || !article.content) notFound()

  // Pastikan content dan body terisi
  const articleContent = { ...article.content }
  if (!articleContent.content && articleContent.body) {
    articleContent.content = articleContent.body
  }
  if (!articleContent.body && articleContent.content) {
    articleContent.body = articleContent.content
  }

  const sanitizedArticle: NewsArticle = {
    ...article,
    image: getSafeImageSrc(article.image, 'news'),
    content: articleContent,
  }

  let wave = null
  try { wave = await fetchActivePpdbWave() } catch { wave = null }
  return <NewsDetailClient article={sanitizedArticle} allNews={safeNews} wave={wave} />
}
