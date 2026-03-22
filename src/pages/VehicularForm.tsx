import { useState, useEffect } from 'react'
import { capturarImagenesVehicular, capturarRostroConductor, capturarCedulaConductor } from '../services/api'
import { obtenerDepartamentos, obtenerMotivos } from '../services/configuracion'
import DepartamentosModal from '../components/DepartamentosModal'
import './FormStyles.css'

interface VehicularFormProps {
  onClose: () => void
}

export default function VehicularForm({ onClose }: VehicularFormProps) {
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

  // Obtener hora actual al montar el componente
  useEffect(() => {
    const ahora = new Date()
    const horaFormato = ahora.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
    setHoraIngreso(horaFormato)
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

  const confirmSave = () => {
    // Aquí iría la lógica de guardado
    setShowConfirm(false)
    alert('Registro guardado exitosamente')
    onClose()
  }

  const handleCapturar = async () => {
    setLoading(true)
    try {
      // Capturar placa, rostro y cédula en paralelo
      const [placaResult, rostroResult, cedulaResult] = await Promise.all([
        capturarImagenesVehicular(),
        capturarRostroConductor(),
        capturarCedulaConductor()
      ])

      let errorCount = 0

      // Procesar captura de placa
      if (placaResult.exito && placaResult.fotoPlaca) {
        const imageData = typeof placaResult.fotoPlaca === 'string' && placaResult.fotoPlaca.startsWith('data:') 
          ? placaResult.fotoPlaca 
          : `data:image/jpeg;base64,${placaResult.fotoPlaca}`
        setPhotoPlate(imageData)
      } else {
        errorCount++
      }

      // Procesar captura de rostro
      if (rostroResult.exito && rostroResult.fotoDriver) {
        const imageData = typeof rostroResult.fotoDriver === 'string' && rostroResult.fotoDriver.startsWith('data:') 
          ? rostroResult.fotoDriver 
          : `data:image/jpeg;base64,${rostroResult.fotoDriver}`
        setPhotoDriver(imageData)
      } else {
        errorCount++
      }

      // Procesar captura de cédula
      if (cedulaResult.exito && cedulaResult.fotoCedula) {
        const imageData = typeof cedulaResult.fotoCedula === 'string' && cedulaResult.fotoCedula.startsWith('data:') 
          ? cedulaResult.fotoCedula 
          : `data:image/jpeg;base64,${cedulaResult.fotoCedula}`
        setPhotoCedula(imageData)
        
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

      if (errorCount > 0) {
        alert(`Error: Solo se capturaron ${3 - errorCount} de 3 imágenes`)
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
                  <p>Foto Cédula Conductor</p>
                </div>
              )}
            </div>
            <div className="photo-box">
              {photoDriver ? (
                <img src={photoDriver} alt="Conductor" className="photo-image" />
              ) : (
                <div className="photo-placeholder">
                  <p>Foto Rostro Conductor</p>
                </div>
              )}
            </div>
            <div className="photo-box">
              {photoPlate ? (
                <img src={photoPlate} alt="Placa" className="photo-image" />
              ) : (
                <div className="photo-placeholder">
                  <p>Foto Placa Vehículo</p>
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
              <label>Cédula: <span className="required">*</span></label>
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
              className="btn-capture vehicular-btn"
              onClick={handleCapturar}
              disabled={loading}
            >
              {loading ? 'Capturando...' : 'Capturar Nuevo Registro'}
            </button>
            <button className="btn-save vehicular-btn" onClick={handleSave}>Guardar Registro</button>
            <button className="btn-cancel" onClick={onClose}>Cancelar</button>
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
              <button className="btn-confirm" onClick={confirmSave}>Confirmar</button>
              <button className="btn-cancel-confirm" onClick={() => setShowConfirm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Extrayendo información...</p>
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
