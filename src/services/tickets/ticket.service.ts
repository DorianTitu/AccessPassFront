/**
 * Servicio de operaciones con tickets
 * Incluye: obtener info, editar, obtener fotos
 */

import { httpGet, httpPut } from '../httpClient'
import { ENDPOINTS } from '../constants'
import type {
  ObtenerTicketInfoResponse,
  ObtenerFotosResponse,
  EditarRegistroResponse,
  EditarRegistroVehicularPayload,
  EditarRegistroPeatonalPayload,
  ObtenerRegistrosResponse,
  TicketVehicular,
  TicketPeatonal,
  TicketPeatonalRaw,
  TicketPeatonalDiaRaw,
  ObtenerIngresosPeatonalDiaResponse,
  DetalleTicketPeatonalDatos,
  ObtenerDetalleTicketPeatonalResponse,
  ActualizarDetalleTicketPeatonalPayload
} from '../types'

/**
 * Normaliza datos peatonales del API a formato esperado por la app
 * Mapea: ticket->numero_ticket, nombre->nombres, apellido->apellidos, ingreso->hora_ingreso, salida_estado->hora_salida
 */
function normalizarTicketPeatonal(rawTicket: TicketPeatonalRaw): TicketPeatonal {
  return {
    numero_ticket: rawTicket.ticket,
    nombres: rawTicket.nombre || '',
    apellidos: rawTicket.apellido || '',
    cedula: rawTicket.cedula,
    hora_ingreso: rawTicket.ingreso,
    hora_salida: rawTicket.salida_estado,
    departamento: rawTicket.departamento,
    motivo: rawTicket.motivo,
    fecha_registro: rawTicket.fecha_registro
  }
}

/**
 * Convierte fecha de formato DD/MM/YYYY HH:MM:SS a YYYY-MM-DD HH:MM:SS
 */
function convertirFechaAlFormatoISO(fechaDDMMYYYY: string, horaHHMMSS: string): string {
  // Formato entrada: "19/04/2026" y "01:36:00"
  const [day, month, year] = fechaDDMMYYYY.split('/')
  // Formato salida: "2026-04-19 01:36:00"
  return `${year}-${month}-${day} ${horaHHMMSS}`
}

/**
 * Normaliza datos del endpoint de ingresos peatonales por día
 * Mapea: numero_cedula->cedula, hora_entrada->hora_ingreso, fecha_ingreso->fecha_registro
 */
function normalizarTicketPeatonalDia(rawTicket: TicketPeatonalDiaRaw): TicketPeatonal {
  // Convertir fecha al formato ISO compatible con obtenerFechaIngreso()
  const fechaISO = convertirFechaAlFormatoISO(rawTicket.fecha_ingreso, rawTicket.hora_entrada)
  
  return {
    numero_ticket: rawTicket.ticket,
    nombres: rawTicket.nombres || '',
    apellidos: rawTicket.apellidos || '',
    cedula: rawTicket.numero_cedula,
    hora_ingreso: rawTicket.hora_entrada,
    hora_salida: rawTicket.hora_salida || '',
    departamento: rawTicket.departamento,
    motivo: rawTicket.motivo,
    fecha_registro: fechaISO
  }
}

/**
 * Obtiene información completa de un ticket vehicular (info + fotos)
 */
