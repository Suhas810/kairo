import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { taskService } from '../services/tasks'

let root: Root
let container: HTMLDivElement

async function flushEffects() {
  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 0))
  })
}

beforeEach(() => {
  window.localStorage.clear()
  window.history.replaceState({}, '', '/')
  vi.stubGlobal('matchMedia', (media: string) => ({
    matches: false,
    media,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

describe('Landing Page & Public Navigation', () => {
  it('renders landing page with core CTAs, workflow and FAQ sections', async () => {
    await act(async () => root.render(<App />))
    await flushEffects()

    expect(container.textContent).toContain('Kairo')
    expect(container.textContent).toContain('Understand the code. Plan the change. Verify the result.')
    expect(container.textContent).toContain('Get Started')
    expect(container.textContent).toContain('Sign In')
    expect(container.textContent).toContain('Frequently Asked Questions')
  })

  it('navigates to signup page without authentication requirement', async () => {
    window.history.replaceState({}, '', '/signup')
    await act(async () => root.render(<App />))
    await flushEffects()

    expect(window.location.pathname).toBe('/signup')
    expect(container.textContent).toContain('Create your account')
  })

  it('navigates to forgot password page without authentication requirement', async () => {
    window.history.replaceState({}, '', '/forgot-password')
    await act(async () => root.render(<App />))
    await flushEffects()

    expect(window.location.pathname).toBe('/forgot-password')
    expect(container.textContent).toContain('Reset password')
  })
})

describe('Task Service & Persistence', () => {
  it('loads default seed tasks when storage is empty', async () => {
    const tasks = await taskService.listTasks()
    expect(tasks.length).toBeGreaterThanOrEqual(4)
    expect(tasks.some((t) => t.id === 'task-1')).toBe(true)
  })

  it('creates, persists, and deletes tasks', async () => {
    const newTask = await taskService.createTask({
      projectId: 'kairo-api',
      title: 'Verify sandboxed test runner output',
      description: 'Ensure stdout and stderr streams are properly captured.',
      priority: 'high',
      taskType: 'test',
    })

    expect(newTask.id).toBeDefined()
    expect(newTask.title).toBe('Verify sandboxed test runner output')

    const tasksAfterCreate = await taskService.listTasks('kairo-api')
    expect(tasksAfterCreate.some((t) => t.id === newTask.id)).toBe(true)

    const deleted = await taskService.deleteTask(newTask.id)
    expect(deleted).toBe(true)

    const tasksAfterDelete = await taskService.listTasks('kairo-api')
    expect(tasksAfterDelete.some((t) => t.id === newTask.id)).toBe(false)
  })
})
