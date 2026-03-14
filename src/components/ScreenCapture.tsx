import { useState } from 'react'
import './ScreenCapture.css'

interface ScreenCaptureProps {
  type: 'pedestrian' | 'vehicular'
}

export default function ScreenCapture({ type }: ScreenCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureMessage, setCaptureMessage] = useState('')

  const handleAnalyze = async () => {
    try {
      setIsCapturing(true)
      setCaptureMessage('Selecciona la pantalla a capturar...')

      // Solicitar acceso a la pantalla
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: false
      } as any)

      // Crear un video element temporal
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      // Esperar a que el video esté listo
      await new Promise(resolve => {
        video.onloadedmetadata = resolve
      })

      // Crear canvas y dibujar el video
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('No se pudo obtener el contexto del canvas')
      }

      ctx.drawImage(video, 0, 0)

      // Detener el stream
      stream.getTracks().forEach(track => track.stop())

      // Descargar la captura
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `${type}-screenshot-${Date.now()}.png`
      link.click()

      setCaptureMessage('✓ Pantalla capturada exitosamente')
      setTimeout(() => setCaptureMessage(''), 3000)
    } catch (error: any) {
      console.error('Error al capturar pantalla:', error)
      const errorMsg = error?.name === 'NotAllowedError'
        ? 'Captura cancelada por el usuario'
        : 'Error: No se pudo capturar la pantalla'
      setCaptureMessage(errorMsg)
      setTimeout(() => setCaptureMessage(''), 3000)
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <div className="screen-capture">
      <button
        className={`btn-analyze ${type}-analyze`}
        onClick={handleAnalyze}
        disabled={isCapturing}
      >
        {isCapturing ? 'Capturando...' : 'Analizar'}
      </button>

      {captureMessage && (
        <div className={`capture-message ${captureMessage.includes('✓') ? 'success' : 'error'}`}>
          {captureMessage}
        </div>
      )}
    </div>
  )
}
