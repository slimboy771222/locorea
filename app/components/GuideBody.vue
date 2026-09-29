<script setup lang="ts">
type InlinePart = {
  type: 'text' | 'strong' | 'link'
  value: string
  href?: string
}

type ContentBlock = {
  type: 'heading-2' | 'heading-3' | 'paragraph' | 'unordered-list' | 'ordered-list' | 'blockquote' | 'callout'
  content?: InlinePart[]
  items?: InlinePart[][]
  title?: string
}

const props = defineProps<{ content: string }>()

const parseInline = (value: string): InlinePart[] => {
  const parts: InlinePart[] = []
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^\s)]+\))/g
  let position = 0

  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > position) parts.push({ type: 'text', value: value.slice(position, index) })

    const token = match[0] ?? ''
    if (token.startsWith('**')) {
      parts.push({ type: 'strong', value: token.slice(2, -2) })
    }
    else {
      const link = token.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/)
      const href = link?.[2]
      if (link && href && (/^https?:\/\//.test(href) || /^\/(?!\/)/.test(href))) {
        parts.push({ type: 'link', value: link[1] ?? token, href })
      }
      else {
        parts.push({ type: 'text', value: link?.[1] ?? token })
      }
    }

    position = index + token.length
  }

  if (position < value.length) parts.push({ type: 'text', value: value.slice(position) })
  return parts.length ? parts : [{ type: 'text', value }]
}

const isBlockStart = (line: string) => /^(#{1,3}\s+|[-*+]\s+|\d+\.\s+|>\s*)/.test(line)
const isCalloutHeading = (value: string) => /^(locorea|local) tip$|^(important|note|warning)$/i.test(value.trim())

const blocks = computed<ContentBlock[]>(() => {
  const lines = props.content.replace(/\r\n/g, '\n').split('\n')
  const parsed: ContentBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = (lines[index] ?? '').trim()
    if (!line) {
      index += 1
      continue
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      const depth = heading[1]?.length ?? 0
      const text = heading[2] ?? ''
      if (depth > 1) parsed.push({ type: depth === 2 ? 'heading-2' : 'heading-3', content: parseInline(text) })
      index += 1
      continue
    }

    if (/^[-*+]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line)
      const pattern = ordered ? /^\d+\.\s+(.+)$/ : /^[-*+]\s+(.+)$/
      const items: InlinePart[][] = []
      while (index < lines.length) {
        const item = (lines[index] ?? '').trim().match(pattern)
        if (!item) break
        items.push(parseInline(item[1] ?? ''))
        index += 1
      }
      parsed.push({ type: ordered ? 'ordered-list' : 'unordered-list', items })
      continue
    }

    const quote = line.match(/^>\s*(.+)$/)
    if (quote) {
      parsed.push({ type: 'blockquote', content: parseInline(quote[1] ?? '') })
      index += 1
      continue
    }

    const paragraph: string[] = []
    while (index < lines.length && (lines[index] ?? '').trim() && !isBlockStart((lines[index] ?? '').trim())) {
      paragraph.push((lines[index] ?? '').trim())
      index += 1
    }
    parsed.push({ type: 'paragraph', content: parseInline(paragraph.join(' ')) })
  }

  return parsed.reduce<ContentBlock[]>((formatted, block) => {
    const previous = formatted.at(-1)
    const title = previous?.type === 'heading-2' ? previous.content?.map(part => part.value).join('') : ''
    if (previous && title && isCalloutHeading(title) && block.type === 'paragraph') {
      formatted[formatted.length - 1] = { type: 'callout', title, content: block.content }
      return formatted
    }
    formatted.push(block)
    return formatted
  }, [])
})

const isExternalLink = (href?: string) => Boolean(href?.startsWith('http'))
</script>

