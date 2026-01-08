# Jezee's Blog

<script setup>
import { data as posts } from './.vitepress/posts.data.ts'
</script>

<div v-for="post of posts" style="margin-bottom: 2.5em; border-bottom: 1px solid #eee; padding-bottom: 1.5em;">
  <h2>
    <a :href="post.url" style="text-decoration: none; color: inherit;">{{ post.title }}</a>
  </h2>
  <p style="color: #888; font-size: 0.9em;">{{ new Date(post.date).toLocaleDateString('en-CA') }}</p>
  <div v-if="post.excerpt" v-html="post.excerpt" class="excerpt"></div>
  <p><a :href="post.url">Read more...</a></p>
</div>
