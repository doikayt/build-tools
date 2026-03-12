import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { visit } from 'unist-util-visit'
import type { Root, Link, Image, Definition } from 'mdast'
import type { LinkKind, LinkRecord } from './types.js'

const IGNORED_SCHEMES = ['mailto:', 'tel:', 'data:', 'javascript:']

const SKIP_NODE_TYPES = new Set(['code', 'inlineCode', 'html'])

function classifyHref(href: string): LinkKind | null {
  for (const scheme of IGNORED_SCHEMES) {
    if (href.startsWith(scheme)) {
      return null
    }
  }
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return 'external'
  }
  if (href.startsWith('#')) {
    return 'fragment'
  }
  return 'relative'
}

function findManagedBlockRanges(
  markdownText: string,
  startMarker: string,
  endMarker: string
): Array<{ start: number; end: number }> {
  const lines = markdownText.split('\n')
  const ranges: Array<{ start: number; end: number }> = []
  let blockStart: number | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes(startMarker) && blockStart === null) {
      blockStart = i + 1
    } else if (line.includes(endMarker) && blockStart !== null) {
      ranges.push({ start: blockStart, end: i + 1 })
      blockStart = null
    }
  }

  return ranges
}

function isInManagedBlock(
  line: number,
  ranges: Array<{ start: number; end: number }>
): boolean {
  return ranges.some(range => line >= range.start && line <= range.end)
}

export function extractLinks(
  markdownText: string,
  options?: {
    managedBlockStartMarker?: string
    managedBlockEndMarker?: string
  }
): { links: LinkRecord[], skippedCount: number } {
  const startMarker = options?.managedBlockStartMarker ?? '<!-- TOC:START -->'
  const endMarker = options?.managedBlockEndMarker ?? '<!-- TOC:END -->'

  const managedRanges = findManagedBlockRanges(markdownText, startMarker, endMarker)
  const tree = unified().use(remarkParse).parse(markdownText) as Root

  const links: LinkRecord[] = []
  let skippedCount = 0

  visit(tree, (node) => {
    if (SKIP_NODE_TYPES.has(node.type)) {
      return 'skip'
    }

    if (node.type !== 'link' && node.type !== 'image' && node.type !== 'definition') {
      return
    }

    const typedNode = node as Link | Image | Definition
    const href = typedNode.url
    const line = node.position?.start.line ?? 0

    if (isInManagedBlock(line, managedRanges)) {
      skippedCount++
      return
    }

    const kind = classifyHref(href)
    if (kind === null) {
      skippedCount++
      return
    }

    links.push({ href: href, line: line, kind: kind })
  })

  return { links: links, skippedCount: skippedCount }
}
