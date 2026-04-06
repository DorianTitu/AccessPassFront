/**
 * Servicio de operaciones con tickets
 * Incluye: obtener info, editar, obtener fotos
 */

import { httpGet, httpPut } from '../httpClient'
import { ENDPOINTS, API_BASE_URL } from '../constants'
import type {
  ObtenerTicketInfoResponse,
  ObtenerFotosResponse,
  EditarRegistroResponse,
  EditarRegistroVehicularPayload,
  EditarRegistroPeatonalPayload,
  ObtenerRegistrosResponse,
  TicketVehicular,
  TicketPeatonal,
  TicketPeatonalRaw
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
  const url = `${API_BASE_URL}${ENDPOINTS.EDITAR_REGISTRO_VEHICULAR}`
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
  const url = `${API_BASE_URL}${ENDPOINTS.EDITAR_REGISTRO_PEATONAL}`
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
