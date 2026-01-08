<script setup>
import { useData, useRoute } from 'vitepress';
import { computed, onMounted, ref, watch, nextTick } from 'vue';

const { isDark } = useData();
const route = useRoute();
const commentsContainer = ref(null);

// Compute the Giscus theme based on VitePress's theme
const giscusTheme = computed(() => {
  return isDark.value ? 'dark' : 'light';
});

const loadGiscus = () => {
  if (!commentsContainer.value) return;
  
  // Remove existing Giscus script if any (to prevent duplicates on re-mount)
  commentsContainer.value.innerHTML = '';

  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.setAttribute('data-repo', 'zeehu/zeehu.github.io');
  script.setAttribute('data-repo-id', 'MDEwOlJlcG9zaXRvcnkxMjI3MjA0NTM=');
  script.setAttribute('data-category', 'Announcements');
  script.setAttribute('data-category-id', 'DIC_kwDOB1CQxc4Cx9Vl');
  script.setAttribute('data-mapping', 'pathname');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-input-position', 'bottom');
  script.setAttribute('data-theme', giscusTheme.value);
  script.setAttribute('data-lang', 'zh-CN');
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;

  commentsContainer.value.appendChild(script);
};

onMounted(() => {
  loadGiscus();
});

// Reload Giscus when theme changes
watch(isDark, () => {
  // Giscus provides a postMessage API to change theme without reloading, 
  // but reloading is simpler for now.
  // For better performance, we could use postMessage here.
  const iframe = document.querySelector('iframe.giscus-frame');
  if (!iframe) return;
  iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: giscusTheme.value } } }, 'https://giscus.app');
});

// Reload Giscus when route changes (for SPA navigation)
watch(
  () => route.path,
  async () => {
    await nextTick();
    loadGiscus();
  }
);
</script>

<template>
  <div class="giscus-wrapper" ref="commentsContainer"></div>
</template>
