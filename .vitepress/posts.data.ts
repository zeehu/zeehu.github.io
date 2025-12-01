import { createContentLoader } from 'vitepress'

interface Post {
  title: string
  url: string
  date: string
  excerpt: string | undefined
}

declare const data: Post[]
export { data }

export default createContentLoader('posts/*.md', {
  // Use the official excerpt function to customize extraction from raw markdown
  excerpt: (file) => {
    // Remove frontmatter
    const rawContent = file.content.replace(/---[\s\S]*?---/, '').trim();
    
    // A simple but effective excerpt: remove markdown special chars and take the first 150 chars.
    const plainText = rawContent
      .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // keep link text
      .replace(/[#*`~_>|-]/g, '')       // remove common markdown chars
      .replace(/\s+/g, ' ')             // collapse whitespace
      .trim();
    
    file.excerpt = plainText.slice(0, 150) + '...';
  },

  transform(raw): Post[] {
    return raw
      .filter(({ frontmatter }) => frontmatter.title && frontmatter.date)
      .map(p => ({
        title: p.frontmatter.title,
        url: p.url,
        excerpt: p.excerpt, // Use the pre-computed excerpt from the function above
        date: p.frontmatter.date
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
})
