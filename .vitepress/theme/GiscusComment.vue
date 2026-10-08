
<script setup>
import Giscus from '@giscus/vue'
import { useData } from 'vitepress'

const { isDark } = useData()
</script>

<template>
  <section class="comment-section">
    <h2>留言讨论</h2>
    <p class="comment-desc">
      欢迎交流技术问题，分享你的想法。
    </p>

    <Giscus
      id="comments"
      repo="zhaoyuasd/zhaoyuasd.github.io"
      repoId="R_kgDOGgQhsg"
      category="Announcements"
      categoryId="DIC_kwDOGgQhss4DHU04"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      :theme="isDark ? 'dark' : 'light'"
      lang="zh-CN"
      loading="lazy"
    />
  </section>
</template>

<style scoped>
.comment-section {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.comment-section h2 {
  margin-bottom: 8px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.comment-desc {
  margin-bottom: 24px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>