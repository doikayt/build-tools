import type {
  LinkRecord,
  LinkValidationError,
  LinkValidationWarning,
  LinkValidationOptions,
  ExternalLinkStatus
} from './types.js'

const DEFAULT_TIMEOUT_MS = 3000

function classifyStatus(status: number): ExternalLinkStatus {
  if (status === 301) {
    return { kind: 'warning', reason: `permanent redirect (${status})` }
  }
  if (status >= 302 && status < 400) {
    return { kind: 'valid' }
  }
  if (status >= 400) {
    return { kind: 'error', reason: `HTTP ${status}` }
  }
  return { kind: 'valid' }
}

async function fetchWithTimeout(
  url: string,
  method: 'HEAD' | 'GET',
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      method: method,
      signal: controller.signal,
      redirect: 'follow'
    })
  } finally {
    clearTimeout(timer)
  }
}

export async function validateExternalLink(
  sourceFilePath: string,
  link: LinkRecord,
  options: LinkValidationOptions
): Promise<LinkValidationError | LinkValidationWarning | null> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  options.onVerbose?.(`→ HTTP request: ${link.href}`)

  let response: Response

  try {
    response = await fetchWithTimeout(link.href, 'HEAD', timeoutMs)

    if (response.status === 405 || response.status === 501) {
      response = await fetchWithTimeout(link.href, 'GET', timeoutMs)
    }
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.name === 'AbortError' || err.message.includes('abort'))

    const reason = isTimeout ? 'timeout' : 'unreachable'

    return {
      file: sourceFilePath,
      line: link.line,
      link: link.href,
      reason: reason
    }
  }

  const status = classifyStatus(response.status)

  if (status.kind === 'error') {
    return {
      file: sourceFilePath,
      line: link.line,
      link: link.href,
      reason: status.reason
    }
  }

  if (status.kind === 'warning') {
    return {
      file: sourceFilePath,
      line: link.line,
      link: link.href,
      reason: status.reason
    }
  }

  options.onVerbose?.(`✓ Link validated: ${link.href}`)
  return null
}
