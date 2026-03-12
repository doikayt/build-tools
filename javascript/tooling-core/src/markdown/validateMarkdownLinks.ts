import fs from 'node:fs'
import { extractLinks } from './extractLinks.js'
import { parseHeadings } from './parseHeadings.js'
import { validateFragmentLink } from './validateFragmentLink.js'
import { validateRelativeLink } from './validateRelativeLink.js'
import { validateExternalLink } from './validateExternalLink.js'
import type {
  LinkValidationOptions,
  LinkValidationResult,
  LinkValidationError,
  LinkValidationWarning
} from './types.js'

const DEFAULT_CONCURRENCY = 5

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number
): Promise<T[]> {
  const results: T[] = []
  let index = 0

  async function worker(): Promise<void> {
    while (index < tasks.length) {
      const current = index++
      results[current] = await tasks[current]()
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker()
  )

  await Promise.all(workers)
  return results
}

export async function validateMarkdownLinks(
  filePath: string,
  options: LinkValidationOptions = {}
): Promise<LinkValidationResult> {
  const errors: LinkValidationError[] = []
  const warnings: LinkValidationWarning[] = []
  let validatedCount = 0

  const markdownText = fs.readFileSync(filePath, 'utf-8')

  const { links, skippedCount } = extractLinks(markdownText, {
    managedBlockStartMarker: options.managedBlockStartMarker,
    managedBlockEndMarker: options.managedBlockEndMarker
  })

  const headings = parseHeadings(markdownText)

  for (const link of links) {
    if (link.kind === 'fragment') {
      const error = validateFragmentLink(filePath, link, headings)
      if (error !== null) {
        errors.push(error)
      } else {
        validatedCount++
      }
    }

    if (link.kind === 'relative') {
      const error = validateRelativeLink(filePath, link)
      if (error !== null) {
        errors.push(error)
      } else {
        validatedCount++
      }
    }
  }

  const externalLinks = options.validateExternal !== false
    ? links.filter(l => l.kind === 'external')
    : []

  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY

  const externalTasks = externalLinks.map(link => async () => {
    const result = await validateExternalLink(filePath, link, options)
    return { link: link, result: result }
  })

  const externalResults = await runWithConcurrency(externalTasks, concurrency)

  for (const { result } of externalResults) {
    if (result === null) {
      validatedCount++
      continue
    }

    if ('reason' in result) {
      const isWarning =
        result.reason.startsWith('permanent redirect') ||
        result.reason.startsWith('5')

      if (isWarning) {
        warnings.push(result as LinkValidationWarning)
      } else {
        errors.push(result as LinkValidationError)
      }
    }
  }

  return {
    errors: errors,
    warnings: warnings,
    validatedCount: validatedCount,
    skippedCount: skippedCount
  }
}
