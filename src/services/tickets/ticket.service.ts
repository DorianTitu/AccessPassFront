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
  TicketPeatonal
} from '../types'

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
  const response = await httpPut<EditarRegistroResponse>(
    ENDPOINTS.EDITAR_REGISTRO_VEHICULAR,
    payload as Record<string, unknown>
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
  const response = await httpPut<EditarRegistroResponse>(
    ENDPOINTS.EDITAR_REGISTRO_PEATONAL,
    payload as Record<string, unknown>
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

  const data = response.data || {}
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
  const response = await httpGet<ObtenerRegistrosResponse<TicketPeatonal>>(
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

  const data = response.data || {}
  return {
    success: data.success === true,
    total: data.total || 0,
    tickets: data.tickets || [],
    mensaje: data.mensaje
  }
}
