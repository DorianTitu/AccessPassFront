import { useState, useEffect } from 'react'
import {
  capturarCedulaPeatonal,
  capturarRostroPeatonal,
  guardarRegistroPeatonal
} from '../services/api'
import { obtenerDepartamentos, obtenerMotivos } from '../services/configuracion'
import DepartamentosModal from '../components/DepartamentosModal'
import './FormStyles.css'

interface PedestrianFormProps {
  onClose: () => void
  onSuccess?: () => void | Promise<void>
}

export default function PedestrianForm({ onClose, onSuccess }: PedestrianFormProps) {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    departamento: '',
    motivo: ''
  })

  const [horaIngreso, setHoraIngreso] = useState<string>('')
  const [departamentos, setDepartamentos] = useState(obtenerDepartamentos())
  const [motivosFiltrados, setMotivosFiltrados] = useState<string[]>([])
  const [mostrarModalConfig, setMostrarModalConfig] = useState(false)

  const [photoID, setPhotoID] = useState<string | null>(null)
  const [photoFace, setPhotoFace] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // Actualizar hora en tiempo real
  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date()
      const horaFormato = ahora.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      setHoraIngreso(horaFormato)
    }

    actualizarHora()
    const intervalo = window.setInterval(actualizarHora, 1000)

    return () => {
      window.clearInterval(intervalo)
    }
  }, [])

  // Actualizar motivos cuando cambia el departamento
  useEffect(() => {
    if (formData.departamento) {
      const deptId = parseInt(formData.departamento)
      const motivos = obtenerMotivos(deptId)
      setMotivosFiltrados(motivos)
      setFormData(prev => ({
        ...prev,
        motivo: ''
      }))
    } else {
      setMotivosFiltrados([])
    }
  }, [formData.departamento])

  const handleCerrarModalConfig = () => {
    setMostrarModalConfig(false)
    setDepartamentos(obtenerDepartamentos())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombres.trim()) newErrors.nombres = 'El nombre es requerido'
    if (!formData.apellidos.trim()) newErrors.apellidos = 'El apellido es requerido'
    if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es requerida'
    if (!formData.departamento) newErrors.departamento = 'Selecciona un departamento'
    if (!formData.motivo) newErrors.motivo = 'Selecciona un motivo'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      setShowConfirm(true)
    }
  }

  const getBase64Only = (value: string | null): string => {
    if (!value) return ''
    const parts = value.split(',')
    return parts.length > 1 ? parts[1] : value
  }

  const confirmSave = async () => {
    if (guardando) return

    const departamentoSeleccionado = departamentos.find(
      (dept) => dept.id === parseInt(formData.departamento)
    )

    if (!departamentoSeleccionado) {
      alert('Departamento no válido')
      return
    }

    setGuardando(true)
    try {
      const response = await guardarRegistroPeatonal({
        persona: `${formData.nombres.trim()} ${formData.apellidos.trim()}`.trim(),
        cedula: formData.cedula.trim(),
        departamento: departamentoSeleccionado.nombre,
        imagen_cedula_base64: getBase64Only(photoID),
        imagen_usuario_base64: getBase64Only(photoFace),
        hora_ingreso: horaIngreso
      })

      if (!response.success) {
        alert(response.mensaje || 'No se pudo guardar el registro peatonal')
        return
      }

      setShowConfirm(false)
      alert(response.mensaje || 'Registro peatonal guardado exitosamente')
      if (onSuccess) {
        await onSuccess()
      }
      onClose()
    } catch (error) {
      console.error('Error al guardar registro peatonal:', error)
      alert('Ocurrió un error al guardar el registro peatonal')
    } finally {
      setGuardando(false)
    }
  }

  const handleCapturar = async () => {
    const captureStart = performance.now()
    setLoading(true)
    // Reinicia datos de captura para evitar arrastrar información anterior.
    setPhotoID(null)
    setPhotoFace(null)
    setFormData(prev => ({
      ...prev,
      cedula: '',
      nombres: '',
      apellidos: ''
    }))
    setErrors(prev => ({
      ...prev,
      cedula: '',
      nombres: '',
      apellidos: ''
    }))
    try {
      let errorCount = 0

      const cedulaStart = performance.now()
      const cedulaTask = capturarCedulaPeatonal()
        .then((cedulaResult) => {
          console.log('Frontend tiempo cédula peatonal (ms):', Math.round(performance.now() - cedulaStart))

          if (cedulaResult.exito && cedulaResult.fotoID) {
            const imageData = typeof cedulaResult.fotoID === 'string' && cedulaResult.fotoID.startsWith('data:')
              ? cedulaResult.fotoID
              : `data:image/jpeg;base64,${cedulaResult.fotoID}`
            setPhotoID(imageData)

            // Llenar datos OCR en los campos del formulario
            setFormData(prev => ({
              ...prev,
              cedula: cedulaResult.nui || prev.cedula,
              nombres: cedulaResult.nombres || prev.nombres,
              apellidos: cedulaResult.apellidos || prev.apellidos
            }))
          } else {
            errorCount++
          }
        })
        .catch((error) => {
          console.error('Error en captura de cédula peatonal:', error)
          errorCount++
        })

      const rostroStart = performance.now()
      const rostroTask = capturarRostroPeatonal()
        .then((rostroResult) => {
          console.log('Frontend tiempo rostro peatonal (ms):', Math.round(performance.now() - rostroStart))

          if (rostroResult.exito && rostroResult.fotoFace) {
            const imageData = typeof rostroResult.fotoFace === 'string' && rostroResult.fotoFace.startsWith('data:')
              ? rostroResult.fotoFace
              : `data:image/jpeg;base64,${rostroResult.fotoFace}`
            setPhotoFace(imageData)
          } else {
            errorCount++
          }
        })
        .catch((error) => {
          console.error('Error en captura de rostro peatonal:', error)
          errorCount++
        })

      // Espera final para cerrar el estado de carga, pero cada imagen se renderiza apenas llega.
      await Promise.all([cedulaTask, rostroTask])

      console.log('Frontend tiempo total captura peatonal (ms):', Math.round(performance.now() - captureStart))

      if (errorCount > 0) {
        alert(`Error: Solo se capturaron ${2 - errorCount} de 2 imágenes`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al capturar imágenes')
    } finally {
      setLoading(false)
    }
  }





  return (
    <div className="form-modal">
      <div className="form-container">
        <div className="form-header pedestrian-header">
          <h1>REGISTRO INGRESO PEATONAL</h1>
          <div className="header-buttons">
            <button className="btn-config" onClick={() => setMostrarModalConfig(true)}>Configurar</button>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="form-content">
          {loading && (
            <div className="extraction-message">
              <span className="spinner">⟳</span>
              Capturando y extrayendo datos de la cedula. Puedes llenar departamento y motivo mientras termina.
            </div>
          )}

          {/* Sección de Fotos */}
          <div className="photos-section">
            <div className="photo-box">
              {photoID ? (
                <img src={photoID} alt="Cédula" className="photo-image" />
              ) : (
                <div className="photo-placeholder">
                  {loading ? (
                    <>
                      <div className="photo-loading-spinner" aria-hidden="true"></div>
                      <p>Cargando cédula...</p>
                    </>
                  ) : (
                    <p>Foto Cédula</p>
                  )}
                </div>
              )}
            </div>
            <div className="photo-box">
              {photoFace ? (
                <img src={photoFace} alt="Rostro" className="photo-image" />
              ) : (
                <div className="photo-placeholder">
                  {loading ? (
                    <>
                      <div className="photo-loading-spinner" aria-hidden="true"></div>
                      <p>Cargando rostro...</p>
                    </>
                  ) : (
                    <p>Foto Rostro</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div className="form-fields">
            <div className="form-group">
              <label>Nombres: <span className="required">*</span></label>
              <input
                type="text"
                name="nombres"
                placeholder="Ingrese el nombre"
                value={formData.nombres}
                onChange={handleInputChange}
                className={errors.nombres ? 'input-error' : ''}
              />
              {errors.nombres && <span className="error-message">{errors.nombres}</span>}
            </div>

            <div className="form-group">
              <label>Apellidos: <span className="required">*</span></label>
              <input
                type="text"
                name="apellidos"
                placeholder="Ingrese los apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                className={errors.apellidos ? 'input-error' : ''}
              />
              {errors.apellidos && <span className="error-message">{errors.apellidos}</span>}
            </div>

            <div className="form-group">
              <label>N° de Cédula: <span className="required">*</span></label>
              <input
                type="text"
                name="cedula"
                placeholder="Ej: 0912345678"
                value={formData.cedula}
                onChange={handleInputChange}
                className={errors.cedula ? 'input-error' : ''}
              />
              {errors.cedula && <span className="error-message">{errors.cedula}</span>}
            </div>

            <div className="form-group">
              <label>Hora de Ingreso:</label>
              <input
                type="text"
                value={horaIngreso}
                readOnly
                className="input-readonly"
              />
            </div>

            <div className="form-group">
              <label>Departamento: <span className="required">*</span></label>
              <select
                name="departamento"
                value={formData.departamento}
                onChange={handleInputChange}
                className={errors.departamento ? 'input-error' : ''}
              >
                <option value="">Seleccionar...</option>
                {departamentos.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                ))}
              </select>
              {errors.departamento && <span className="error-message">{errors.departamento}</span>}
            </div>

            <div className="form-group">
              <label>Motivo: <span className="required">*</span></label>
              <select
                name="motivo"
                value={formData.motivo}
                onChange={handleInputChange}
                disabled={!formData.departamento}
                className={errors.motivo ? 'input-error' : ''}
              >
                <option value="">Seleccionar...</option>
                {motivosFiltrados.map((motivo, idx) => (
                  <option key={idx} value={motivo}>{motivo}</option>
                ))}
              </select>
              {errors.motivo && <span className="error-message">{errors.motivo}</span>}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="form-buttons">
            <button
              className="btn-capture pedestrian-btn"
              onClick={handleCapturar}
              disabled={loading}
            >
              {loading ? 'Capturando...' : 'Capturar Nuevo Registro'}
            </button>
            <button className="btn-save pedestrian-btn" onClick={handleSave}>Guardar Registro</button>
            <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Confirmar Registro</h2>
            <p>¿Deseas guardar este registro peatonal?</p>
            <div className="confirm-buttons">
              <button className="btn-confirm" onClick={confirmSave} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Confirmar'}
              </button>
              <button className="btn-cancel-confirm" onClick={() => setShowConfirm(false)} disabled={guardando}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración */}
      <DepartamentosModal 
        isOpen={mostrarModalConfig} 
        onClose={handleCerrarModalConfig}
      />
    </div>
  )
}
