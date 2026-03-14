import { useState } from 'react'
import ScreenCapture from '../components/ScreenCapture'
import './FormStyles.css'

interface PedestrianFormProps {
  onClose: () => void
}

export default function PedestrianForm({ onClose }: PedestrianFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    cedula: '',
    department: '',
    reason: ''
  })

  const [photoID, setPhotoID] = useState<string | null>(null)
  const [photoFace, setPhotoFace] = useState<string | null>(null)
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

    if (!formData.fullName.trim()) newErrors.fullName = 'El nombre es requerido'
    if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es requerida'
    if (!formData.department) newErrors.department = 'Selecciona un departamento'
    if (!formData.reason) newErrors.reason = 'Selecciona un motivo'
    if (!photoID) newErrors.photoID = 'La foto de cédula es requerida'
    if (!photoFace) newErrors.photoFace = 'La foto de rostro es requerida'

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



  const handleCapturedPhotos = (photoID: string, photoFace: string) => {
    setPhotoID(photoID)
    setPhotoFace(photoFace)
  }

  return (
    <div className="form-modal">
      <div className="form-container">
        <div className="form-header pedestrian-header">
          <h1>REGISTRO INGRESO PEATONAL</h1>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="form-content">
          {/* Sección de Fotos */}
          <div className="photos-section">
            <div className="photo-box">
              {photoID ? (
                <img src={photoID} alt="Cédula" className="photo-image" />
              ) : (
                <div className="photo-placeholder">
                  <p>Foto Cédula</p>
                </div>
              )}
            </div>
            <div className="photo-box">
              {photoFace ? (
                <img src={photoFace} alt="Rostro" className="photo-image" />
              ) : (
                <div className="photo-placeholder">
                  <p>Foto Rostro</p>
                </div>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div className="form-fields">
            <div className="form-group">
              <label>Nombre Completo: <span className="required">*</span></label>
              <input
                type="text"
                name="fullName"
                placeholder="Ingrese el nombre completo"
                value={formData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? 'input-error' : ''}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
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
              <label>Departamento: <span className="required">*</span></label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={errors.department ? 'input-error' : ''}
              >
                <option value="">Seleccionar...</option>
                <option value="administracion">Administración</option>
                <option value="ventas">Ventas</option>
                <option value="logistica">Logística</option>
                <option value="recursos-humanos">Recursos Humanos</option>
                <option value="it">IT</option>
              </select>
              {errors.department && <span className="error-message">{errors.department}</span>}
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
          <ScreenCapture type="pedestrian" onPedestrianPhotosCapture={handleCapturedPhotos} />

          {/* Botones de Acción */}
          <div className="form-buttons">
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
              <button className="btn-confirm" onClick={confirmSave}>Confirmar</button>
              <button className="btn-cancel-confirm" onClick={() => setShowConfirm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
