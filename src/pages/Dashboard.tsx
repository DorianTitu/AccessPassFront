import './Dashboard.css'

interface DashboardProps {
  onSelectType: (type: 'pedestrian' | 'vehicular') => void
}

export default function Dashboard({ onSelectType }: DashboardProps) {
  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <h1 className="dashboard-title">SISTEMA DE CONTROL DE ACCESO</h1>
        <p className="dashboard-subtitle">Selecciona el tipo de registro</p>

        <div className="options-grid">
          {/* Opción Peatonal */}
          <div className="option-card" onClick={() => onSelectType('pedestrian')}>
            <div className="option-icon pedestrian-icon">P</div>
            <h2>Ingreso Peatonal</h2>
            <p>Registro de personas</p>
          </div>

          {/* Opción Vehicular */}
          <div className="option-card" onClick={() => onSelectType('vehicular')}>
            <div className="option-icon vehicular-icon">V</div>
            <h2>Ingreso Vehicular</h2>
            <p>Registro de vehículos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
