import { defineConfig } from 'vitepress'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Jezee's Blog",
  description: "A personal blog rebuilt with VitePress.",
  
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Archives', link: '/archives' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/zeehu/zeehu.github.io' }
    ]
  },

  // Hook that runs after the build is complete to generate sitemap
  buildEnd: async ({ outDir, pages }) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `
  <url>
    <loc>https://zeehu.github.io/${page.replace(/\.html$/, '')}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`).join('')}
</urlset>`

    writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap)
  },

  // Hook to transform the head of each page for SEO
  transformHead: ({ pageData }) => {
    const head = []
    const url = `https://zeehu.github.io/${pageData.relativePath.replace(/\.md$/, '.html')}`
    const title = pageData.frontmatter.title || "Jezee's Blog"
    const description = pageData.frontmatter.description || "A personal blog by Jezee, rebuilt with VitePress."

    // Add standard meta tags
    head.push(['meta', { name: 'description', content: description }])
    
    // Add Open Graph tags
    head.push(['meta', { property: 'og:url', content: url }])
    head.push(['meta', { property: 'og:title', content: title }])
    head.push(['meta', { property: 'og:description', content: description }])

    // Add Twitter card tags
    head.push(['meta', { name: 'twitter:card', content: 'summary' }])
    head.push(['meta', { name: 'twitter:title', content: title }])
    head.push(['meta', { name: 'twitter:description', content: description }])

    // Add canonical link
    head.push(['link', { rel: 'canonical', href: url }])

    return head
  }
})
