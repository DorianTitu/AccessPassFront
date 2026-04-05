/**
 * Servicio de registros
 * Incluye: guardar nuevos registros, actualizar horas de salida
 */

import { httpPost, httpPut } from '../httpClient'
import { ENDPOINTS } from '../constants'
import type {
  GuardarRegistroVehicularPayload,
  GuardarRegistroPeatonalPayload,
  ActualizarHoraSalidaPayload,
  BaseResponse
} from '../types'

/**
 * Guarda un nuevo registro vehicular
 */
export async function guardarRegistroVehicular(
  payload: GuardarRegistroVehicularPayload
): Promise<BaseResponse & { numero_ticket?: number; ruta_ticket?: string }> {
  const response = await httpPost(ENDPOINTS.GUARDAR_REGISTRO_VEHICULAR, payload as Record<string, unknown>)

  if (!response.ok) {
    return {
      success: false,
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  return (response.data as BaseResponse & { numero_ticket?: number; ruta_ticket?: string }) || { success: false }
}

/**
 * Guarda un nuevo registro peatonal
 */
export async function guardarRegistroPeatonal(
  payload: GuardarRegistroPeatonalPayload
): Promise<BaseResponse & { numero_ticket?: number; ruta_ticket?: string }> {
  const response = await httpPost(ENDPOINTS.GUARDAR_REGISTRO_PEATONAL, payload as Record<string, unknown>)

  if (!response.ok) {
    return {
      success: false,
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  return (response.data as BaseResponse & { numero_ticket?: number; ruta_ticket?: string }) || { success: false }
}

/**
 * Actualiza la hora de salida de un ticket vehicular
 */
export async function actualizarHoraSalida(
  payload: ActualizarHoraSalidaPayload
): Promise<BaseResponse> {
  const response = await httpPut(ENDPOINTS.ACTUALIZAR_HORA_SALIDA, payload as Record<string, unknown>)

  if (!response.ok) {
    return {
      success: false,
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  return (response.data as BaseResponse) || { success: false }
}

/**
 * Actualiza la hora de salida de un ticket peatonal
 */
export async function actualizarHoraSalidaPeatonal(
  payload: ActualizarHoraSalidaPayload
): Promise<BaseResponse> {
  const response = await httpPut(ENDPOINTS.ACTUALIZAR_HORA_SALIDA_PEATONAL, payload as Record<string, unknown>)

  if (!response.ok) {
    return {
      success: false,
      mensaje: response.error || `Error del servidor: ${response.status}`
    }
  }

  return response.data || { success: false }
}
