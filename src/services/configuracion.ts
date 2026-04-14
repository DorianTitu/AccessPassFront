import configuracion from '../data/configuracion.json'

export interface Departamento {
  id: number
  nombre: string
  motivos: string[]
}

export interface Configuracion {
  departamentos: Departamento[]
}

const ordenarDepartamentos = (departamentos: Departamento[]): Departamento[] =>
  [...departamentos].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))

// Mantener una copia en memoria que se actualiza cuando se guarda
let configEnMemoria: Configuracion | null = null

/**
 * Obtiene la configuración de departamentos y motivos
 */
export function obtenerConfiguracion(): Configuracion {
  // Si existe en memoria, devolverla
  if (configEnMemoria) {
    configEnMemoria.departamentos = ordenarDepartamentos(configEnMemoria.departamentos)
    return configEnMemoria
  }
  
  // Primero intentar obtener del localStorage
  const stored = localStorage.getItem('configuracion_departamentos')
  if (stored) {
    try {
      configEnMemoria = JSON.parse(stored)
      configEnMemoria.departamentos = ordenarDepartamentos(configEnMemoria.departamentos)
      return configEnMemoria
    } catch (e) {
      console.error('Error al parsear configuración del localStorage:', e)
    }
  }
  // Si no existe en localStorage, retornar la configuración por defecto
  configEnMemoria = JSON.parse(JSON.stringify(configuracion)) // Deep copy
  configEnMemoria.departamentos = ordenarDepartamentos(configEnMemoria.departamentos)
  return configEnMemoria
}

/**
 * Obtiene todos los departamentos
 */
export function obtenerDepartamentos(): Departamento[] {
  return obtenerConfiguracion().departamentos
}

/**
 * Obtiene los motivos de un departamento específico
 */
export function obtenerMotivos(departamentoId: number): string[] {
  const departamento = obtenerConfiguracion().departamentos.find(d => d.id === departamentoId)
  return departamento?.motivos || []
}

/**
 * Obtiene el ID del departamento por su nombre
 */
export function obtenerIdDepartamento(nombreDepartamento: string): number {
  const departamento = obtenerConfiguracion().departamentos.find(d => 
    d.nombre.toLowerCase() === nombreDepartamento.toLowerCase()
  )
  return departamento?.id || 0
}

/**
 * Actualiza la configuración (simulado - en producción iría a un backend)
 */
export function actualizarConfiguracion(nuevaConfiguracion: Configuracion): void {
  nuevaConfiguracion.departamentos = ordenarDepartamentos(nuevaConfiguracion.departamentos)
  // Guardar en memoria
  configEnMemoria = nuevaConfiguracion
  // Guardar en localStorage
  localStorage.setItem('configuracion_departamentos', JSON.stringify(nuevaConfiguracion))
  console.log('Configuración actualizada:', nuevaConfiguracion)
}

/**
 * Añade un nuevo departamento
 */
export function agregarDepartamento(nombre: string, motivos: string[]): void {
  const config = obtenerConfiguracion()
  const nuevoId = Math.max(...config.departamentos.map(d => d.id), 0) + 1
  
  config.departamentos.push({
    id: nuevoId,
    nombre,
    motivos
  })
  
  actualizarConfiguracion(config)
}

/**
 * Elimina un departamento
 */
export function eliminarDepartamento(departamentoId: number): void {
  const config = obtenerConfiguracion()
  config.departamentos = config.departamentos.filter(d => d.id !== departamentoId)
  actualizarConfiguracion(config)
}

/**
 * Actualiza un departamento
 */
export function actualizarDepartamento(departamentoId: number, nombre: string, motivos: string[]): void {
  const config = obtenerConfiguracion()
  const departamento = config.departamentos.find(d => d.id === departamentoId)
  
  if (departamento) {
    departamento.nombre = nombre
    departamento.motivos = motivos
    actualizarConfiguracion(config)
  }
}
