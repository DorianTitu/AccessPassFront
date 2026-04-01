import { useEffect, useMemo, useState } from 'react'
import './MainDashboard.css'
import Dashboard from './Dashboard'
import PedestrianForm from './PedestrianForm'
import VehicularForm from './VehicularForm'
import CasaSanJoseLogo from '../assets/images/CasaSanJose.png'
import LogoDMTLogo from '../assets/images/LogoDMT.png'
import {
  actualizarHoraSalidaPeatonal,
  TicketPeatonal,
  TicketVehicular,
  actualizarHoraSalida,
  obtenerFotosTicket,
  obtenerFotosTicketPeatonal,
  obtenerRegistrosPeatonales,
  obtenerRegistrosVehiculares
} from '../services/api'

type Page = 'main' | 'dashboard' | 'pedestrian' | 'vehicular'

type FilterType = 'all' | 'open' | 'closed'

type DashboardView = 'pedestrian' | 'vehicular'

interface SelectedTicketInfo {
  tipo: DashboardView
  ticket: string
  nombre: string
  cedula: string
  departamento: string
  horaIngreso: string
  horaSalida: string
}

function formatearDuracionDesde(fecha: Date, nowMs: number): string {
  const diffSeconds = Math.max(0, Math.floor((nowMs - fecha.getTime()) / 1000))
  const horas = Math.floor(diffSeconds / 3600)
  const minutos = Math.floor((diffSeconds % 3600) / 60)
  const segundos = diffSeconds % 60

  return `${horas.toString().padStart(2, '0')}:${minutos
    .toString()
    .padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
}

function obtenerHoraActual(): string {
  return new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

function obtenerEtiquetaFoto(tipo: string): string {
  return PHOTO_TYPE_LABELS[tipo.toLowerCase()] || tipo
}

function construirSrcImagen(base64: string): string {
  if (!base64) return ''
  if (base64.startsWith('data:image')) return base64
  return `data:image/jpeg;base64,${base64}`
}

const PHOTO_TYPE_LABELS: Record<string, string> = {
  cedula: 'Cedula',
  usuario: 'Usuario',
  placa: 'Placa'
}

function sinSalida(ticket: TicketPeatonal | TicketVehicular): boolean {
  const salida = (ticket.hora_salida || '').trim().toLowerCase()
  return salida === '' || salida === '-' || salida === 'no ha salido'
}

function obtenerFechaIngreso(ticket: TicketPeatonal | TicketVehicular): Date | null {
  const normalized = (ticket.fecha_registro || '').replace(' ', 'T')
  if (!normalized) return null
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export default function MainDashboard() {
  const [currentPage, setCurrentPage] = useState<Page>('main')
  const [dashboardView, setDashboardView] = useState<DashboardView>('vehicular')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [pedestrianTickets, setPedestrianTickets] = useState<TicketPeatonal[]>([])
  const [vehicularTickets, setVehicularTickets] = useState<TicketVehicular[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nowMs, setNowMs] = useState(Date.now())
  const [currentTime, setCurrentTime] = useState(new Date())
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(null)
  const [loadingPhotosTicket, setLoadingPhotosTicket] = useState<string | null>(null)
  const [showPhotosModal, setShowPhotosModal] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [previewImageSrc, setPreviewImageSrc] = useState('')
  const [previewImageAlt, setPreviewImageAlt] = useState('')
  const [selectedTicketCode, setSelectedTicketCode] = useState('')
  const [selectedTicketInfo, setSelectedTicketInfo] = useState<SelectedTicketInfo | null>(null)
  const [ticketPhotos, setTicketPhotos] = useState<Record<string, { archivo: string; size_bytes: number; image_base64: string }>>({})
  const [missingPhotos, setMissingPhotos] = useState<string[]>([])
  const [photosError, setPhotosError] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode')
    return saved ? saved === 'dark' : false
  })

  const cargarHistorico = async () => {
    setLoading(true)
    setError('')

    const [vehicularResponse, peatonalResponse] = await Promise.all([
      obtenerRegistrosVehiculares(),
      obtenerRegistrosPeatonales()
    ])

    if (vehicularResponse.success) {
      setVehicularTickets(vehicularResponse.tickets)
    } else {
      setVehicularTickets([])
    }

    if (peatonalResponse.success) {
      setPedestrianTickets(peatonalResponse.tickets)
    } else {
      setPedestrianTickets([])
    }

    if (!vehicularResponse.success && !peatonalResponse.success) {
      setError(
        vehicularResponse.mensaje ||
          peatonalResponse.mensaje ||
          'No se pudo cargar el historico de tickets'
      )
    }

    setLoading(false)
  }

  useEffect(() => {
    cargarHistorico()
  }, [])

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme-mode', theme)
  }, [isDarkMode])

  const handleRegistroExitoso = async () => {
    await cargarHistorico()
  }

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now())
      setCurrentTime(new Date())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
  }

  const handleRegistrarSalidaVehicular = async (ticket: TicketVehicular) => {
    if (updatingTicket) return

    const horaSalida = obtenerHoraActual()
    setUpdatingTicket(ticket.numero_ticket)

    const response = await actualizarHoraSalida({
      ticket: ticket.numero_ticket,
      hora_salida: horaSalida
    })

    if (!response.success) {
      window.alert(response.mensaje || 'No se pudo registrar la salida')
      setUpdatingTicket(null)
      return
    }

    setVehicularTickets((prev) =>
      prev.map((item) =>
        item.numero_ticket === ticket.numero_ticket
          ? {
              ...item,
              hora_salida: horaSalida
            }
          : item
      )
    )

    setUpdatingTicket(null)
  }

  const handleRegistrarSalidaPeatonal = async (ticket: TicketPeatonal) => {
    if (updatingTicket) return

    const horaSalida = obtenerHoraActual()
    setUpdatingTicket(ticket.numero_ticket)

    const response = await actualizarHoraSalidaPeatonal({
      ticket: ticket.numero_ticket,
      hora_salida: horaSalida
    })

    if (!response.success) {
      window.alert(response.mensaje || 'No se pudo registrar la salida peatonal')
      setUpdatingTicket(null)
      return
    }

    setPedestrianTickets((prev) =>
      prev.map((item) =>
        item.numero_ticket === ticket.numero_ticket
          ? {
              ...item,
              hora_salida: horaSalida
            }
          : item
      )
    )

    setUpdatingTicket(null)
  }

  const handleClosePhotosModal = () => {
    setShowPhotosModal(false)
    setShowImagePreview(false)
    setPreviewImageSrc('')
    setPreviewImageAlt('')
    setSelectedTicketCode('')
    setSelectedTicketInfo(null)
    setTicketPhotos({})
    setMissingPhotos([])
    setPhotosError('')
  }

  const handleOpenImagePreview = (src: string, alt: string) => {
    setPreviewImageSrc(src)
    setPreviewImageAlt(alt)
    setShowImagePreview(true)
  }

  const handleCloseImagePreview = () => {
    setShowImagePreview(false)
    setPreviewImageSrc('')
    setPreviewImageAlt('')
  }

  const handleRevisarFotosVehicular = async (ticket: TicketVehicular) => {
    if (loadingPhotosTicket) return

    setLoadingPhotosTicket(ticket.numero_ticket)
    setPhotosError('')
    setSelectedTicketInfo({
      tipo: 'vehicular',
      ticket: ticket.numero_ticket || '-',
      nombre: `${ticket.nombres || ''} ${ticket.apellidos || ''}`.trim() || 'Sin nombre',
      cedula: ticket.cedula || '-',
      departamento: ticket.departamento || '-',
      horaIngreso: ticket.hora_ingreso || '-',
      horaSalida: ticket.hora_salida || 'No ha salido'
    })

    const response = await obtenerFotosTicket(ticket.numero_ticket)

    if (!response.success) {
      setPhotosError(response.mensaje || 'No se pudieron cargar las fotos del ticket')
      setLoadingPhotosTicket(null)
      return
    }

    setSelectedTicketCode(response.ticket || ticket.numero_ticket)
    setTicketPhotos(response.fotos || {})
    setMissingPhotos(Array.isArray(response.faltantes) ? response.faltantes : [])
    setShowPhotosModal(true)
    setLoadingPhotosTicket(null)
  }

  const handleRevisarFotosPeatonal = async (ticket: TicketPeatonal) => {
    if (loadingPhotosTicket) return

    setLoadingPhotosTicket(ticket.numero_ticket)
    setPhotosError('')
    setSelectedTicketInfo({
      tipo: 'pedestrian',
      ticket: ticket.numero_ticket || '-',
      nombre: `${ticket.nombres || ''} ${ticket.apellidos || ''}`.trim() || 'Sin nombre',
      cedula: ticket.cedula || '-',
      departamento: ticket.departamento || '-',
      horaIngreso: ticket.hora_ingreso || '-',
      horaSalida: ticket.hora_salida || 'No ha salido'
    })

    const response = await obtenerFotosTicketPeatonal(ticket.numero_ticket)

    if (!response.success) {
      setPhotosError(response.mensaje || 'No se pudieron cargar las fotos del ticket peatonal')
      setLoadingPhotosTicket(null)
      return
    }

    setSelectedTicketCode(response.ticket || ticket.numero_ticket)
    setTicketPhotos(response.fotos || {})
    setMissingPhotos(Array.isArray(response.faltantes) ? response.faltantes : [])
    setShowPhotosModal(true)
    setLoadingPhotosTicket(null)
  }

  useEffect(() => {
    if (!showPhotosModal && !showImagePreview) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showImagePreview) {
          handleCloseImagePreview()
          return
        }

        handleClosePhotosModal()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [showPhotosModal, showImagePreview])

  const filteredEntries = useMemo(() => {
    let sourceTickets: Array<TicketPeatonal | TicketVehicular>

    if (dashboardView === 'vehicular') {
      sourceTickets = vehicularTickets
    } else {
      sourceTickets = pedestrianTickets
    }

    const filtered = sourceTickets.filter((ticket) => {
      const nombres = (ticket.nombres || '').trim()
      const apellidos = (ticket.apellidos || '').trim()
      const fullName = `${nombres} ${apellidos}`.trim().toLowerCase()
      const term = searchTerm.trim().toLowerCase()
      const cedula = (ticket.cedula || '').toLowerCase()
      const ticketCode = String(ticket.numero_ticket || '').toLowerCase()

      const matchesSearch =
        term.length === 0 ||
        fullName.includes(term) ||
        cedula.includes(term) ||
        ticketCode.includes(term)

      const abierta = sinSalida(ticket)
      const matchesType =
        filterType === 'all' || (filterType === 'open' && abierta) || (filterType === 'closed' && !abierta)

      return matchesSearch && matchesType
    })

    return filtered.reverse()
  }, [pedestrianTickets, vehicularTickets, searchTerm, filterType, dashboardView])

  const pedestrianCount = pedestrianTickets.length
  const vehicleCount = vehicularTickets.length
  const totalCount = pedestrianCount + vehicleCount

  if (currentPage === 'dashboard') {
    return <Dashboard onSelectType={(type) => handleNavigate(type === 'pedestrian' ? 'pedestrian' : 'vehicular')} />
  }

  if (currentPage === 'pedestrian') {
    return <PedestrianForm onClose={() => handleNavigate('main')} onSuccess={handleRegistroExitoso} />
  }

  if (currentPage === 'vehicular') {
    return <VehicularForm onClose={() => handleNavigate('main')} onSuccess={handleRegistroExitoso} />
  }

  return (
    <div className="main-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-logo-casasanjose">
          <img src={CasaSanJoseLogo} alt="Casa San José" className="logo-image" />
        </div>
        <div className="header-content">
          <h1>CONTROL DE ACCESO</h1>
          <p className="header-date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="header-time">{currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
        </div>
        <div className="header-logo-dmt">
          <img src={LogoDMTLogo} alt="DMT" className="logo-image" />
        </div>
        <div className="header-actions">
          <button 
            className="btn-theme-toggle" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            <span className="theme-icon">{isDarkMode ? '●' : '◯'}</span>
          </button>
          <button className="btn-new-entry" onClick={() => handleNavigate('dashboard')}>+ Nuevo Registro</button>
        </div>
      </header>

      {/* Stats */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-label">Ingresos Peatonales</div>
          <div className="stat-value pedestrian-stat">{pedestrianCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ingresos Vehiculares</div>
          <div className="stat-value vehicular-stat">{vehicleCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Ingresos</div>
          <div className="stat-value total-stat">{totalCount}</div>
        </div>
      </section>

      {/* Dashboard View Tabs */}
      <section className="dashboard-tabs">
        <button
          className={`tab-button ${dashboardView === 'vehicular' ? 'active' : ''}`}
          onClick={() => setDashboardView('vehicular')}
        >
          Ingresos Vehiculares
        </button>
        <button
          className={`tab-button ${dashboardView === 'pedestrian' ? 'active' : ''}`}
          onClick={() => setDashboardView('pedestrian')}
        >
          Ingresos Peatonales
        </button>
      </section>

      {/* Filtros y búsqueda */}
      <section className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={dashboardView === 'vehicular' ? 'Buscar por nombre, cédula o placa...' : 'Buscar por nombre o cédula...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Todos
          </button>
          <button
            className={`filter-btn ${filterType === 'open' ? 'active' : ''}`}
            onClick={() => setFilterType('open')}
          >
            Sin Salida
          </button>
          <button
            className={`filter-btn ${filterType === 'closed' ? 'active' : ''}`}
            onClick={() => setFilterType('closed')}
          >
            Con Salida
          </button>
        </div>
      </section>

      {/* Tabla de registros */}
      <section className="entries-section">
        <h2 className="section-title">
          {dashboardView === 'vehicular' ? 'Ingresos Vehiculares' : 'Ingresos Peatonales'}
        </h2>
        <div className="table-wrapper">
          <table className={`entries-table table-${dashboardView}`}>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Persona</th>
                <th>Cédula</th>
                <th>Departamento</th>
                <th>Ingreso</th>
                <th>Salida / Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="table-message">
                    Cargando histórico...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={7} className="table-message error">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredEntries.map((entry) => {
                const abierta = sinSalida(entry)
                const fechaIngreso = obtenerFechaIngreso(entry)
                const tiempoEnSitio = fechaIngreso ? formatearDuracionDesde(fechaIngreso, nowMs) : '--:--:--'
                const nombreCompleto = `${entry.nombres || ''} ${entry.apellidos || ''}`.trim() || 'Sin nombre'
                const horaSalidaTexto = (entry.hora_salida || '').trim()

                return (
                  <tr key={String(entry.numero_ticket || nombreCompleto)} className={`entry-row entry-${dashboardView}`}>
                    <td className="type-cell">
                      <span className={`badge ${dashboardView === 'vehicular' ? 'badge-vehicular' : 'badge-peatonal'}`}>
                        {entry.numero_ticket || '-'}
                      </span>
                    </td>
                    <td className="name-cell">{nombreCompleto}</td>
                    <td className="identifier-cell">{entry.cedula || '-'}</td>
                    <td className="dept-cell">{entry.departamento || '-'}</td>
                    <td className="time-cell">{entry.hora_ingreso || '-'}</td>
                    <td className="status-cell">
                      {abierta ? (
                        <div className="status-open-wrap">
                          <span className="status-tag open">Sin salida</span>
                          <span className="live-counter">{tiempoEnSitio}</span>
                        </div>
                      ) : (
                        <span className="status-tag closed">{horaSalidaTexto || '-'}</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-photos"
                          onClick={() =>
                            dashboardView === 'vehicular'
                              ? handleRevisarFotosVehicular(entry as TicketVehicular)
                              : handleRevisarFotosPeatonal(entry as TicketPeatonal)
                          }
                          disabled={loadingPhotosTicket === entry.numero_ticket}
                        >
                          {loadingPhotosTicket === entry.numero_ticket ? 'Cargando...' : 'Revisar fotos'}
                        </button>

                        {abierta ? (
                          <button
                            type="button"
                            className="btn-exit"
                            onClick={() =>
                              dashboardView === 'vehicular'
                                ? handleRegistrarSalidaVehicular(entry as TicketVehicular)
                                : handleRegistrarSalidaPeatonal(entry as TicketPeatonal)
                            }
                            disabled={updatingTicket === entry.numero_ticket}
                          >
                            {updatingTicket === entry.numero_ticket ? 'Guardando...' : 'Ha salido'}
                          </button>
                        ) : (
                          <span className="exit-registered">Salida registrada</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!loading && !error && filteredEntries.length === 0 && (
          <div className="no-results">
            <p>No se encontraron tickets</p>
          </div>
        )}
      </section>

      {showPhotosModal && (
        <div className="photos-modal-overlay" onClick={handleClosePhotosModal}>
          <div className="photos-modal" onClick={(event) => event.stopPropagation()}>
            <div className="photos-modal-header">
              <div>
                <h3>Fotos del ticket</h3>
                <p>{selectedTicketCode}</p>
              </div>
              <button type="button" className="photos-close-btn" onClick={handleClosePhotosModal} aria-label="Cerrar modal de fotos">
                x
              </button>
            </div>

            {selectedTicketInfo && (
              <div className="ticket-info-panel">
                <div className="ticket-info-row">
                  <span className={`ticket-type-chip ${selectedTicketInfo.tipo}`}>
                    {selectedTicketInfo.tipo === 'vehicular' ? 'Vehicular' : 'Peatonal'}
                  </span>
                  <span className="ticket-code-chip">{selectedTicketInfo.ticket}</span>
                </div>
                <div className="ticket-info-grid">
                  <div><strong>Persona:</strong> {selectedTicketInfo.nombre}</div>
                  <div><strong>Cédula:</strong> {selectedTicketInfo.cedula}</div>
                  <div><strong>Departamento:</strong> {selectedTicketInfo.departamento}</div>
                  <div><strong>Ingreso:</strong> {selectedTicketInfo.horaIngreso}</div>
                  <div><strong>Salida:</strong> {selectedTicketInfo.horaSalida}</div>
                </div>
              </div>
            )}

            {photosError ? (
              <div className="photos-message error">{photosError}</div>
            ) : (
              <>
                <div className="photos-grid">
                  {Object.entries(ticketPhotos).map(([tipo, foto]) => (
                    <article className="photo-card" key={tipo}>
                      <div className="photo-card-top">
                        <span className="photo-type">{obtenerEtiquetaFoto(tipo)}</span>
                      </div>
                      <div className="photo-image-wrap">
                        <img
                          src={construirSrcImagen(foto.image_base64)}
                          alt={`Foto ${obtenerEtiquetaFoto(tipo)} del ticket ${selectedTicketCode}`}
                          className="photo-image"
                          onClick={() =>
                            handleOpenImagePreview(
                              construirSrcImagen(foto.image_base64),
                              `Foto ${obtenerEtiquetaFoto(tipo)} del ticket ${selectedTicketCode}`
                            )
                          }
                        />
                      </div>
                    </article>
                  ))}
                </div>

                {Object.keys(ticketPhotos).length === 0 && (
                  <div className="photos-message">No hay imagenes disponibles para este ticket.</div>
                )}

                {missingPhotos.length > 0 && (
                  <div className="missing-photos-wrap">
                    <span>Faltantes:</span>
                    <div className="missing-photos-list">
                      {missingPhotos.map((item) => (
                        <span className="missing-photo-chip" key={item}>{obtenerEtiquetaFoto(item)}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showImagePreview && (
        <div className="image-preview-overlay" onClick={handleCloseImagePreview}>
          <div className="image-preview-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="image-preview-close"
              onClick={handleCloseImagePreview}
              aria-label="Cerrar vista previa de imagen"
            >
              x
            </button>
            <img src={previewImageSrc} alt={previewImageAlt} className="image-preview" />
          </div>
        </div>
      )}
    </div>
  )
}
