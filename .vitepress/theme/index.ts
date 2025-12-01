import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  // Use our custom layout component
  Layout: Layout,
  enhanceApp({ app, router, siteData }) {
    // You can register global components or do other app-level setup here
  }
} satisfies Theme
