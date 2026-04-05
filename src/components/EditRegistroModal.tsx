import { useState } from 'react'
import {
  editarRegistroVehicular,
  editarRegistroPeatonal,
  EditarRegistroVehicularPayload,
  EditarRegistroPeatonalPayload
} from '../services/api'
import './EditRegistroModal.css'

interface EditRegistroModalProps {
  isOpen: boolean
  tipo: 'vehicular' | 'pedestrian'
  ticket: string
  nombres: string
  apellidos: string
  cedula: string
  departamento: string
  motivo?: string
  observaciones?: string
  onClose: () => void
  onSuccess: () => void
}

export default function EditRegistroModal({
  isOpen,
  tipo,
  ticket,
  nombres: initialNombres,
  apellidos: initialApellidos,
  cedula: initialCedula,
  departamento: initialDepartamento,
  motivo: initialMotivo = '',
  observaciones: initialObservaciones = '',
  onClose,
  onSuccess
}: EditRegistroModalProps) {
  const [nombres, setNombres] = useState(initialNombres)
  const [apellidos, setApellidos] = useState(initialApellidos)
  const [cedula, setCedula] = useState(initialCedula)
  const [departamento, setDepartamento] = useState(initialDepartamento)
  const [motivo, setMotivo] = useState(initialMotivo)
  const [observaciones, setObservaciones] = useState(initialObservaciones)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (tipo === 'vehicular') {
        const payload: EditarRegistroVehicularPayload = {
          ticket,
          nombres,
          apellidos,
          cedula,
          departamento,
          motivo,
          observaciones
        }
        const response = await editarRegistroVehicular(payload)

        if (!response.success) {
          setError(response.mensaje || 'Error al actualizar el registro vehicular')
          setLoading(false)
          return
        }
      } else {
        // Para peatonal, 'persona' es el nombre completo
        const persona = `${nombres} ${apellidos}`.trim()
        const payload: EditarRegistroPeatonalPayload = {
          ticket,
          persona,
          cedula,
          departamento,
          observaciones
        }
        const response = await editarRegistroPeatonal(payload)

        if (!response.success) {
          setError(response.mensaje || 'Error al actualizar el registro peatonal')
          setLoading(false)
          return
        }
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      setError('Error al comunicarse con el servidor')
      console.error('Error:', err)
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2>{tipo === 'vehicular' ? 'Editar Registro Vehicular' : 'Editar Registro Peatonal'}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {success && <div className="success-message">Registro actualizado correctamente</div>}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="nombres">Nombres</label>
            <input
              id="nombres"
              type="text"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellidos">Apellidos</label>
            <input
              id="apellidos"
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cedula">Cédula</label>
            <input
              id="cedula"
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="departamento">Departamento</label>
            <input
              id="departamento"
              type="text"
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {tipo === 'vehicular' && (
            <div className="form-group">
              <label htmlFor="motivo">Motivo</label>
              <input
                id="motivo"
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
