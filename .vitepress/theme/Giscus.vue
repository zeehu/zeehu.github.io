<script setup>
import { useData } from 'vitepress';
import { computed } from 'vue';

// Get the current theme (light/dark) from VitePress
const { isDark } = useData();

// Compute the Giscus theme based on VitePress's theme
const giscusTheme = computed(() => {
  return isDark.value ? 'dark' : 'light';
});
</script>

<template>
  <div style="margin-top: 3rem; border-top: 1px solid #eee; padding-top: 2rem;">
    <component
      :is="'script'"
      src="https://giscus.app/client.js"
      data-repo="zeehu/zeehu.github.io"
      data-repo-id="MDEwOlJlcG9zaXRvcnkxMjI3MjA0NTM="
      data-category="Announcements"
      data-category-id="DIC_kwDOB1CQxc4Cx9Vl"
      data-mapping="pathname"
      data-strict="0"
      data-reactions-enabled="1"
      data-emit-metadata="0"
      data-input-position="bottom"
      :data-theme="giscusTheme"
      data-lang="zh-CN"
      crossorigin="anonymous"
      async
    ></component>
  </div>
</template>
