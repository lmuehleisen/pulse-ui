export interface Conversation {
  sendMessage: (message: string) => Promise<void>
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  startSession: (config: {
    signedUrl: string
    onConnect: () => void
    onDisconnect: () => void
    onModeChange: (params: { mode: 'speaking' | 'listening' | 'idle' }) => void
    onMessage: (params: { message: string; source: 'ai' | 'user' }) => void
  }) => Promise<Conversation>
}
