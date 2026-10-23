export type WebSocketStatus = 'disconnected'

export function useWebSocket() {
  return {
    status: 'disconnected' as WebSocketStatus,
    error: 'No WebSocket endpoint is configured for this frontend demo.',
    connect: () => false,
    disconnect: () => undefined,
  }
}
