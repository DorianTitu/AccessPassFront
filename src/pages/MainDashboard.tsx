import { useState } from 'react'
import './MainDashboard.css'
import Dashboard from './Dashboard'
import PedestrianForm from './PedestrianForm'
import VehicularForm from './VehicularForm'

type Page = 'main' | 'dashboard' | 'pedestrian' | 'vehicular'

// Datos mockeados
const mockEntries = [
  { id: 1, type: 'peatonal', name: 'Juan Pérez García', identifier: '0912345678', department: 'Administración', time: '09:45', date: '13/03/2026' },
  { id: 2, type: 'vehicular', name: 'Carlos López', identifier: 'PCJ-3791', company: 'Transportes Norte', time: '09:30', date: '13/03/2026' },
  { id: 3, type: 'peatonal', name: 'María González', identifier: '0987654321', department: 'Ventas', time: '09:15', date: '13/03/2026' },
  { id: 4, type: 'vehicular', name: 'Roberto Sánchez', identifier: 'ABC-1234', company: 'Distribuciones Sur', time: '08:50', date: '13/03/2026' },
  { id: 5, type: 'peatonal', name: 'Ana Martínez', identifier: '0912111222', department: 'Logística', time: '08:30', date: '13/03/2026' },
  { id: 6, type: 'vehicular', name: 'Diego Rodríguez', identifier: 'XYZ-9876', company: 'Servicios Express', time: '08:05', date: '13/03/2026' },
  { id: 7, type: 'peatonal', name: 'Patricia Flores', identifier: '0912333444', department: 'IT', time: '07:45', date: '13/03/2026' },
  { id: 8, type: 'vehicular', name: 'Luis Gutiérrez', identifier: 'DEF-5678', company: 'Logística Global', time: '07:20', date: '13/03/2026' },
]

export default function MainDashboard() {
  const [currentPage, setCurrentPage] = useState<Page>('main')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'peatonal' | 'vehicular'>('all')

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
  }

  const filteredEntries = mockEntries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.identifier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || entry.type === filterType
    return matchesSearch && matchesType
  })

  const pedestrianCount = mockEntries.filter(e => e.type === 'peatonal').length
  const vehicleCount = mockEntries.filter(e => e.type === 'vehicular').length

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
          <div className="stat-value total-stat">{mockEntries.length}</div>
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
            className={`filter-btn ${filterType === 'peatonal' ? 'active' : ''}`}
            onClick={() => setFilterType('peatonal')}
          >
            Peatonales
          </button>
          <button
            className={`filter-btn ${filterType === 'vehicular' ? 'active' : ''}`}
            onClick={() => setFilterType('vehicular')}
          >
            Vehiculares
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
                <th>Tipo</th>
                <th>Nombre / Conductor</th>
                <th>Cédula / Placa</th>
                <th>Depto / Empresa</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry.id} className={`entry-row ${entry.type}`}>
                  <td className="type-cell">
                    <span className={`badge badge-${entry.type}`}>
                      {entry.type === 'peatonal' ? 'PEATONAL' : 'VEHICULAR'}
                    </span>
                  </td>
                  <td className="name-cell">{entry.name}</td>
                  <td className="identifier-cell">{entry.identifier}</td>
                  <td className="dept-cell">{entry.type === 'peatonal' ? entry.department : entry.company}</td>
                  <td className="time-cell">{entry.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEntries.length === 0 && (
          <div className="no-results">
            <p>No se encontraron registros</p>
          </div>
        )}
      </section>
    </div>
  )
}
