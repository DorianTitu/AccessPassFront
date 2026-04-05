import { useState, useEffect } from 'react'
import {
  capturarImagenesVehicular,
  capturarRostroConductor,
  capturarCedulaConductor,
  extraerCedulaVehicular,
  guardarRegistroVehicular
} from '../services/api'
import { obtenerDepartamentos, obtenerMotivos } from '../services/configuracion'
import DepartamentosModal from '../components/DepartamentosModal'
import './FormStyles.css'

interface VehicularFormProps {
  onClose: () => void
  onSuccess?: () => void | Promise<void>
}

export default function VehicularForm({ onClose, onSuccess }: VehicularFormProps) {
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

  const [photoPlate, setPhotoPlate] = useState<string | null>(null)
  const [photoDriver, setPhotoDriver] = useState<string | null>(null)
  const [photoCedula, setPhotoCedula] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)

  const resetVehicularForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      cedula: '',
      departamento: '',
      motivo: ''
    })
    setMotivosFiltrados([])
    setErrors({})
    setPhotoPlate(null)
    setPhotoDriver(null)
    setPhotoCedula(null)
    setShowConfirm(false)
  }

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
      if (!photoCedula || !photoDriver || !photoPlate) {
        alert('Debes capturar las 3 imágenes (cédula, rostro y placa) antes de guardar')
        return
      }
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
      const response = await guardarRegistroVehicular({
        apellidos: formData.apellidos.trim(),
        cedula: formData.cedula.trim(),
        departamento: departamentoSeleccionado.nombre,
        hora_ingreso: horaIngreso,
        imagen_cedula_base64: getBase64Only(photoCedula),
        imagen_placa_base64: getBase64Only(photoPlate),
        imagen_usuario_base64: getBase64Only(photoDriver),
        motivo: formData.motivo,
        nombres: formData.nombres.trim()
      })

      if (!response.success) {
        alert(response.mensaje || 'No se pudo guardar el registro vehicular')
        return
      }

      setShowConfirm(false)
      alert(response.mensaje || 'Registro vehicular guardado exitosamente')
      if (onSuccess) {
        await onSuccess()
      }
      onClose()
    } catch (error) {
      console.error('Error al guardar registro vehicular:', error)
      alert('Ocurrió un error al guardar el registro')
    } finally {
      setGuardando(false)
    }
  }

  const handleCapturar = async () => {
    setLoading(true)
    setOcrLoading(false)
    resetVehicularForm()

    try {
      let errorCount = 0
      let photoPlateTemp: string | null = null
      let photoDriverTemp: string | null = null
      let photoCedulaTemp: string | null = null
      let cedulaNuiTemp = ''
      let cedulaNombresTemp = ''
      let cedulaApellidosTemp = ''
      const marcaError = () => {
        errorCount++
      }

      const placaPromise = capturarImagenesVehicular().then((placaResult) => {
        if (placaResult.exito && placaResult.fotoPlaca) {
          const imageData = typeof placaResult.fotoPlaca === 'string' && placaResult.fotoPlaca.startsWith('data:')
            ? placaResult.fotoPlaca
            : `data:image/jpeg;base64,${placaResult.fotoPlaca}`
          photoPlateTemp = imageData
          return
        }

        marcaError()
      }).catch((error) => {
        console.error('Error al capturar placa:', error)
        marcaError()
      })

      const rostroPromise = capturarRostroConductor().then((rostroResult) => {
        if (rostroResult.exito && rostroResult.fotoDriver) {
          const imageData = typeof rostroResult.fotoDriver === 'string' && rostroResult.fotoDriver.startsWith('data:')
            ? rostroResult.fotoDriver
            : `data:image/jpeg;base64,${rostroResult.fotoDriver}`
          photoDriverTemp = imageData
          return
        }

        marcaError()
      }).catch((error) => {
        console.error('Error al capturar rostro:', error)
        marcaError()
      })

      const cedulaPromise = capturarCedulaConductor().then((cedulaResult) => {
        if (cedulaResult.exito && cedulaResult.fotoCedula) {
          const imageData = typeof cedulaResult.fotoCedula === 'string' && cedulaResult.fotoCedula.startsWith('data:')
            ? cedulaResult.fotoCedula
            : `data:image/jpeg;base64,${cedulaResult.fotoCedula}`
          photoCedulaTemp = imageData
          cedulaNuiTemp = cedulaResult.nui || ''
          cedulaNombresTemp = cedulaResult.nombres || ''
          cedulaApellidosTemp = cedulaResult.apellidos || ''
          return
        }

        marcaError()
      }).catch((error) => {
        console.error('Error al capturar cédula:', error)
        marcaError()
      })

      await Promise.allSettled([placaPromise, rostroPromise, cedulaPromise])

      if (photoCedulaTemp) {
        // Mostrar las tres fotos en bloque cuando cedula ya este lista.
        setPhotoCedula(photoCedulaTemp)
        setPhotoDriver(photoDriverTemp)
        setPhotoPlate(photoPlateTemp)

        // El loader de campos inicia cuando ya se mostraron las imagenes.
        setOcrLoading(true)
        try {
          const ocrResult = await extraerCedulaVehicular(photoCedulaTemp)
          if (ocrResult.exito) {
            setFormData(prev => ({
              ...prev,
              cedula: ocrResult.nui || prev.cedula,
              nombres: ocrResult.nombres || prev.nombres,
              apellidos: ocrResult.apellidos || prev.apellidos
            }))
          } else {
            setFormData(prev => ({
              ...prev,
              cedula: cedulaNuiTemp || prev.cedula,
              nombres: cedulaNombresTemp || prev.nombres,
              apellidos: cedulaApellidosTemp || prev.apellidos
            }))
          }
        } finally {
          setOcrLoading(false)
        }
      } else {
        // Si falla cedula, mostrar al menos las que hayan llegado.
        setPhotoDriver(photoDriverTemp)
        setPhotoPlate(photoPlateTemp)
      }

      if (errorCount > 0) {
        alert(`Error: Solo se capturaron ${3 - errorCount} de 3 imágenes`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al capturar imágenes')
    } finally {
      setLoading(false)
      setOcrLoading(false)
    }
  }

  return (
    <div className="form-modal">
      <div className="form-container">
        <div className="form-header vehicular-header">
          <h1>REGISTRO INGRESO VEHICULAR</h1>
          <div className="header-buttons">
            <button className="btn-config" onClick={() => setMostrarModalConfig(true)}>Configurar</button>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="form-content">
          {/* Sección de Fotos */}
          <div className="photos-section vehicular-photos">
            <div className="photo-box">
              {photoCedula ? (
                <img src={photoCedula} alt="Cédula" className="photo-image" />
              ) : (
                <div className="photo-placeholder">
                  {loading ? (
                    <>
                      <div className="photo-loading-spinner" aria-hidden="true"></div>
                      <p>Cargando cédula...</p>
                    </>
                  ) : (
                    <p>Foto Cédula Conductor</p>
                  )}
                </div>
              )}
            </div>
            <div className="photo-box">
              {photoDriver ? (
                <img src={photoDriver} alt="Conductor" className="photo-image" />
              ) : (
                <div className="photo-placeholder">
                  {loading ? (
                    <>
                      <div className="photo-loading-spinner" aria-hidden="true"></div>
                      <p>Cargando rostro...</p>
                    </>
                  ) : (
                    <p>Foto Rostro Conductor</p>
                  )}
                </div>
              )}
            </div>
            <div className="photo-box">
              {photoPlate ? (
                <img src={photoPlate} alt="Placa" className="photo-image" />
              ) : (
                <div className="photo-placeholder">
                  {loading ? (
                    <>
                      <div className="photo-loading-spinner" aria-hidden="true"></div>
                      <p>Cargando placa...</p>
                    </>
                  ) : (
                    <p>Foto Placa Vehículo</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div className="form-fields">
            <div className="form-group">
              <label>Nombres: <span className="required">*</span></label>
              <div className="input-with-loader">
                <input
                  type="text"
                  name="nombres"
                  placeholder="Ingrese el nombre"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  className={errors.nombres ? 'input-error' : ''}
                />
                {ocrLoading && <span className="field-loading-circle" aria-label="Cargando nombres" title="Cargando nombres" />}
              </div>
              {errors.nombres && <span className="error-message">{errors.nombres}</span>}
            </div>

            <div className="form-group">
              <label>Apellidos: <span className="required">*</span></label>
              <div className="input-with-loader">
                <input
                  type="text"
                  name="apellidos"
                  placeholder="Ingrese los apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  className={errors.apellidos ? 'input-error' : ''}
                />
                {ocrLoading && <span className="field-loading-circle" aria-label="Cargando apellidos" title="Cargando apellidos" />}
              </div>
              {errors.apellidos && <span className="error-message">{errors.apellidos}</span>}
            </div>

            <div className="form-group">
              <label>Cédula: <span className="required">*</span></label>
              <div className="input-with-loader">
                <input
                  type="text"
                  name="cedula"
                  placeholder="Ej: 0912345678"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  className={errors.cedula ? 'input-error' : ''}
                />
                {ocrLoading && <span className="field-loading-circle" aria-label="Cargando cédula" title="Cargando cédula" />}
              </div>
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
              className="btn-capture vehicular-btn"
              onClick={handleCapturar}
              disabled={loading || guardando}
            >
              {loading ? 'Capturando...' : 'Capturar Nuevo Registro'}
            </button>
            <button className="btn-save vehicular-btn" onClick={handleSave} disabled={guardando}>Guardar Registro</button>
            <button className="btn-cancel" onClick={onClose} disabled={guardando}>Cancelar</button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Confirmar Registro</h2>
            <p>¿Deseas guardar este registro vehicular?</p>
            <div className="confirm-buttons">
              <button className="btn-confirm" onClick={confirmSave} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Confirmar'}
              </button>
              <button className="btn-cancel-confirm" onClick={() => setShowConfirm(false)} disabled={guardando}>Cancelar</button>
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
