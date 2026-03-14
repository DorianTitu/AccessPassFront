import { useState, useRef } from 'react'
import './ScreenCapture.css'

interface ScreenCaptureProps {
  type: 'pedestrian' | 'vehicular'
  onPedestrianPhotosCapture?: (photoID: string, photoFace: string) => void
  onVehicularPhotosCapture?: (photoDriver: string, photoPlate: string) => void
}

interface CropBox {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export default function ScreenCapture({ 
  type,
  onPedestrianPhotosCapture,
  onVehicularPhotosCapture
}: ScreenCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureMessage, setCaptureMessage] = useState('')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [cropBoxes, setCropBoxes] = useState<CropBox[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentBox, setCurrentBox] = useState<CropBox | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleCapture = async () => {
    try {
      setIsCapturing(true)
      setCaptureMessage('Selecciona la pantalla a capturar...')

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: false
      } as any)

      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      await new Promise(resolve => {
        video.onloadedmetadata = resolve
      })

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('No se pudo obtener el contexto del canvas')
      }

      ctx.drawImage(video, 0, 0)
      stream.getTracks().forEach(track => track.stop())

      // Traer el navegador al frente después de tomar la captura
      window.focus()

      const imageData = canvas.toDataURL('image/png')
      setCapturedImage(imageData)
      setShowEditor(true)
      setCropBoxes([])
      setCurrentBox(null)
      setCaptureMessage('✓ Pantalla capturada. Dibuja los recortes.')
      setTimeout(() => setCaptureMessage(''), 2000)
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

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !imageRef.current) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = imageRef.current.naturalWidth / rect.width
    const scaleY = imageRef.current.naturalHeight / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e)
    if (!coords) return

    setIsDrawing(true)
    setStartPos(coords)
    setCurrentBox({
      id: Date.now().toString(),
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentBox) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    const width = coords.x - currentBox.x
    const height = coords.y - currentBox.y

    setCurrentBox({
      ...currentBox,
      width: Math.abs(width),
      height: Math.abs(height),
      x: width < 0 ? coords.x : currentBox.x,
      y: height < 0 ? coords.y : currentBox.y
    })

    redrawCanvas()
  }

  const handleMouseUp = () => {
    if (currentBox && currentBox.width > 20 && currentBox.height > 20) {
      setCropBoxes([...cropBoxes, currentBox])
    }
    setIsDrawing(false)
    setCurrentBox(null)
    redrawCanvas()
  }

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)

    const scaleX = canvas.width / img.naturalWidth
    const scaleY = canvas.height / img.naturalHeight

    // Dibujar boxes guardados
    ctx.strokeStyle = '#0073E6'
    ctx.lineWidth = 2
    cropBoxes.forEach(box => {
      ctx.strokeRect(box.x * scaleX, box.y * scaleY, box.width * scaleX, box.height * scaleY)
      ctx.fillStyle = 'rgba(0, 115, 230, 0.1)'
      ctx.fillRect(box.x * scaleX, box.y * scaleY, box.width * scaleX, box.height * scaleY)
    })

    // Dibujar box actual
    if (currentBox) {
      ctx.strokeStyle = '#8B1F2D'
      ctx.lineWidth = 3
      ctx.strokeRect(currentBox.x * scaleX, currentBox.y * scaleY, currentBox.width * scaleX, currentBox.height * scaleY)
      ctx.fillStyle = 'rgba(139, 31, 45, 0.1)'
      ctx.fillRect(currentBox.x * scaleX, currentBox.y * scaleY, currentBox.width * scaleX, currentBox.height * scaleY)
    }
  }

  const downloadCrop = (box: CropBox, index: number) => {
    if (!imageRef.current) return

    // Determinar cantidad de divisiones según el tipo
    const divisions = type === 'pedestrian' ? 2 : 3
    const partWidth = box.width / divisions
    const parts: string[] = []

    // Generar cada división
    for (let i = 0; i < divisions; i++) {
      const partX = box.x + (i * partWidth)
      
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = partWidth
      tempCanvas.height = box.height
      const ctx = tempCanvas.getContext('2d')

      if (!ctx) return

      ctx.drawImage(
        imageRef.current,
        partX, box.y, partWidth, box.height,
        0, 0, partWidth, box.height
      )

      const imageData = tempCanvas.toDataURL('image/png')
      parts.push(imageData)
    }

    // Inyectar en el formulario
    if (type === 'pedestrian' && onPedestrianPhotosCapture && parts.length === 2) {
      onPedestrianPhotosCapture(parts[0], parts[1])
      setCaptureMessage('✓ Fotos cargadas en el formulario')
      setTimeout(() => setCaptureMessage(''), 2000)
    } else if (type === 'vehicular' && onVehicularPhotosCapture && parts.length === 3) {
      onVehicularPhotosCapture(parts[0], parts[2])
      setCaptureMessage('✓ Fotos cargadas en el formulario')
      setTimeout(() => setCaptureMessage(''), 2000)
    }
  }

  const downloadAll = () => {
    cropBoxes.forEach((box, index) => {
      // Cada rectángulo se carga en el formulario
      setTimeout(() => downloadCrop(box, index), index * 1000)
    })
  }

  const removeCrop = (id: string) => {
    setCropBoxes(cropBoxes.filter(box => box.id !== id))
    redrawCanvas()
  }

  const closeEditor = () => {
    setShowEditor(false)
    setCapturedImage(null)
    setCropBoxes([])
  }

  return (
    <div className="screen-capture">
      <button
        className={`btn-analyze ${type}-analyze`}
        onClick={handleCapture}
        disabled={isCapturing}
      >
        {isCapturing ? 'Capturando...' : 'Capturar Pantalla'}
      </button>

      {captureMessage && (
        <div className={`capture-message ${captureMessage.includes('Dibuja') ? 'info' : captureMessage.includes('✓') ? 'success' : 'error'}`}>
          {captureMessage}
        </div>
      )}

      {/* Modal del Editor */}
      {showEditor && capturedImage && (
        <div className="crop-editor-overlay">
          <div className="crop-editor-container">
            <div className="crop-editor-header">
              <h2>Editor de Recortes de Cámaras</h2>
              <p>Dibuja rectángulos alrededor de cada cámara. Mínimo 20x20 píxeles.</p>
            </div>

            <div className="crop-editor-content">
              <div className="canvas-wrapper">
                <img
                  ref={imageRef}
                  src={capturedImage}
                  style={{ display: 'none' }}
                  onLoad={() => {
                    if (canvasRef.current && imageRef.current) {
                      // Establecer canvas con el tamaño exacto de la imagen capturada
                      canvasRef.current.width = imageRef.current.naturalWidth
                      canvasRef.current.height = imageRef.current.naturalHeight
                      redrawCanvas()
                    }
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="crop-canvas"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: 'crosshair' }}
                />
              </div>

              <div className="crop-list">
                <h3>Recortes ({cropBoxes.length})</h3>
                {cropBoxes.length === 0 ? (
                  <p className="no-crops">No hay recortes aún. Dibuja sobre la imagen.</p>
                ) : (
                  <div className="crops-container">
                    {cropBoxes.map((box, index) => (
                      <div key={box.id} className="crop-item">
                        <div className="crop-info">
                          <span className="crop-number">#{index + 1}</span>
                          <span className="crop-size">{Math.round(box.width)} × {Math.round(box.height)} px</span>
                        </div>
                        <button
                          className="btn-crop-download"
                          onClick={() => downloadCrop(box, index)}
                        >
                          Cargar al Formulario ({type === 'pedestrian' ? '2' : '3'})
                        </button>
                        <button
                          className="btn-crop-delete"
                          onClick={() => removeCrop(box.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="crop-editor-actions">
              {cropBoxes.length > 0 && (
                <button className="btn-download-all" onClick={downloadAll}>
                  Cargar Todos al Formulario ({cropBoxes.length})
                </button>
              )}
              <button className="btn-close-editor" onClick={closeEditor}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