export async function obtenerTicketInfoVehicular(
  ticketCode: string
): Promise<ObtenerTicketInfoResponse> {
  const url = `${ENDPOINTS.OBTENER_INFO_TICKET_VEHICULAR}/${encodeURIComponent(ticketCode)}`
  const response = await httpGet<ObtenerTicketInfoResponse>(url)

  if (!response.ok) {
    return {
      success: false,
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  return response.data || { success: false }
}

/**
 * Obtiene información completa de un ticket peatonal (info + fotos)
 */
export async function obtenerTicketInfoPeatonal(
  ticketCode: string
): Promise<ObtenerTicketInfoResponse> {
  const url = `${ENDPOINTS.OBTENER_INFO_TICKET_PEATONAL}/${encodeURIComponent(ticketCode)}`
  const response = await httpGet<ObtenerTicketInfoResponse>(url)

  if (!response.ok) {
    return {
      success: false,
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  return response.data || { success: false }
}

/**
 * Edita datos de un ticket vehicular
 */
export async function editarRegistroVehicular(
  payload: EditarRegistroVehicularPayload
): Promise<EditarRegistroResponse> {
  const url = `http://localhost:8000${ENDPOINTS.EDITAR_REGISTRO_VEHICULAR}`
  const response = await httpPut<EditarRegistroResponse>(
    url,
    payload as unknown as Record<string, unknown>
  )

  if (!response.ok) {
    return {
      success: false,
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  return response.data || { success: false }
}

/**
 * Edita datos de un ticket peatonal
 */
export async function editarRegistroPeatonal(
  payload: EditarRegistroPeatonalPayload
): Promise<EditarRegistroResponse> {
  const url = `http://localhost:8000${ENDPOINTS.EDITAR_REGISTRO_PEATONAL}`
  const response = await httpPut<EditarRegistroResponse>(
    url,
    payload as unknown as Record<string, unknown>
  )

  if (!response.ok) {
    return {
      success: false,
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  return response.data || { success: false }
}

/**
 * Obtiene fotos de un ticket vehicular
 */
export async function obtenerFotosTicket(
  ticket: string | number
): Promise<ObtenerFotosResponse> {
  const url = `${ENDPOINTS.OBTENER_FOTOS_TICKET}/${encodeURIComponent(String(ticket))}`
  const response = await httpGet<ObtenerFotosResponse>(url)

  if (!response.ok) {
    return {
      success: false,
      faltantes: [],
      fotos: {},
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  return response.data || { success: false, faltantes: [], fotos: {} }
}

/**
 * Obtiene fotos de un ticket peatonal
 */
export async function obtenerFotosTicketPeatonal(
  ticket: string | number
): Promise<ObtenerFotosResponse> {
  const url = `${ENDPOINTS.OBTENER_FOTOS_TICKET_PEATONAL}/${encodeURIComponent(String(ticket))}`
  const response = await httpGet<ObtenerFotosResponse>(url)

  if (!response.ok) {
    return {
      success: false,
      faltantes: [],
      fotos: {},
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  return response.data || { success: false, faltantes: [], fotos: {} }
}

/**
 * Obtiene registros vehiculares
 */
export async function obtenerRegistrosVehiculares(): Promise<ObtenerRegistrosResponse<TicketVehicular>> {
  const response = await httpGet<ObtenerRegistrosResponse<TicketVehicular>>(
    ENDPOINTS.OBTENER_REGISTROS_VEHICULARES
  )

  if (!response.ok) {
    return {
      success: false,
      total: 0,
      tickets: [],
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  const data = (response.data || {}) as ObtenerRegistrosResponse<TicketVehicular>
  return {
    success: data.success === true,
    total: data.total || 0,
    tickets: data.tickets || [],
    mensaje: data.mensaje
  }
}

/**
 * Obtiene registros peatonales
 */
export async function obtenerRegistrosPeatonales(): Promise<ObtenerRegistrosResponse<TicketPeatonal>> {
  const response = await httpGet<ObtenerRegistrosResponse<TicketPeatonalRaw>>(
    ENDPOINTS.OBTENER_REGISTROS_PEATONALES
  )

  if (!response.ok) {
    return {
      success: false,
      total: 0,
      tickets: [],
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  const data = (response.data || {}) as ObtenerRegistrosResponse<TicketPeatonalRaw>
  // Normalizar todos los tickets peatonales para que coincidan con el formato esperado
  const normalizedTickets = (data.tickets || []).map(normalizarTicketPeatonal)
  
  return {
    success: data.success === true,
    total: data.total || 0,
    tickets: normalizedTickets,
    mensaje: data.mensaje
  }
}

/**
 * Convierte fecha de formato YYYY-MM-DD a DD/MM/YYYY
 */
function convertirFechaFormat(fecha: string): string {
  const [year, month, day] = fecha.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Obtiene registros peatonales filtrados por día (nuevo endpoint con fecha)
 * @param fecha Fecha en formato YYYY-MM-DD
 */
export async function obtenerRegistrosPeatonalesPorDia(
  fecha: string
): Promise<ObtenerRegistrosResponse<TicketPeatonal>> {
  const fechaFormato = convertirFechaFormat(fecha)
  const url = `http://localhost:8000${ENDPOINTS.OBTENER_INGRESOS_PEATONAL_DIA}?fecha=${encodeURIComponent(fechaFormato)}`
  
  console.log(`📅 Obteniendo registros peatonales para fecha: ${fechaFormato} (${fecha})`)
  console.log(`🔗 URL: ${url}`)

  const response = await httpGet<ObtenerIngresosPeatonalDiaResponse>(url)

  if (!response.ok) {
    console.error('❌ Error al obtener registros peatonales por día:', response.error)
    return {
      success: false,
      total: 0,
      tickets: [],
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  const data = (response.data || {}) as ObtenerIngresosPeatonalDiaResponse
  
  // Normalizar todos los tickets peatonales para que coincidan con el formato esperado
  const normalizedTickets = (data.tickets || []).map(normalizarTicketPeatonalDia)
  
  console.log(`✅ Registros peatonales obtenidos para ${fechaFormato}: ${normalizedTickets.length}`)
  
  return {
    success: data.exito === true,
    total: data.cantidad_tickets || 0,
    tickets: normalizedTickets,
    mensaje: undefined
  }
}

/**
 * Obtiene los detalles de un ticket peatonal específico incluyendo imágenes
 * @param ticketCode Código del ticket (ej: TICKET-ABR-13-088)
 */
export async function obtenerDetalleTicketPeatonal(
  ticketCode: string
): Promise<{ success: boolean; datos?: DetalleTicketPeatonalDatos; mensaje?: string }> {
  const url = `http://localhost:8000${ENDPOINTS.OBTENER_DETALLE_INGRESO_PEATONAL}/${encodeURIComponent(ticketCode)}`
  
  console.log(`📋 Obteniendo detalle del ticket peatonal: ${ticketCode}`)
  console.log(`🔗 URL: ${url}`)

  const response = await httpGet<ObtenerDetalleTicketPeatonalResponse>(url)

  if (!response.ok) {
    console.error('❌ Error al obtener detalle del ticket peatonal:', response.error)
    return {
      success: false,
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  const data = (response.data || {}) as ObtenerDetalleTicketPeatonalResponse
  
  console.log(`✅ Detalle del ticket peatonal obtenido:`, data.datos)
  
  return {
    success: data.exito === true,
    datos: data.datos,
    mensaje: undefined
  }
}

/**
 * Actualiza los detalles de un ticket peatonal
 * @param ticketCode Código del ticket (ej: TICKET-ABR-13-088)
 * @param payload Datos a actualizar
 */
export async function actualizarDetalleTicketPeatonal(
  ticketCode: string,
  payload: ActualizarDetalleTicketPeatonalPayload
): Promise<{ success: boolean; mensaje?: string }> {
  const url = `http://localhost:8000${ENDPOINTS.OBTENER_DETALLE_INGRESO_PEATONAL}/${encodeURIComponent(ticketCode)}`
  
  console.log(`📝 Actualizando ticket peatonal: ${ticketCode}`)
  console.log(`🔗 URL: ${url}`)
  console.log(`📦 Payload:`, payload)

  const response = await httpPut<{ exito: boolean }>(url, payload as unknown as Record<string, unknown>)

  if (!response.ok) {
    console.error('❌ Error al actualizar ticket peatonal:', response.error)
    return {
      success: false,
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  const data = (response.data || {}) as { exito: boolean }
  
  console.log(`✅ Ticket peatonal actualizado exitosamente`)
  
  return {
    success: data.exito === true,
    mensaje: undefined
  }
}
