import { describe, test, expect } from 'vitest'
import { parseStandardCli } from '../../src/cli/parseStandardCli.js'

describe('parseStandardCli — link validation flags', () => {

  test('validateExternalLinks defaults to true', () => {
    const result = parseStandardCli([])
    expect(result.config.validateExternalLinks).toBe(true)
  })

  test('linkTimeoutMs defaults to 3000', () => {
    const result = parseStandardCli([])
    expect(result.config.linkTimeoutMs).toBe(3000)
  })

  test('--no-external-link-check sets validateExternalLinks to false', () => {
    const result = parseStandardCli(['--no-external-link-check'])
    expect(result.config.validateExternalLinks).toBe(false)
  })

  test('-n sets validateExternalLinks to false', () => {
    const result = parseStandardCli(['-n'])
    expect(result.config.validateExternalLinks).toBe(false)
  })

  test('--link-timeout-ms sets linkTimeoutMs', () => {
    const result = parseStandardCli(['--link-timeout-ms', '5000'])
    expect(result.config.linkTimeoutMs).toBe(5000)
  })

  test('-l sets linkTimeoutMs', () => {
    const result = parseStandardCli(['-l', '1000'])
    expect(result.config.linkTimeoutMs).toBe(1000)
  })

  test('--link-timeout-ms without value throws', () => {
    expect(() => parseStandardCli(['--link-timeout-ms'])).toThrow('requires a numeric value')
  })

  test('--link-timeout-ms with non-numeric value throws', () => {
    expect(() => parseStandardCli(['--link-timeout-ms', 'abc'])).toThrow('requires a numeric value')
  })

  test('--no-external-link-check and --link-timeout-ms combine correctly', () => {
    const result = parseStandardCli(['--no-external-link-check', '--link-timeout-ms', '2000'])
    expect(result.config.validateExternalLinks).toBe(false)
    expect(result.config.linkTimeoutMs).toBe(2000)
  })

})