<template>
  <div class="text-[16px] leading-7 text-slate-700 sm:text-[17px] sm:leading-8">
    <template v-for="(block, blockIndex) in blocks" :key="blockIndex">
      <h2 v-if="block.type === 'heading-2'" class="mt-9 text-2xl font-bold tracking-tight text-slate-950 first:mt-0"><template v-for="(part, partIndex) in block.content" :key="partIndex"><strong v-if="part.type === 'strong'" class="font-bold">{{ part.value }}</strong><a v-else-if="part.type === 'link'" :href="part.href" :target="isExternalLink(part.href) ? '_blank' : undefined" :rel="isExternalLink(part.href) ? 'noreferrer' : undefined" class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-800">{{ part.value }}</a><template v-else>{{ part.value }}</template></template></h2>
      <h3 v-else-if="block.type === 'heading-3'" class="mt-7 text-lg font-bold text-slate-900"><template v-for="(part, partIndex) in block.content" :key="partIndex"><strong v-if="part.type === 'strong'" class="font-bold">{{ part.value }}</strong><a v-else-if="part.type === 'link'" :href="part.href" :target="isExternalLink(part.href) ? '_blank' : undefined" :rel="isExternalLink(part.href) ? 'noreferrer' : undefined" class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-800">{{ part.value }}</a><template v-else>{{ part.value }}</template></template></h3>
      <p v-else-if="block.type === 'paragraph'" class="mt-4"><template v-for="(part, partIndex) in block.content" :key="partIndex"><strong v-if="part.type === 'strong'" class="font-semibold text-slate-900">{{ part.value }}</strong><a v-else-if="part.type === 'link'" :href="part.href" :target="isExternalLink(part.href) ? '_blank' : undefined" :rel="isExternalLink(part.href) ? 'noreferrer' : undefined" class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-800">{{ part.value }}</a><template v-else>{{ part.value }}</template></template></p>
      <ul v-else-if="block.type === 'unordered-list'" class="mt-4 space-y-2 pl-5 marker:text-blue-600"><li v-for="(item, itemIndex) in block.items" :key="itemIndex" class="pl-1"><template v-for="(part, partIndex) in item" :key="partIndex"><strong v-if="part.type === 'strong'" class="font-semibold text-slate-900">{{ part.value }}</strong><a v-else-if="part.type === 'link'" :href="part.href" :target="isExternalLink(part.href) ? '_blank' : undefined" :rel="isExternalLink(part.href) ? 'noreferrer' : undefined" class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-800">{{ part.value }}</a><template v-else>{{ part.value }}</template></template></li></ul>
      <ol v-else-if="block.type === 'ordered-list'" class="mt-4 space-y-2 pl-5 marker:font-semibold marker:text-blue-700"><li v-for="(item, itemIndex) in block.items" :key="itemIndex" class="pl-1"><template v-for="(part, partIndex) in item" :key="partIndex"><strong v-if="part.type === 'strong'" class="font-semibold text-slate-900">{{ part.value }}</strong><a v-else-if="part.type === 'link'" :href="part.href" :target="isExternalLink(part.href) ? '_blank' : undefined" :rel="isExternalLink(part.href) ? 'noreferrer' : undefined" class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-800">{{ part.value }}</a><template v-else>{{ part.value }}</template></template></li></ol>
      <blockquote v-else-if="block.type === 'blockquote'" class="mt-5 border-l-2 border-blue-200 pl-4 text-slate-600"><template v-for="(part, partIndex) in block.content" :key="partIndex"><strong v-if="part.type === 'strong'" class="font-semibold text-slate-900">{{ part.value }}</strong><a v-else-if="part.type === 'link'" :href="part.href" :target="isExternalLink(part.href) ? '_blank' : undefined" :rel="isExternalLink(part.href) ? 'noreferrer' : undefined" class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-800">{{ part.value }}</a><template v-else>{{ part.value }}</template></template></blockquote>
      <aside v-else-if="block.type === 'callout'" class="mt-7 rounded-xl border border-blue-100 bg-blue-50/70 p-5 text-[15px] leading-6 text-slate-700 sm:text-base"><p class="font-semibold text-blue-800">{{ block.title }}</p><p class="mt-2"><template v-for="(part, partIndex) in block.content" :key="partIndex"><strong v-if="part.type === 'strong'" class="font-semibold text-slate-900">{{ part.value }}</strong><a v-else-if="part.type === 'link'" :href="part.href" :target="isExternalLink(part.href) ? '_blank' : undefined" :rel="isExternalLink(part.href) ? 'noreferrer' : undefined" class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-800">{{ part.value }}</a><template v-else>{{ part.value }}</template></template></p></aside>
    </template>
  </div>
</template>
