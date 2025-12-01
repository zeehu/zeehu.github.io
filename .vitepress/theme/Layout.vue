<script setup>
import DefaultTheme from 'vitepress/theme'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import Giscus from './Giscus.vue' // Import Giscus

const { Layout } = DefaultTheme
const route = useRoute()

// This function will only be called on the client
const setupBusuanzi = () => {
  const script = document.createElement('script')
  script.src = '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'
  script.async = true
  document.body.appendChild(script)

  watch(
    () => route.path,
    () => {
      setTimeout(() => {
        // Ensure busuanzi is loaded before fetching
        if (window.busuanzi) {
          window.busuanzi.fetch()
        }
      }, 300)
    }
  )
}

// Register the setup function to run only on the client-side
onMounted(() => {
  setupBusuanzi()
})
</script>

<template>
  <Layout>
    <!-- Slot for per-page view count -->
    <template #doc-footer-before>
      <div class="doc-footer-busuanzi" style="margin-top: 2rem; text-align: center; color: #888; font-size: 0.9em;">
        <span id="busuanzi_container_page_pv">
          本文总阅读量 <span id="busuanzi_value_page_pv"></span> 次
        </span>
      </div>
    </template>

    <!-- Slot for Giscus comments -->
    <template #doc-after>
      <Giscus />
    </template>

    <!-- Slot for site-wide stats in the footer -->
    <template #layout-bottom>
        <div class="site-footer-busuanzi" style="border-top: 1px solid #eee; margin-top: 2rem; padding: 2rem 0; text-align: center; color: #888; font-size: 0.9em;">
            <span id="busuanzi_container_site_pv">
                本站总访问量 <span id="busuanzi_value_site_pv"></span> 次
            </span>
            <span style="margin: 0 0.5em;">|</span>
            <span id="busuanzi_container_site_uv">
                本站访客数 <span id="busuanzi_value_site_uv"></span> 人次
            </span>
        </div>
    </template>
  </Layout>
</template>
