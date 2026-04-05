/**
 * Tipos e interfaces compartidas
 */

// === Respuestas OCR y Extracción ===
export interface ExtraerCamposResponse {
  exito: boolean
  nui: string
  nombres: string
  apellidos: string
  confianza: number
}

export interface ExtraerPlacaResponse {
  exito: boolean
  placa: string
  confianza: number
}

export interface ExtraerCedulaVehicularResponse {
  exito: boolean
  nui: string
  nombres: string
  apellidos: string
}

// === Tickets ===
export interface TicketVehicular {
  numero_ticket: string
  nombres: string
  apellidos: string
  cedula: string
  hora_ingreso: string
  hora_salida: string
  departamento: string
  motivo: string
  fecha_registro: string
}

export interface TicketPeatonal {
  numero_ticket: string
  nombres: string
  apellidos: string
  cedula: string
  hora_ingreso: string
  hora_salida: string
  departamento: string
  motivo: string
  fecha_registro: string
}

// === Información de Tickets ===
export interface InformacionTicket {
  ticket: string
  persona?: string
  nombres?: string
  apellidos?: string
  cedula: string
  departamento: string
  ingreso: string
  salida_estado?: string
  fecha_registro: string
}

export interface FotoTicket {
  archivo: string
  size_bytes: number
  image_base64: string
}

// === Payloads ===
export interface GuardarRegistroVehicularPayload {
  apellidos: string
  cedula: string
  departamento: string
  hora_ingreso: string
  imagen_cedula_base64: string
  imagen_placa_base64: string
  imagen_usuario_base64: string
  motivo: string
  nombres: string
}

export interface GuardarRegistroPeatonalPayload {
  nombre: string
  apellido: string
  cedula: string
  departamento: string
  motivo: string
  imagen_cedula_base64: string
  imagen_usuario_base64: string
  hora_ingreso: string
}

export interface ActualizarHoraSalidaPayload {
  ticket: string
  hora_salida: string
}

export interface EditarRegistroVehicularPayload {
  ticket: string
  nombres?: string
  apellidos?: string
  cedula?: string
  departamento?: string
  motivo?: string
}

export interface EditarRegistroPeatonalPayload {
  ticket: string
  nombre?: string
  apellido?: string
  cedula?: string
  departamento?: string
  motivo?: string
}

// === Respuestas API ===
export interface BaseResponse {
  success: boolean
  mensaje?: string
}

export interface ObtenerRegistrosResponse<T> extends BaseResponse {
  total: number
  tickets: T[]
}

export interface ObtenerFotosResponse extends BaseResponse {
  ticket?: string
  ruta_ticket?: string
  total_fotos?: number
  faltantes?: string[]
  fotos?: Record<string, FotoTicket>
}

export interface ObtenerTicketInfoResponse extends BaseResponse {
  ticket?: string
  // Estructura con wrapper informacion (ambos vehicular y peatonal)
  informacion?: InformacionTicket & {
    // Campos adicionales para peatonal
    nombre?: string
    apellido?: string
    hora_ingreso?: string
    hora_salida?: string
  }
  fotos?: Record<string, FotoTicket> | Record<string, unknown>
}

export interface EditarRegistroResponse extends BaseResponse {
  [key: string]: unknown
}
