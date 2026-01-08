# 项目上下文：Jezee's Blog (zeehu.github.io)

## 1. 项目概览

这是一个基于 [VitePress](https://vitepress.dev/) 构建的个人博客项目，目前托管于 GitHub Pages。
项目源码曾基于 Hexo，现已重构为 VitePress。主要用于发布技术文章和个人笔记。

**核心技术栈：**
*   **框架**: VitePress (Vue 3 + Vite)
*   **语言**: TypeScript, Markdown, CSS
*   **包管理**: NPM

## 2. 环境搭建与运行

确保本地已安装 Node.js 环境。

### 常用命令 (Scripts)

在项目根目录下运行以下命令：

*   **安装依赖**:
    ```bash
    npm install
    ```
*   **启动开发服务器** (热重载):
    ```bash
    npm run docs:dev
    ```
    默认地址: `http://localhost:5173`
*   **构建生产版本**:
    ```bash
    npm run docs:build
    ```
    构建产物位于 `.vitepress/dist`。
*   **本地预览生产构建**:
    ```bash
    npm run docs:preview
    ```

## 3. 项目结构说明

*   **`posts/`**: 存放博客文章的主要目录，格式为 Markdown。
*   **`.vitepress/`**: VitePress 的核心配置目录。
    *   `config.ts`: 站点主要配置文件。包含导航栏配置、SEO `transformHead` 钩子以及 Sitemap 生成逻辑 (`buildEnd` 钩子)。
    *   `theme/`: 自定义主题配置。
        *   `index.ts`: 主题入口。
        *   `Layout.vue`: 自定义布局组件。
        *   `custom.css`: 全局样式覆盖。
        *   `Giscus.vue`: (推测) 评论系统组件。
    *   `posts.data.ts`: (推测) 用于生成文章列表或归档的数据加载器。
*   **`public/`**: 静态资源目录 (如 `robots.txt`)，构建时会直接复制到根目录。
*   **`deploy.sh`**: 部署脚本，用于将构建产物推送到 GitHub Pages 分支。
*   **`archives.md`**: 归档页面入口。
*   **`index.md`**: 首页入口。

## 4. 开发规范与注意事项

*   **文章撰写**: 新文章建议放置在 `posts/` 目录下。
*   **Frontmatter**: Markdown 文件头部通常包含 YAML 格式的元数据 (title, date, description 等)，用于 SEO 和列表生成。
*   **SEO**: 项目在 `config.ts` 中配置了自动化 SEO 标签注入 (Open Graph, Twitter Card, Canonical URL)。
*   **Sitemap**: 构建完成后会自动在 `dist` 目录下生成 `sitemap.xml`。
*   **Git**: 提交前请确保没有将敏感信息或不必要的构建产物 (dist, node_modules) 提交。

## 5. 部署流程

通常通过运行 `deploy.sh` 脚本进行部署（需检查脚本具体逻辑，通常涉及构建并推送到 `gh-pages` 分支）。

```bash
sh deploy.sh
```
