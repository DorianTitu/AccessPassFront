/**
 * Servicio de captura de imágenes y OCR
 */

import { httpGet, httpPost } from '../httpClient'
import { ENDPOINTS, CAPTURE_PARAMS } from '../constants'
import type {
  ExtraerCamposResponse,
  ExtraerPlacaResponse,
  ExtraerCedulaVehicularResponse
} from '../types'

/**
 * Convierte un Data URI (Base64) a Blob
 */
function dataURItoBlob(dataURI: string): Blob {
  const arr = dataURI.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(arr[1])
  const n = bstr.length
  const u8arr = new Uint8Array(n)

  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }

  return new Blob([u8arr], { type: mime })
}

/**
 * Obtiene el base64 plano sin prefijo de data URI
 */
function obtenerBase64Plano(imageData: string): string {
  const partes = imageData.split(',')
  return partes.length > 1 ? partes[1] : imageData
}

/**
 * Extrae campos de cédula mediante OCR
 */
export async function extraerCamposCedula(
  imageData: string | Blob
): Promise<ExtraerCamposResponse> {
  try {
    const formData = new FormData()

    if (typeof imageData === 'string') {
      const blob = dataURItoBlob(imageData)
      formData.append('archivo', blob, 'cedula.png')
    } else {
      formData.append('archivo', imageData, 'cedula.png')
    }

    const response = await httpPost<Record<string, unknown>>(
      ENDPOINTS.EXTRAER_CAMPOS,
      formData
    )

    if (!response.ok || !response.data) {
      return { exito: false, nui: '', nombres: '', apellidos: '', confianza: 0 }
    }

    const data = response.data
    const confianzaValue = data.confianza
    let confianzaNum = 0

    if (typeof confianzaValue === 'string') {
      confianzaNum = parseFloat(confianzaValue.replace('%', '')) / 100
    } else if (typeof confianzaValue === 'number') {
      confianzaNum = confianzaValue > 1 ? confianzaValue / 100 : confianzaValue
    }

    return {
      exito: data.exito === true || false,
      nui: (data.datos as any)?.nui || data.nui || '',
      nombres: (data.datos as any)?.nombres || data.nombres || '',
      apellidos: (data.datos as any)?.apellidos || data.apellidos || '',
      confianza: confianzaNum
    }
  } catch (error) {
    console.error('Error al extraer campos de cédula:', error)
    return { exito: false, nui: '', nombres: '', apellidos: '', confianza: 0 }
  }
}

/**
 * Extrae placa vehicular mediante OCR
 */
export async function extraerPlaca(imageData: string | Blob): Promise<ExtraerPlacaResponse> {
  try {
    const formData = new FormData()

    if (typeof imageData === 'string') {
      const blob = dataURItoBlob(imageData)
      formData.append('archivo', blob, 'placa.png')
    } else {
      formData.append('archivo', imageData, 'placa.png')
    }

    const response = await httpPost<Record<string, unknown>>(
      ENDPOINTS.PLACA_EXTRAER,
      formData
    )

    if (!response.ok || !response.data) {
      return { exito: false, placa: '', confianza: 0 }
    }

    const data = response.data
    const confianzaValue = data.confianza
    let confianzaNum = 0

    if (typeof confianzaValue === 'string') {
      confianzaNum = parseFloat(confianzaValue.replace('%', '')) / 100
    } else if (typeof confianzaValue === 'number') {
      confianzaNum = confianzaValue > 1 ? confianzaValue / 100 : confianzaValue
    }

    return {
      exito: data.exito === true || false,
      placa: (data.datos as any)?.placa || data.placa || '',
      confianza: confianzaNum
    }
  } catch (error) {
    console.error('Error al extraer placa:', error)
    return { exito: false, placa: '', confianza: 0 }
  }
}

/**
 * Captura imagen de placa vehicular
 */
export async function capturarImagenesVehicular(): Promise<{
  fotoPlaca: string
  exito: boolean
}> {
  try {
    const url = `${ENDPOINTS.CAPTURA_PLACA}?${CAPTURE_PARAMS.INCLUDE_DATA_URL}&${CAPTURE_PARAMS.INCLUDE_IMAGE}&${CAPTURE_PARAMS.RESPONSE_MODE}`
    const response = await httpGet<Record<string, unknown>>(url)

    if (!response.ok || !response.data) {
      return { fotoPlaca: '', exito: false }
    }

    const data = response.data
    const imagen = (data.image_base64 as string) || ''
    const exito = data.success === true && !!imagen

    return { fotoPlaca: imagen, exito }
  } catch (error) {
    console.error('Error al capturar placa vehicular:', error)
    return { fotoPlaca: '', exito: false }
  }
}

/**
 * Captura rostro del conductor
 */
export async function capturarRostroConductor(): Promise<{
  fotoDriver: string
  exito: boolean
}> {
  try {
    const url = `${ENDPOINTS.CAPTURA_ROSTRO_CONDUCTOR}?${CAPTURE_PARAMS.INCLUDE_DATA_URL}&${CAPTURE_PARAMS.INCLUDE_IMAGE}&${CAPTURE_PARAMS.RESPONSE_MODE}`
    const response = await httpGet<Record<string, unknown>>(url)

    if (!response.ok || !response.data) {
      return { fotoDriver: '', exito: false }
    }

    const data = response.data
    const imagen = (data.image_base64 as string) || ''
    const exito = data.success === true && !!imagen

    return { fotoDriver: imagen, exito }
  } catch (error) {
    console.error('Error al capturar rostro del conductor:', error)
    return { fotoDriver: '', exito: false }
  }
}

/**
 * Captura cédula del conductor
 */
