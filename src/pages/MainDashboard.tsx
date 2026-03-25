import { useEffect, useMemo, useState } from 'react'
import './MainDashboard.css'
import Dashboard from './Dashboard'
import PedestrianForm from './PedestrianForm'
import VehicularForm from './VehicularForm'
import { TicketVehicular, actualizarHoraSalida, obtenerRegistrosVehiculares } from '../services/api'

type Page = 'main' | 'dashboard' | 'pedestrian' | 'vehicular'

type FilterType = 'all' | 'open' | 'closed'

function sinSalida(ticket: TicketVehicular): boolean {
  return ticket.hora_salida.trim().toLowerCase() === 'no ha salido'
}

function obtenerFechaIngreso(ticket: TicketVehicular): Date | null {
  const normalized = ticket.fecha_registro.replace(' ', 'T')
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
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

export default function MainDashboard() {
  const [currentPage, setCurrentPage] = useState<Page>('main')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [tickets, setTickets] = useState<TicketVehicular[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nowMs, setNowMs] = useState(Date.now())
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(null)

  useEffect(() => {
    let activo = true

    const cargarHistorico = async () => {
      setLoading(true)
      setError('')

      const response = await obtenerRegistrosVehiculares()
      if (!activo) return

      if (response.success) {
        setTickets(response.tickets)
      } else {
        setTickets([])
        setError(response.mensaje || 'No se pudo cargar el historico vehicular')
      }

      setLoading(false)
    }

    cargarHistorico()

    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
  }

  const handleRegistrarSalida = async (ticket: TicketVehicular) => {
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

    setTickets((prev) =>
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

  const filteredEntries = useMemo(() => {
    const visibles = tickets.filter((ticket) => {
      const fullName = `${ticket.nombres} ${ticket.apellidos}`.trim().toLowerCase()
      const term = searchTerm.trim().toLowerCase()

      const matchesSearch =
        term.length === 0 ||
        fullName.includes(term) ||
        ticket.cedula.toLowerCase().includes(term) ||
        ticket.numero_ticket.toLowerCase().includes(term)

      const abierta = sinSalida(ticket)
      const matchesType =
        filterType === 'all' || (filterType === 'open' && abierta) || (filterType === 'closed' && !abierta)

      return matchesSearch && matchesType
    })

    return visibles.reverse()
  }, [tickets, searchTerm, filterType])

  const pedestrianCount = 0
  const vehicleCount = tickets.length

  if (currentPage === 'dashboard') {
    return <Dashboard onSelectType={(type) => handleNavigate(type === 'pedestrian' ? 'pedestrian' : 'vehicular')} />
  }

  if (currentPage === 'pedestrian') {
    return <PedestrianForm onClose={() => handleNavigate('main')} />
  }

  if (currentPage === 'vehicular') {
    return <VehicularForm onClose={() => handleNavigate('main')} />
  }

  return (
    <div className="main-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>CONTROL DE ACCESO</h1>
          <p className="header-date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="btn-new-entry" onClick={() => handleNavigate('dashboard')}>+ Nuevo Registro</button>
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
          <div className="stat-value total-stat">{tickets.length}</div>
        </div>
      </section>

      {/* Filtros y búsqueda */}
      <section className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o placa..."
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
        <h2 className="section-title">Últimos Ingresos</h2>
        <div className="table-wrapper">
          <table className="entries-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Conductor</th>
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
                  <td colSpan={7} className="table-message">Cargando histórico...</td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={7} className="table-message error">{error}</td>
                </tr>
              )}

              {!loading && !error && filteredEntries.map((entry) => {
                const abierta = sinSalida(entry)
                const fechaIngreso = obtenerFechaIngreso(entry)
                const tiempoEnSitio = fechaIngreso ? formatearDuracionDesde(fechaIngreso, nowMs) : '--:--:--'

                return (
                  <tr key={entry.numero_ticket} className="entry-row vehicular">
                    <td className="type-cell">
                      <span className="badge badge-vehicular">{entry.numero_ticket}</span>
                    </td>
                    <td className="name-cell">{`${entry.nombres} ${entry.apellidos}`.trim()}</td>
                    <td className="identifier-cell">{entry.cedula}</td>
                    <td className="dept-cell">{entry.departamento}</td>
                    <td className="time-cell">{entry.hora_ingreso}</td>
                    <td className="status-cell">
                      {abierta ? (
                        <div className="status-open-wrap">
                          <span className="status-tag open">Sin salida</span>
                          <span className="live-counter">{tiempoEnSitio}</span>
                        </div>
                      ) : (
                        <span className="status-tag closed">{entry.hora_salida}</span>
                      )}
                    </td>
                    <td>
                      {abierta ? (
                        <button
                          type="button"
                          className="btn-exit"
                          onClick={() => handleRegistrarSalida(entry)}
                          disabled={updatingTicket === entry.numero_ticket}
                        >
                          {updatingTicket === entry.numero_ticket ? 'Guardando...' : 'Ha salido'}
                        </button>
                      ) : (
                        <span className="exit-registered">Salida registrada</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!loading && !error && filteredEntries.length === 0 && (
          <div className="no-results">
            <p>No se encontraron registros</p>
          </div>
        )}
      </section>
    </div>
  )
}
