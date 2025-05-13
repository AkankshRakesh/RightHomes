"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Mic, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceOverlayProps {
  isOpen: boolean
  onCloseAction: () => void
  onTranscriptAction: (transcript: string) => void
}

declare global {
  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList
  }
  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult
  }
  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative
    readonly isFinal: boolean
  }
  interface SpeechRecognitionAlternative {
    readonly transcript: string
    readonly confidence: number
  }
}

export default function VoiceOverlay({ isOpen, onCloseAction, onTranscriptAction }: VoiceOverlayProps) {
  const [feedback, setFeedback] = useState("Speak now - I'm listening...")
  const [isProcessing, setIsProcessing] = useState(false)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const animationRef = useRef<number | null>(null)
  const [audioData, setAudioData] = useState<number[]>(Array(64).fill(0))
  const [pulseScale, setPulseScale] = useState(1)

  const updateAudioVisualization = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return

    analyserRef.current.getByteFrequencyData(dataArrayRef.current)
    setAudioData(Array.from(dataArrayRef.current))
    
    // Calculate average volume for pulse effect
    const sum = dataArrayRef.current.reduce((a, b) => a + b, 0)
    const avg = sum / dataArrayRef.current.length
    setPulseScale(1 + (avg / 255) * 0.3)
    
    animationRef.current = requestAnimationFrame(updateAudioVisualization)
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    analyserRef.current = null
    dataArrayRef.current = null
    setPulseScale(1)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      stopRecording()
      setIsProcessing(false)
      setFeedback("Speak now - I'm listening...")

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 128
      source.connect(analyser)

      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
      updateAudioVisualization()

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onstart = () => {
          setFeedback("Speak now - I'm listening...")
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript
          if (event.results[0].isFinal) {
            setIsProcessing(true)
            setFeedback("Processing your request...")
            onTranscriptAction(transcript)
            onCloseAction()
          }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          const error = event.error
          if (error === 'no-speech') {
            setFeedback("I didn't catch that. Try speaking clearly...")
            setTimeout(() => setFeedback("Speak now - I'm listening..."), 2000)
          }
        }

        recognition.onend = () => {
          if (isOpen && recognitionRef.current === recognition && !isProcessing) {
            setTimeout(() => recognition.start(), 500)
          }
        }

        recognition.start()
        recognitionRef.current = recognition
      } else {
        setFeedback("Voice input not supported")
        setTimeout(() => onCloseAction(), 2000)
      }
    } catch {
      setFeedback("Microphone access required")
      setTimeout(() => onCloseAction(), 2000)
    }
  }, [isOpen, onCloseAction, onTranscriptAction, isProcessing, updateAudioVisualization, stopRecording])

  useEffect(() => {
    if (isOpen) {
      startRecording()
    } else {
      stopRecording()
    }
    return () => stopRecording()
  }, [isOpen, startRecording, stopRecording])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 text-white hover:bg-white/10 z-20"
        onClick={onCloseAction}
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md relative z-10 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Voice Command</h2>
          <p className="text-indigo-200">Speak to interact</p>
        </div>

        {/* Circular microphone with audio waves */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Audio wavelength circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[1, 2, 3].map((ring) => (
              <div 
                key={ring}
                className="absolute rounded-full border border-white/10"
                style={{
                  width: `${50 + ring * 50}px`,
                  height: `${50 + ring * 50}px`,
                  opacity: 0.5 - (ring * 0.1),
                  animation: `pulse ${2 + ring * 0.5}s infinite`
                }}
              />
            ))}
          </div>

          {/* Audio reactive bars around circle */}
          <div className="absolute w-full h-full flex items-center justify-center">
            {audioData.slice(0, 32).map((value, index) => {
              const angle = (index / 32) * Math.PI * 2
              const distance = 80
              const x = Math.cos(angle) * distance
              const y = Math.sin(angle) * distance
              const height = 5 + (value / 255) * 40

              return (
                <div
                  key={index}
                  className="absolute bg-gradient-to-t from-cyan-400 to-indigo-500 rounded-full transition-all duration-75"
                  style={{
                    width: '4px',
                    height: `${height}px`,
                    transform: `translate(${x}px, ${y}px) rotate(${angle}rad)`,
                    transformOrigin: 'center center',
                  }}
                />
              )
            })}
          </div>

          {/* Central microphone circle */}
          <div 
            className="relative z-10 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-white/20 shadow-lg transition-transform duration-100"
            style={{
              width: '100px',
              height: '100px',
              transform: `scale(${pulseScale})`
            }}
          >
            <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
              <Mic className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Feedback text */}
        <div className="text-center min-h-12">
          <p className={`text-lg ${feedback.includes("I didn't catch") ? 'text-amber-300' : 'text-white'} font-medium`}>
            {feedback}
          </p>
        </div>

        {/* Example phrases */}
        <div className="text-sm text-white/60">
          <p>Try saying: &quot;Search for...&quot; or &quot;Find...&quot;</p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}