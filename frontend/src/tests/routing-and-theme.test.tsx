import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { useTheme } from '../hooks/useTheme'
import { ThemeProvider } from '../providers/ThemeProvider'

let root: Root
let container: HTMLDivElement
let systemThemeIsLight = false
const mediaListeners = new Set<(event: MediaQueryListEvent) => void>()

function ThemeProbe() {
  const { preference, resolvedTheme, setPreference } = useTheme()
  return (
    <div>
      <output data-testid="preference">{preference}</output>
      <output data-testid="resolved-theme">{resolvedTheme}</output>
      <button type="button" data-theme-choice="dark" onClick={() => setPreference('dark')}>Dark theme</button>
      <button type="button" data-theme-choice="light" onClick={() => setPreference('light')}>Light theme</button>
      <button type="button" data-theme-choice="system" onClick={() => setPreference('system')}>Use system theme</button>
    </div>
  )
}

async function flushEffects() {
  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 0))
  })
}

beforeEach(() => {
  window.localStorage.clear()
  window.history.replaceState({}, '', '/')
  systemThemeIsLight = false
  mediaListeners.clear()
  vi.stubGlobal('matchMedia', (media: string) => ({
    matches: systemThemeIsLight,
    media,
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => mediaListeners.add(listener),
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => mediaListeners.delete(listener),
    addListener: (listener: (event: MediaQueryListEvent) => void) => mediaListeners.add(listener),
    removeListener: (listener: (event: MediaQueryListEvent) => void) => mediaListeners.delete(listener),
    dispatchEvent: vi.fn(),
  }))
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  document.documentElement.removeAttribute('data-theme')
  vi.unstubAllGlobals()
})

describe('public and protected routing', () => {
  it('keeps the landing page public at the root on first render and refresh', async () => {
    await act(async () => root.render(<App />))
    await flushEffects()
    expect(window.location.pathname).toBe('/')
    expect(container.textContent).toContain('Understand the code. Plan the change. Verify the result.')

    await act(async () => root.unmount())
    root = createRoot(container)
    await act(async () => root.render(<App />))
    await flushEffects()
    expect(window.location.pathname).toBe('/')
    expect(container.textContent).toContain('Understand the code. Plan the change. Verify the result.')
  })

  it('redirects a logged-out protected route to login without looping', async () => {
    window.history.replaceState({}, '', '/projects/kairo-api')
    await act(async () => root.render(<App />))
    await flushEffects()
    expect(window.location.pathname).toBe('/login')
    expect(container.textContent).toContain('Sign in to Kairo')
  })
})

describe('shared theme behavior', () => {
  it('persists explicit themes and follows operating system changes in system mode', async () => {
    await act(async () => root.render(<ThemeProvider><ThemeProbe /></ThemeProvider>))
    expect(document.documentElement.dataset.theme).toBe('dark')

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-theme-choice="light"]')?.click()
    })
    expect(window.localStorage.getItem('kairo-theme-preference')).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-theme-choice="dark"]')?.click()
    })
    expect(window.localStorage.getItem('kairo-theme-preference')).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-theme-choice="system"]')?.click()
    })
    expect(window.localStorage.getItem('kairo-theme-preference')).toBe('system')
    expect(document.documentElement.dataset.theme).toBe('dark')

    systemThemeIsLight = true
    await act(async () => {
      mediaListeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent))
    })
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(container.querySelector('[data-testid="resolved-theme"]')?.textContent).toBe('light')
  })
})
