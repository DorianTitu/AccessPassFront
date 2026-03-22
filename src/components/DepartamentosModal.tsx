import { useState } from 'react'
import { Departamento, obtenerDepartamentos, actualizarDepartamento, agregarDepartamento, eliminarDepartamento } from '../services/configuracion'
import './DepartamentosModal.css'

interface DepartamentosModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DepartamentosModal({ isOpen, onClose }: DepartamentosModalProps) {
  const [departamentos, setDepartamentos] = useState<Departamento[]>(obtenerDepartamentos())
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editandoNombre, setEditandoNombre] = useState('')
  const [editandoMotivos, setEditandoMotivos] = useState<string[]>([])
  const [nuevoMotivo, setNuevoMotivo] = useState('')
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevosMotivos, setNuevosMotivos] = useState<string[]>([])
  const [nuevoMotivoInput, setNuevoMotivoInput] = useState('')

  const iniciarEdicion = (departamento: Departamento) => {
    setEditandoId(departamento.id)
    setEditandoNombre(departamento.nombre)
    setEditandoMotivos([...departamento.motivos])
    setNuevoMotivo('')
  }

  const agregarMotivo = () => {
    if (nuevoMotivo.trim() && !editandoMotivos.includes(nuevoMotivo.trim())) {
      setEditandoMotivos([...editandoMotivos, nuevoMotivo.trim()])
      setNuevoMotivo('')
    }
  }

  const eliminarMotivo = (motivo: string) => {
    setEditandoMotivos(editandoMotivos.filter(m => m !== motivo))
  }

  const guardarEdicion = () => {
    if (editandoId !== null) {
      if (editandoNombre.trim() && editandoMotivos.length > 0) {
        actualizarDepartamento(editandoId, editandoNombre.trim(), editandoMotivos)
        setDepartamentos(obtenerDepartamentos())
        cancelarEdicion()
      } else {
        alert('El nombre y al menos un motivo son requeridos')
      }
    }
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setEditandoNombre('')
    setEditandoMotivos([])
    setNuevoMotivo('')
  }

  const agregarNuevoDepartamento = () => {
    if (nuevoNombre.trim() && nuevosMotivos.length > 0) {
      agregarDepartamento(nuevoNombre.trim(), nuevosMotivos)
      setDepartamentos(obtenerDepartamentos())
      setMostrarFormularioNuevo(false)
      setNuevoNombre('')
      setNuevosMotivos([])
      setNuevoMotivoInput('')
    } else {
      alert('El nombre y al menos un motivo son requeridos')
    }
  }

  const agregarMotivoNuevo = () => {
    if (nuevoMotivoInput.trim() && !nuevosMotivos.includes(nuevoMotivoInput.trim())) {
      setNuevosMotivos([...nuevosMotivos, nuevoMotivoInput.trim()])
      setNuevoMotivoInput('')
    }
  }

  const eliminarMotivoNuevo = (motivo: string) => {
    setNuevosMotivos(nuevosMotivos.filter(m => m !== motivo))
  }

  const eliminarDept = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este departamento?')) {
      eliminarDepartamento(id)
      setDepartamentos(obtenerDepartamentos())
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay-config">
      <div className="modal-config">
        <div className="modal-config-header">
          <h2>Configurar Departamentos y Motivos</h2>
          <button className="close-btn-modal" onClick={onClose}>✕</button>
        </div>

        <div className="modal-config-content">
          {/* Formulario para nuevo departamento */}
          {mostrarFormularioNuevo && (
            <div className="departamento-item nuevo-dept-form">
              <h3>Crear Nuevo Departamento</h3>
              <div className="form-group-modal">
                <label>Nombre del Departamento:</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Marketing"
                  autoFocus
                />
              </div>

              <div className="form-group-modal">
                <label>Motivos:</label>
                <div className="motivo-input-group">
                  <input
                    type="text"
                    value={nuevoMotivoInput}
                    onChange={(e) => setNuevoMotivoInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && agregarMotivoNuevo()}
                    placeholder="Ingrese un motivo y presione Enter o el botón +"
                  />
                  <button className="btn-agregar-motivo" onClick={agregarMotivoNuevo}>+</button>
                </div>
                <div className="motivos-tags">
                  {nuevosMotivos.map((motivo) => (
                    <span key={motivo} className="tag-motivo">
                      {motivo}
                      <button
                        className="btn-eliminar-tag"
                        onClick={() => eliminarMotivoNuevo(motivo)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-buttons-modal">
                <button className="btn-guardar" onClick={agregarNuevoDepartamento}>Crear Departamento</button>
                <button className="btn-cancelar" onClick={() => {
                  setMostrarFormularioNuevo(false)
                  setNuevoNombre('')
                  setNuevosMotivos([])
                  setNuevoMotivoInput('')
                }}>Cancelar</button>
              </div>
            </div>
          )}

          {/* Lista de departamentos */}
          {departamentos.map(dept => (
            <div key={dept.id} className="departamento-item">
              {editandoId === dept.id ? (
                <div className="departamento-form">
                  <div className="form-group-modal">
                    <label>Nombre del Departamento:</label>
                    <input
                      type="text"
                      value={editandoNombre}
                      onChange={(e) => setEditandoNombre(e.target.value)}
                      placeholder="Nombre del departamento"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Motivos:</label>
                    <div className="motivo-input-group">
                      <input
                        type="text"
                        value={nuevoMotivo}
                        onChange={(e) => setNuevoMotivo(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && agregarMotivo()}
                        placeholder="Ingrese un motivo y presione Enter o el botón +"
                      />
                      <button className="btn-agregar-motivo" onClick={agregarMotivo}>+</button>
                    </div>
                    <div className="motivos-tags">
                      {editandoMotivos.map((motivo) => (
                        <span key={motivo} className="tag-motivo">
                          {motivo}
                          <button
                            className="btn-eliminar-tag"
                            onClick={() => eliminarMotivo(motivo)}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-buttons-modal">
                    <button className="btn-guardar" onClick={guardarEdicion}>Guardar Cambios</button>
                    <button className="btn-cancelar" onClick={cancelarEdicion}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="departamento-view">
                  <div className="departamento-nombre">
                    <h3>{dept.nombre}</h3>
                    <div className="action-buttons">
                      <button className="btn-editar" onClick={() => iniciarEdicion(dept)}>Editar</button>
                      <button className="btn-eliminar" onClick={() => eliminarDept(dept.id)}>Eliminar</button>
                    </div>
                  </div>
                  <div className="motivos-tags">
                    {dept.motivos.map((motivo, idx) => (
                      <span key={idx} className="tag-motivo view-mode">
                        {motivo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {!mostrarFormularioNuevo && (
            <button className="btn-nuevo-dpto" onClick={() => setMostrarFormularioNuevo(true)}>
              + Crear Nuevo Departamento
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
