import { useState } from 'react'
import ScreenCapture from '../components/ScreenCapture'
import './FormStyles.css'

interface VehicularFormProps {
  onClose: () => void
}

export default function VehicularForm({ onClose }: VehicularFormProps) {
  const [formData, setFormData] = useState({
    driverName: '',
    company: '',
    plate: '',
    reason: ''
  })

  const [photoPlate, setPhotoPlate] = useState<string | null>(null)
  const [photoDriver, setPhotoDriver] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showConfirm, setShowConfirm] = useState(false)

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

    if (!formData.driverName.trim()) newErrors.driverName = 'El nombre del conductor es requerido'
    if (!formData.company.trim()) newErrors.company = 'La empresa es requerida'
    if (!formData.plate.trim()) newErrors.plate = 'La placa es requerida'
    if (!formData.reason) newErrors.reason = 'Selecciona un motivo'
    if (!photoPlate) newErrors.photoPlate = 'La foto de placa es requerida'
    if (!photoDriver) newErrors.photoDriver = 'La foto del conductor es requerida'

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

  const handlePhotoPlateClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event: any) => {
        setPhotoPlate(event.target.result)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handlePhotoDriverClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event: any) => {
        setPhotoDriver(event.target.result)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <div className="form-modal">
      <div className="form-container">
        <div className="form-header vehicular-header">
          <h1>REGISTRO INGRESO VEHICULAR</h1>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="form-content">
          {/* Sección de Fotos */}
          <div className="photos-section">
            <div className="photo-box" onClick={handlePhotoPlateClick}>
              {photoPlate ? (
                <img src={photoPlate} alt="Placa" className="photo-image" />
              ) : (
                <div className="photo-placeholder">
                  <p>Foto Placa</p>
                </div>
              )}
            </div>
            <div className="photo-box" onClick={handlePhotoDriverClick}>
              {photoDriver ? (
                <img src={photoDriver} alt="Conductor" className="photo-image" />
              ) : (
                <div className="photo-placeholder">
                  <p>Foto Conductor</p>
                </div>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div className="form-fields">
            <div className="form-group">
              <label>Nombre del Conductor: <span className="required">*</span></label>
              <input
                type="text"
                name="driverName"
                placeholder="Ingrese el nombre del conductor"
                value={formData.driverName}
                onChange={handleInputChange}
                className={errors.driverName ? 'input-error' : ''}
              />
              {errors.driverName && <span className="error-message">{errors.driverName}</span>}
            </div>

            <div className="form-group">
              <label>Empresa: <span className="required">*</span></label>
              <input
                type="text"
                name="company"
                placeholder="Ingrese el nombre de la empresa"
                value={formData.company}
                onChange={handleInputChange}
                className={errors.company ? 'input-error' : ''}
              />
              {errors.company && <span className="error-message">{errors.company}</span>}
            </div>

            <div className="form-group">
              <label>Placa: <span className="required">*</span></label>
              <input
                type="text"
                name="plate"
                placeholder="Ej: ABC-1234"
                value={formData.plate}
                onChange={handleInputChange}
                className={errors.plate ? 'input-error' : ''}
              />
              {errors.plate && <span className="error-message">{errors.plate}</span>}
            </div>

            <div className="form-group">
              <label>Motivo de Ingreso: <span className="required">*</span></label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className={errors.reason ? 'input-error' : ''}
              >
                <option value="">Seleccionar...</option>
              </select>
              {errors.reason && <span className="error-message">{errors.reason}</span>}
            </div>
          </div>

          {/* Componente de Captura */}
          <ScreenCapture type="vehicular" />

          {/* Botones de Acción */}
          <div className="form-buttons">
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
    </div>
  )
}
