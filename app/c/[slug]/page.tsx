'use client'

import AiTalkingAnimation from '@/components/AiTalkingAnimation'
import Message from '@/components/Message'
import { Conversation } from '@11labs/client'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { GitHub, X } from 'react-feather'
import { toast } from 'sonner'

export default function () {
  const { slug } = useParams<{ slug: string }>()
  const [currentText, setCurrentText] = useState('')
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)
  const loadConversation = () => {
    fetch(`/api/c?id=${slug}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.length > 0) {
          setMessages(
            res.map((i: any) => ({
              ...i,
              formatted: {
                text: i.content_transcript,
                transcript: i.content_transcript,
              },
            })),
          )
        }
      })
  }
  const connectConversation = useCallback(async () => {
    toast('Setting up ElevenLabs...')
    try {
      const response = await fetch('/api/i', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.error) return toast(data.error)
      const conv = await Conversation.startSession({
        signedUrl: data.apiKey,
        onConnect: () => {
          setIsConnected(true)
          toast('Connected to ElevenLabs')
        },
        onDisconnect: () => {
          setIsConnected(false)
          setIsAudioPlaying(false)
        },
        onError: (error) => {
          console.log(error)
          toast('An error occurred during the conversation')
        },
        onModeChange: ({ mode }) => {
          setIsAudioPlaying(mode === 'speaking')
        },
        onMessage: ({ message, source }) => {
          if (source === 'ai') setCurrentText(message)
          fetch('/api/c', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: slug,
              item: {
                type: 'message',
                status: 'completed',
                object: 'realtime.item',
                id: 'item_' + Math.random(),
                role: source === 'ai' ? 'assistant' : 'user',
                content: [{ type: 'text', transcript: message }],
              },
            }),
          }).then(loadConversation)
        },
      })
      setConversation(conv)
    } catch (error) {
      toast('Failed to set up ElevenLabs client :/')
    }
  }, [slug])
  const disconnectConversation = useCallback(async () => {
    setIsConnected(false)
    if (!conversation) return
    await conversation.endSession()
    setConversation(null)
  }, [conversation])
  const handleStartListening = () => {
    if (!isConnected) connectConversation()
  }
  const handleStopListening = () => {
    if (isConnected) disconnectConversation()
  }
  useEffect(() => {
    loadConversation()
    return () => {
      conversation?.endSession()
    }
  }, [slug])
  return (
    <main>
      <a target="_blank" href="https://github.com/neondatabase-labs/voice-thingy-with-elevenlabs-neon/" className="fixed bottom-2 right-2">
        <GitHub />
      </a>
      <span className="fixed bottom-2 left-2">
        Powered by{' '}
        <a href="https://neon.tech/" className="underline" target="_blank">
          Neon
        </a>{' '}
        and{' '}
        <a href="https://elevenlabs.io/" className="underline" target="_blank">
          ElevenLabs
        </a>
        .
      </span>
      <div className="fixed top-2 left-2 flex flex-row gap-x-2 items-center">
        <a href="https://neon.tech" target="_blank">
          <img loading="lazy" decoding="async" src="https://neon.tech/brand/neon-logo-light-color.svg" width="158" height="48" className="h-[30px] w-auto" alt="Neon Logo" />
        </a>
        <span className="text-gray-400">/</span>
        <a href="/">
          <span>Pulse</span>
        </a>
      </div>
      <AiTalkingAnimation currentText={currentText} isAudioPlaying={isAudioPlaying} onStopListening={handleStopListening} onStartListening={handleStartListening} />
      {messages.length > 0 && (
        <button className="text-sm fixed top-2 right-4 underline" onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}>
          Show Transcript
        </button>
      )}
      {isTranscriptOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white text-black p-4 rounded shadow-lg max-w-[90%] max-h-[90%] overflow-y-scroll">
            <div className="flex flex-row items-center justify-between">
              <span>Transcript</span>
              <button onClick={() => setIsTranscriptOpen(false)}>
                <X />
              </button>
            </div>
            <div className="border-t py-4 mt-4 flex flex-col gap-y-4">
              {messages.map((conversationItem) => (
                <Message key={conversationItem.id} conversationItem={conversationItem} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