export async function capturarCedulaConductor(): Promise<{
  fotoCedula: string
  nui: string
  nombres: string
  apellidos: string
  exito: boolean
}> {
  try {
    const url = `${ENDPOINTS.CAPTURA_CEDULA_CONDUCTOR}?${CAPTURE_PARAMS.INCLUDE_DATA_URL}&${CAPTURE_PARAMS.INCLUDE_IMAGE}&${CAPTURE_PARAMS.RESPONSE_MODE}`
    const response = await httpGet<Record<string, unknown>>(url)

    if (!response.ok || !response.data) {
      return { fotoCedula: '', nui: '', nombres: '', apellidos: '', exito: false }
    }

    const data = response.data
    const imagen = (data.image_base64 as string) || ''
    const exito = data.success === true && !!imagen

    const ocrData = data.ocr_data && typeof data.ocr_data === 'object' ? data.ocr_data : null

    return {
      fotoCedula: imagen,
      nui: (ocrData as any)?.cedula || (ocrData as any)?.nui || '',
      nombres: (ocrData as any)?.nombres || '',
      apellidos: (ocrData as any)?.apellidos || '',
      exito
    }
  } catch (error) {
    console.error('Error al capturar cédula del conductor:', error)
    return { fotoCedula: '', nui: '', nombres: '', apellidos: '', exito: false }
  }
}

/**
 * Extrae OCR de cédula vehicular
 */
export async function extraerCedulaVehicular(
  imageData: string
): Promise<ExtraerCedulaVehicularResponse> {
  try {
    const base64Plain = obtenerBase64Plano(imageData)
    const url = `${ENDPOINTS.EXTRAER_CEDULA_VEHICULAR}?imagen_cedula_base64=${encodeURIComponent(base64Plain)}`
    const response = await httpGet<Record<string, unknown>>(url)

    if (!response.ok || !response.data) {
      return { exito: false, nui: '', nombres: '', apellidos: '' }
    }

    const data = response.data
    const ocrData = data.ocr_data && typeof data.ocr_data === 'object' ? data.ocr_data : null

    return {
      exito: data.success === true,
      nui: (ocrData as any)?.cedula || (ocrData as any)?.nui || '',
      nombres: (ocrData as any)?.nombres || '',
      apellidos: (ocrData as any)?.apellidos || ''
    }
  } catch (error) {
    console.error('Error al extraer OCR de cédula vehicular:', error)
    return { exito: false, nui: '', nombres: '', apellidos: '' }
  }
}

/**
 * Captura imágenes para registro peatonal
 */
export async function capturarImagenesPeatonal(): Promise<{
  fotoID: string
  fotoFace: string
  exito: boolean
}> {
  try {
    const response = await httpPost(ENDPOINTS.CAPTURA_PEATONAL, {})

    if (!response.ok || !response.data) {
      return { fotoID: '', fotoFace: '', exito: false }
    }

    const data = response.data as any
    return {
      fotoID: data.fotoID || data.foto_id || data.fotoCedula || '',
      fotoFace: data.fotoFace || data.foto_face || data.fotoRostro || '',
      exito: !!data.fotoID || !!data.fotoFace
    }
  } catch (error) {
    console.error('Error al capturar imágenes peatonal:', error)
    return { fotoID: '', fotoFace: '', exito: false }
  }
}

/**
 * Captura cédula para registro peatonal
 */
export async function capturarCedulaPeatonal(): Promise<{
  fotoID: string
  nui: string
  nombres: string
  apellidos: string
  exito: boolean
}> {
  try {
    const url = `${ENDPOINTS.CAPTURA_CEDULA_PEATONAL}?${CAPTURE_PARAMS.INCLUDE_DATA_URL}&${CAPTURE_PARAMS.INCLUDE_IMAGE}&${CAPTURE_PARAMS.RESPONSE_MODE}`
    const response = await httpGet<Record<string, unknown>>(url)

    if (!response.ok || !response.data) {
      return { fotoID: '', nui: '', nombres: '', apellidos: '', exito: false }
    }

    const data = response.data
    const imagen = (data.image_base64 as string) || ''
    const exito = data.success === true && !!imagen

    let nui = ''
    let nombres = ''
    let apellidos = ''

    if (data.ocr_data) {
      const ocrData = data.ocr_data as any
      nui = ocrData.cedula || ocrData.nui || ''
      nombres = ocrData.nombres || ''
      apellidos = ocrData.apellidos || ''
    }

    return { fotoID: imagen, nui, nombres, apellidos, exito }
  } catch (error) {
    console.error('Error al capturar cédula peatonal:', error)
    return { fotoID: '', nui: '', nombres: '', apellidos: '', exito: false }
  }
}

/**
 * Captura rostro para registro peatonal
 */
export async function capturarRostroPeatonal(): Promise<{
  fotoFace: string
  exito: boolean
}> {
  try {
    const url = `${ENDPOINTS.CAPTURA_ROSTRO_PEATONAL}?${CAPTURE_PARAMS.INCLUDE_DATA_URL}&${CAPTURE_PARAMS.INCLUDE_IMAGE}&${CAPTURE_PARAMS.RESPONSE_MODE}`
    const response = await httpGet<Record<string, unknown>>(url)

    if (!response.ok || !response.data) {
      return { fotoFace: '', exito: false }
    }

    const data = response.data
    const imagen = (data.image_base64 as string) || ''
    const exito = data.success === true && !!imagen

    return { fotoFace: imagen, exito }
  } catch (error) {
    console.error('Error al capturar rostro peatonal:', error)
    return { fotoFace: '', exito: false }
  }
}

/**
 * Verifica disponibilidad del backend
 */
export async function verificarHealth(): Promise<boolean> {
  const response = await httpGet(ENDPOINTS.HEALTH)
  return response.ok
}
