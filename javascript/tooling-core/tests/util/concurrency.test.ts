import { describe, test, expect } from 'vitest'
import { runWithConcurrency } from '../../src/util/concurrency.js'

function makeTask<T>(value: T, delayMs = 0): () => Promise<T> {
  return () => new Promise(resolve => setTimeout(() => resolve(value), delayMs))
}

function makeFailingTask(message: string): () => Promise<never> {
  return () => Promise.reject(new Error(message))
}

describe('runWithConcurrency()', () => {

  test('empty task list returns empty array', async () => {
    const results = await runWithConcurrency([], 5)
    expect(results).toEqual([])
  })

  test('single task returns single result', async () => {
    const results = await runWithConcurrency([makeTask('a')], 5)
    expect(results).toEqual(['a'])
  })

  test('preserves result order regardless of completion order', async () => {
    const tasks = [
      makeTask('slow', 30),
      makeTask('fast', 0),
      makeTask('medium', 15)
    ]
    const results = await runWithConcurrency(tasks, 3)
    expect(results).toEqual(['slow', 'fast', 'medium'])
  })

  test('concurrency=1 runs tasks serially in order', async () => {
    const order: number[] = []
    const tasks = [0, 1, 2].map(i => async () => {
      order.push(i)
      return i
    })
    const results = await runWithConcurrency(tasks, 1)
    expect(results).toEqual([0, 1, 2])
    expect(order).toEqual([0, 1, 2])
  })

  test('tasks fewer than concurrency — only needed workers spawned', async () => {
    const tasks = [makeTask(1), makeTask(2)]
    const results = await runWithConcurrency(tasks, 10)
    expect(results).toEqual([1, 2])
  })

  test('tasks more than concurrency — all tasks complete', async () => {
    const tasks = Array.from({ length: 12 }, (_, i) => makeTask(i))
    const results = await runWithConcurrency(tasks, 3)
    expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })

  test('single failing task rejects', async () => {
    const tasks = [makeFailingTask('boom')]
    await expect(runWithConcurrency(tasks, 5)).rejects.toThrow('boom')
  })

  test('failing task among passing tasks rejects', async () => {
    const tasks = [
      makeTask('a'),
      makeFailingTask('boom'),
      makeTask('c')
    ]
    await expect(runWithConcurrency(tasks, 5)).rejects.toThrow('boom')
  })

  test('concurrency=1 with failing task rejects', async () => {
    const tasks = [
      makeTask('a'),
      makeFailingTask('boom'),
      makeTask('c')
    ]
    await expect(runWithConcurrency(tasks, 1)).rejects.toThrow('boom')
  })

})
