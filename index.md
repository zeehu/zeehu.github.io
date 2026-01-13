# Jezee's Blog

<script setup>
import { data as posts } from './.vitepress/posts.data.ts'
</script>

<div class="posts-container">
  <article v-for="post of posts" class="post-card">
    <div class="post-content">
      <h2 class="post-title">
        <a :href="post.url">{{ post.title }}</a>
      </h2>
      <div class="post-meta">
        <time :datetime="post.date">{{ new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) }}</time>
      </div>
      <div v-if="post.excerpt" v-html="post.excerpt" class="post-excerpt"></div>
      <a :href="post.url" class="read-more">
        阅读全文
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>
  </article>
</div>
