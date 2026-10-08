import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '老赵的博客',
  description: '技术永不眠',
 // srcDir: 'docs',
  lang: 'zh-CN',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'SpringCloud', link: '/SpringCloud/' }
    ],

    sidebar: {
      '/SpringCloud/': [
        {
          text: 'SpringCloud',
          items: [
            { text: 'SpringCloud整合nacos', link: '/SpringCloud/nacos-load' },
           
          ]
        }
      ]

     
     
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/zhaoyuasd'
      }
    ],

    search: {
      provider: 'local'
    },

    outline: {
      level: [1, 5]
    },

    footer: {
      message: '技术永不眠',
      copyright: 'Copyright © 2026 老赵'
    }
  }
})