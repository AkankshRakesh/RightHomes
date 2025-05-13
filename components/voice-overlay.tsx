"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCallback as reactUseCallback } from "react"

interface VoiceOverlayProps {
  isOpen: boolean
  onCloseAction: () => void
  onTranscriptAction: (transcript: string) => void
}

// Declare SpeechRecognitionEvent
// declare global {
//   interface SpeechRecognitionEvent extends Event {
//     readonly results: SpeechRecognitionResultList
//   }

//   interface SpeechRecognitionResultList {
//     [index: number]: SpeechRecognitionResult
//   }

//   interface SpeechRecognitionResult {
//     [index: number]: SpeechRecognitionAlternative
//     readonly isFinal: boolean
//   }

//   interface SpeechRecognitionAlternative {
//     readonly transcript: string
//     readonly confidence: number
//   }

//   interface Window {
//     SpeechRecognition: typeof SpeechRecognition
//     webkitSpeechRecognition: typeof SpeechRecognition
//   }
// }

export default function VoiceOverlay({ isOpen, onCloseAction, onTranscriptAction }: VoiceOverlayProps) {
    const [audioData, setAudioData] = useState<number[]>(Array(30).fill(5))
    const animationRef = useRef<number | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const dataArrayRef = useRef<Uint8Array | null>(null)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    const recognitionRef = useRef<SpeechRecognition | null>(null)

    // Wrap startRecording and stopRecording in useCallback to avoid missing dependency warning
    const useCallback = reactUseCallback

    const updateAudioVisualization = useCallback(() => {
        if (!analyserRef.current || !dataArrayRef.current) return

        analyserRef.current.getByteFrequencyData(dataArrayRef.current)

        // Process the audio data to create a nice visualization
        const newAudioData = Array(30).fill(0)
        const step = Math.floor(dataArrayRef.current.length / 30)

        for (let i = 0; i < 30; i++) {
            const startIndex = i * step
            let sum = 0
            for (let j = 0; j < step && startIndex + j < dataArrayRef.current.length; j++) {
                sum += dataArrayRef.current[startIndex + j]
            }
            // Scale the value to be between 5 and 50
            newAudioData[i] = 5 + (sum / step) * 0.18
        }

        setAudioData(newAudioData)
        animationRef.current = requestAnimationFrame(updateAudioVisualization)
    }, [])

    const startRecording = useCallback(async () => {
        try {
            // Start audio visualization
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaStreamRef.current = stream

            const audioContext = new AudioContext()
            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 64
            source.connect(analyser)

            analyserRef.current = analyser
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)

            updateAudioVisualization()

            // Start speech recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.continuous = false
                recognition.interimResults = true
                recognition.lang = "en-US"

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    const transcript = event.results[0][0].transcript
                    if (event.results[0].isFinal) {
                        onTranscriptAction(transcript)
                        onCloseAction()
                    }
                }

                recognition.onend = () => {
                    // If recognition ends without a result, restart it
                    if (isOpen) {
                        recognition.start()
                    }
                }

                recognition.start()
                recognitionRef.current = recognition
            }
        } catch (error) {
            console.error("Error accessing microphone:", error)
            onCloseAction()
        }
    }, [isOpen, onTranscriptAction, onCloseAction, updateAudioVisualization])

    const stopRecording = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop())
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
    }, [])

    useEffect(() => {
        if (isOpen) {
            startRecording()
        } else {
            stopRecording()
        }
        // Cleanup on unmount
        return () => {
            stopRecording()
        }
    }, [isOpen, startRecording, stopRecording])

    if (!isOpen) return null

    return (
            <div className="fixed inset-0 z-50 flex items-center justify-center ocean-background">
      <div className="absolute inset-0 ocean-waves"></div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 text-white hover:bg-white/10"
        onClick={onCloseAction}
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Close</span>
      </Button>

      <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-lg relative z-10">
        <div className="text-white text-xl font-medium">Listening...</div>

        <div className="flex items-end justify-center space-x-1 h-32 w-full px-4">
          {audioData.map((height, index) => (
            <div
              key={index}
              className="w-2 bg-white rounded-full transition-all duration-75"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>

        <div className="text-white/70 text-sm">Speak now</div>

        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
          <Mic className="h-8 w-8 text-white" />
        </div>
      </div>

      <style jsx>{`
        .ocean-background {
          background: linear-gradient(180deg, #0077b6 0%, #023e8a 100%);
          overflow: hidden;
        }
        
        .ocean-waves {
          background: linear-gradient(180deg, rgba(0, 119, 182, 0.2) 0%, rgba(2, 62, 138, 0.4) 100%);
          opacity: 0.8;
          animation: wave 8s ease-in-out infinite alternate;
          background-size: 200% 200%;
          position: absolute;
          inset: 0;
        }
        
        @keyframes wave {
          0% {
            background-position: 0% 25%;
            box-shadow: inset 0 0 50px rgba(255, 255, 255, 0.1);
          }
          50% {
            background-position: 100% 50%;
            box-shadow: inset 0 0 80px rgba(255, 255, 255, 0.2);
          }
          100% {
            background-position: 0% 75%;
            box-shadow: inset 0 0 60px rgba(255, 255, 255, 0.15);
          }
        }
      `}</style>
    </div>
    )
}
