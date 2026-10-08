
<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import GiscusComment from './GiscusComment.vue'

const { frontmatter, page } = useData()
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-after>
      <GiscusComment
        v-if="!frontmatter.commentDisabled && !page.isNotFound"
      />
    </template>
  </DefaultTheme.Layout>
</template>