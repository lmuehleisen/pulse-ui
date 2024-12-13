export type AIState = 'idle' | 'listening' | 'speaking'

export interface Props {
  onStartListening?: () => void
  onStopListening?: () => void
  isAudioPlaying?: boolean
  currentText: string
}
