'use client'

import { useTypingEffect } from '@/hooks/useTypingEffect'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type AIState = 'idle' | 'listening' | 'speaking'

interface Props {
  onStartListening?: () => void
  onStopListening?: () => void
  isAudioPlaying?: boolean
  currentText: string
}

export default function AiTalkingAnimation({ onStartListening, onStopListening, isAudioPlaying, currentText }: Props) {
  const [aiState, setAiState] = useState<AIState>('idle')
  const displayedText = useTypingEffect('Click the circle to start the conversation', 20)
  const animatedCurrentText = useTypingEffect(currentText, 20)

  const handleCircleClick = () => {
    if (aiState === 'listening' || aiState === 'speaking') {
      onStopListening?.()
      setAiState('idle')
    } else if (!isAudioPlaying) {
      onStartListening?.()
      setAiState('listening')
    }
  }

  useEffect(() => {
    if (isAudioPlaying) {
      setAiState('speaking')
    } else if (aiState === 'speaking' && currentText) {
      setAiState('listening')
    }
  }, [isAudioPlaying])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="relative mb-8 cursor-pointer" onClick={handleCircleClick} role="button" aria-label={aiState === 'listening' ? 'Stop listening' : 'Start listening'}>
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-pink-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg"
          animate={aiState === 'idle' ? { scale: [1, 1.1, 1] } : aiState === 'speaking' ? { scale: [1, 1.2, 0.8, 1.2, 1] } : {}}
          transition={{
            duration: aiState === 'speaking' ? 0.8 : 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {aiState === 'listening' && (
          <svg className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2" viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0, rotate: -90 }}
              animate={{ pathLength: 1, rotate: 270 }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </svg>
        )}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <p className="text-gray-800 text-lg font-mono" aria-live="polite">
          {aiState === 'listening' ? 'Listening...' : aiState === 'speaking' ? animatedCurrentText : displayedText}
        </p>
        {aiState === 'idle' && (
          <motion.div
            className="h-5 w-2 bg-violet-600 mt-2"
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>
    </div>
  )
}
