const API_BASE_URL = 'http://localhost:8000/api'

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

function obtenerBase64Plano(imageData: string): string {
  const partes = imageData.split(',')
  return partes.length > 1 ? partes[1] : imageData
}

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
  persona: string
  cedula: string
  departamento: string
  imagen_cedula_base64?: string
  imagen_usuario_base64?: string
  hora_ingreso?: string
}

export interface GuardarRegistroVehicularResponse {
  success: boolean
  numero_ticket?: number
  mensaje?: string
  ruta_ticket?: string
  [key: string]: unknown
}

export interface GuardarRegistroPeatonalResponse {
  success: boolean
  numero_ticket?: number
  mensaje?: string
  ruta_ticket?: string
  [key: string]: unknown
}

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

export interface ObtenerRegistrosVehicularesResponse {
  success: boolean
  total: number
  tickets: TicketVehicular[]
  mensaje?: string
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

export interface ObtenerRegistrosPeatonalesResponse {
  success: boolean
  total: number
  tickets: TicketPeatonal[]
  mensaje?: string
}

export interface ActualizarHoraSalidaPayload {
  ticket: string
  hora_salida: string
}

export interface ActualizarHoraSalidaResponse {
  success: boolean
  mensaje?: string
  [key: string]: unknown
}

export interface FotoTicket {
  archivo: string
  size_bytes: number
  image_base64: string
}

export interface ObtenerFotosTicketResponse {
  success: boolean
  ticket?: string
  ruta_ticket?: string
  total_fotos?: number
  faltantes?: string[]
  fotos?: Record<string, FotoTicket>
  mensaje?: string
}

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
 * Envia una imagen de cédula al backend para extraer datos
 * @param imageData - Base64 (Data URI) o Blob de la imagen
 * @returns Objeto con los datos extraídos (nui, nombres, apellidos)
 */
export async function extraerCamposCedula(
  imageData: string | Blob
): Promise<ExtraerCamposResponse> {
  try {
    const formData = new FormData()

    // Convertir Base64 a Blob si es necesario
    if (typeof imageData === 'string') {
      const blob = dataURItoBlob(imageData)
      formData.append('archivo', blob, 'cedula.png')
    } else {
      formData.append('archivo', imageData, 'cedula.png')
    }

    console.log('Enviando imagen de cédula al backend...')
    const response = await fetch(`${API_BASE_URL}/extraer-campos`, {
      method: 'POST',
      body: formData
    })

    console.log('Respuesta del backend:', response.status)

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    console.log('Datos extraídos del backend:', data)
    
    // El backend retorna datos dentro de un objeto "datos"
    const confianzaValue = data.confianza
    let confianzaNum = 0
    
    if (typeof confianzaValue === 'string') {
      // Si viene como "75.15%" o "75.15", extraer el número
      confianzaNum = parseFloat(confianzaValue.replace('%', '')) / 100
    } else if (typeof confianzaValue === 'number') {
      // Si ya es número, asumir que está en rango 0-100
      confianzaNum = confianzaValue > 1 ? confianzaValue / 100 : confianzaValue
    }
    
    return {
      exito: data.exito || false,
      nui: data.datos?.nui || data.nui || '',
      nombres: data.datos?.nombres || data.nombres || '',
      apellidos: data.datos?.apellidos || data.apellidos || '',
      confianza: confianzaNum
    }
  } catch (error) {
    console.error('Error al extraer campos de cédula:', error)
    return {
      exito: false,
      nui: '',
      nombres: '',
      apellidos: '',
      confianza: 0
    }
  }
}

/**
 * Envía una imagen de placa al backend para extraer la placa
 * @param imageData - Base64 (Data URI) o Blob de la imagen
 * @returns Objeto con la placa extraída
 */
export async function extraerPlaca(
  imageData: string | Blob
): Promise<ExtraerPlacaResponse> {
  try {
    const formData = new FormData()

    // Convertir Base64 a Blob si es necesario
    if (typeof imageData === 'string') {
      const blob = dataURItoBlob(imageData)
      formData.append('archivo', blob, 'placa.png')
    } else {
      formData.append('archivo', imageData, 'placa.png')
    }

    console.log('Enviando imagen de placa al backend...')
    const response = await fetch(`${API_BASE_URL}/placa/extraer`, {
      method: 'POST',
      body: formData
    })

    console.log('Respuesta del backend placa:', response.status)

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    console.log('Placa extraída del backend:', data)
    
    const confianzaValue = data.confianza
    let confianzaNum = 0
    
    if (typeof confianzaValue === 'string') {
      // Si viene como "75.15%" o "75.15", extraer el número
      confianzaNum = parseFloat(confianzaValue.replace('%', '')) / 100
    } else if (typeof confianzaValue === 'number') {
      // Si ya es número, asumir que está en rango 0-100
      confianzaNum = confianzaValue > 1 ? confianzaValue / 100 : confianzaValue
    }
    
    return {
      exito: data.exito || false,
      placa: data.datos?.placa || data.placa || '',
      confianza: confianzaNum
    }
  } catch (error) {
    console.error('Error al extraer placa:', error)
    return {
      exito: false,
      placa: '',
      confianza: 0
    }
  }
}

/**
 * Verifica que el backend esté disponible
 */
export async function verificarHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch (error) {
    console.error('Backend no disponible:', error)
    return false
  }
}

/**
 * Guarda un registro de ingreso vehicular en el backend.
 */
export async function guardarRegistroVehicular(
  payload: GuardarRegistroVehicularPayload
): Promise<GuardarRegistroVehicularResponse> {
  try {
    const response = await fetch('/save/registro_vehicular', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    let data: GuardarRegistroVehicularResponse = { success: false }

    try {
      data = await response.json()
    } catch {
      // Si el backend no retorna JSON válido, se conserva el valor por defecto.
    }

    if (!response.ok) {
      return {
        ...data,
        success: false,
        mensaje: data.mensaje || `Error del servidor: ${response.status}`
      }
    }

    return {
      ...data,
      success: data.success === true
    }
  } catch (error) {
    console.error('Error al guardar registro vehicular:', error)
    return {
      success: false,
      mensaje: 'No se pudo conectar con el servidor de guardado'
    }
  }
}

/**
 * Guarda un registro de ingreso peatonal en el backend.
 */
export async function guardarRegistroPeatonal(
  payload: GuardarRegistroPeatonalPayload
): Promise<GuardarRegistroPeatonalResponse> {
  try {
    const response = await fetch('/save/registro_peatonal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    let data: GuardarRegistroPeatonalResponse = { success: false }

    try {
      data = await response.json()
    } catch {
      // Si el backend no retorna JSON valido, se conserva el valor por defecto.
    }

    if (!response.ok) {
      return {
        ...data,
        success: false,
        mensaje: data.mensaje || `Error del servidor: ${response.status}`
      }
    }

    return {
      ...data,
      success: data.success === true
    }
  } catch (error) {
    console.error('Error al guardar registro peatonal:', error)
    return {
      success: false,
      mensaje: 'No se pudo conectar con el servidor de guardado peatonal'
    }
  }
}

/**
 * Obtiene el historico de registros vehiculares desde el backend.
 */
export async function obtenerRegistrosVehiculares(): Promise<ObtenerRegistrosVehicularesResponse> {
  try {
    const response = await fetch('/get/registro_vehicular')

    let data: Partial<ObtenerRegistrosVehicularesResponse> = {}

    try {
      data = await response.json()
    } catch {
      // Si la respuesta no es JSON, devolvemos estructura vacia controlada.
    }

    if (!response.ok) {
      return {
        success: false,
        total: 0,
        tickets: [],
        mensaje: data.mensaje || `Error del servidor: ${response.status}`
      }
    }

    return {
      success: data.success === true,
      total: typeof data.total === 'number' ? data.total : Array.isArray(data.tickets) ? data.tickets.length : 0,
      tickets: Array.isArray(data.tickets) ? data.tickets as TicketVehicular[] : [],
      mensaje: data.mensaje
    }
  } catch (error) {
    console.error('Error al obtener registros vehiculares:', error)
    return {
      success: false,
      total: 0,
      tickets: [],
      mensaje: 'No se pudo conectar con el servidor para consultar el historico'
    }
  }
}

/**
 * Obtiene el historico de registros peatonales desde el backend.
 */
export async function obtenerRegistrosPeatonales(): Promise<ObtenerRegistrosPeatonalesResponse> {
  try {
    const response = await fetch('/get/registro_peatonal')

    let data: Partial<ObtenerRegistrosPeatonalesResponse> = {}

    try {
      data = await response.json()
    } catch {
      // Si la respuesta no es JSON, devolvemos estructura vacia controlada.
    }

    if (!response.ok) {
      return {
        success: false,
        total: 0,
        tickets: [],
        mensaje: data.mensaje || `Error del servidor: ${response.status}`
      }
    }

    const rawTickets = Array.isArray(data.tickets)
      ? ((data.tickets as unknown) as Array<Record<string, unknown>>)
      : []

    const tickets: TicketPeatonal[] = rawTickets.map((rawTicket) => {
      const persona = String(rawTicket.persona || '').trim()
      const personaPartes = persona.split(/\s+/).filter(Boolean)
      const nombres = personaPartes.slice(0, 2).join(' ') || persona
      const apellidos = personaPartes.slice(2).join(' ')
      const salidaEstado = rawTicket.salida_estado

      return {
        numero_ticket: String(rawTicket.ticket || ''),
        nombres,
        apellidos,
        cedula: String(rawTicket.cedula || ''),
        hora_ingreso: String(rawTicket.ingreso || ''),
        hora_salida: salidaEstado == null || String(salidaEstado).trim() === '' ? 'No ha salido' : String(salidaEstado),
        departamento: String(rawTicket.departamento || ''),
        motivo: '',
        fecha_registro: String(rawTicket.fecha_registro || '')
      }
    })

    return {
      success: data.success === true,
      total: typeof data.total === 'number' ? data.total : tickets.length,
      tickets,
      mensaje: data.mensaje
    }
  } catch (error) {
    console.error('Error al obtener registros peatonales:', error)
    return {
      success: false,
      total: 0,
      tickets: [],
      mensaje: 'No se pudo conectar con el servidor para consultar el historico peatonal'
    }
  }
}

/**
 * Actualiza la hora de salida de un ticket vehicular.
 */
export async function actualizarHoraSalida(
  payload: ActualizarHoraSalidaPayload
): Promise<ActualizarHoraSalidaResponse> {
  try {
    const response = await fetch('/update/hora_salida', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    let data: ActualizarHoraSalidaResponse = { success: false }

    try {
      data = await response.json()
    } catch {
      // Si no retorna JSON, se conserva valor por defecto.
    }

    if (!response.ok) {
      return {
        ...data,
        success: false,
        mensaje: data.mensaje || `Error del servidor: ${response.status}`
      }
    }

    return {
      ...data,
      success: data.success === true
    }
  } catch (error) {
    console.error('Error al actualizar hora de salida:', error)
    return {
      success: false,
      mensaje: 'No se pudo conectar con el servidor para actualizar la salida'
    }
  }
}

/**
 * Actualiza la hora de salida de un ticket peatonal.
 */
export async function actualizarHoraSalidaPeatonal(
  payload: ActualizarHoraSalidaPayload
): Promise<ActualizarHoraSalidaResponse> {
  try {
    const response = await fetch('/update/hora_salida_peatonal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    let data: ActualizarHoraSalidaResponse = { success: false }

    try {
      data = await response.json()
    } catch {
      // Si no retorna JSON, se conserva valor por defecto.
    }

    if (!response.ok) {
      return {
        ...data,
        success: false,
        mensaje: data.mensaje || `Error del servidor: ${response.status}`
      }
    }

    return {
      ...data,
      success: data.success === true
    }
  } catch (error) {
    console.error('Error al actualizar hora de salida peatonal:', error)
    return {
      success: false,
      mensaje: 'No se pudo conectar con el servidor para actualizar la salida peatonal'
    }
  }
}

/**
 * Obtiene las fotos asociadas a un ticket vehicular.
 */
export async function obtenerFotosTicket(ticket: string | number): Promise<ObtenerFotosTicketResponse> {
  try {
    const response = await fetch(`/get/fotos_ticket/${encodeURIComponent(String(ticket))}`)

    let data: Partial<ObtenerFotosTicketResponse> = {}

    try {
      data = await response.json()
    } catch {
      // Si no retorna JSON valido, devolvemos una respuesta controlada.
    }

    if (!response.ok) {
      return {
        success: false,
        ticket: data.ticket,
        ruta_ticket: data.ruta_ticket,
        total_fotos: data.total_fotos,
        faltantes: Array.isArray(data.faltantes) ? data.faltantes : [],
        fotos: data.fotos,
        mensaje: data.mensaje || `Error del servidor: ${response.status}`
      }
    }

    return {
      success: data.success === true,
      ticket: data.ticket,
      ruta_ticket: data.ruta_ticket,
      total_fotos: data.total_fotos,
      faltantes: Array.isArray(data.faltantes) ? data.faltantes : [],
      fotos: data.fotos,
      mensaje: data.mensaje
    }
  } catch (error) {
    console.error('Error al obtener fotos del ticket:', error)
    return {
      success: false,
      faltantes: [],
      fotos: {},
      mensaje: 'No se pudo conectar con el servidor para consultar las fotos del ticket'
    }
  }
}

/**
 * Obtiene las fotos asociadas a un ticket peatonal.
 */
export async function obtenerFotosTicketPeatonal(ticket: string | number): Promise<ObtenerFotosTicketResponse> {
  try {
    const response = await fetch(`/get/fotos_ticket_peatonal/${encodeURIComponent(String(ticket))}`)

    let data: Partial<ObtenerFotosTicketResponse> = {}

    try {
      data = await response.json()
    } catch {
      // Si no retorna JSON valido, devolvemos una respuesta controlada.
    }

    if (!response.ok) {
      return {
        success: false,
        ticket: data.ticket,
        ruta_ticket: data.ruta_ticket,
        total_fotos: data.total_fotos,
        faltantes: Array.isArray(data.faltantes) ? data.faltantes : [],
        fotos: data.fotos,
        mensaje: data.mensaje || `Error del servidor: ${response.status}`
      }
    }

    return {
      success: data.success === true,
      ticket: data.ticket,
      ruta_ticket: data.ruta_ticket,
      total_fotos: data.total_fotos,
      faltantes: Array.isArray(data.faltantes) ? data.faltantes : [],
      fotos: data.fotos,
      mensaje: data.mensaje
    }
  } catch (error) {
    console.error('Error al obtener fotos del ticket peatonal:', error)
    return {
      success: false,
      faltantes: [],
      fotos: {},
      mensaje: 'No se pudo conectar con el servidor para consultar las fotos del ticket peatonal'
    }
  }
}

/**
 * Captura imagen de placa vehicular
 * @returns Foto de placa en base64
 */
export async function capturarImagenesVehicular(): Promise<{
  fotoPlaca: string
  exito: boolean
}> {
  try {
    console.log('Iniciando captura de placa vehicular...')
    const response = await fetch('/capture/camara_placa_entrada_vehicular', {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta del endpoint:', data)

    // El endpoint devuelve {success: boolean, image_base64: string, ...}
    let imagen = ''
    let exito = false
    
    if (data && typeof data === 'object') {
      exito = data.success === true
      imagen = data.image_base64 || ''
    }

    return {
      fotoPlaca: imagen,
      exito: exito && !!imagen
    }
  } catch (error) {
    console.error('Error al capturar placa vehicular:', error)
    return {
      fotoPlaca: '',
      exito: false
    }
  }
}

/**
 * Captura imagen del rostro del conductor
 * @returns Foto del conductor en base64
 */
export async function capturarRostroConductor(): Promise<{
  fotoDriver: string
  exito: boolean
}> {
  try {
    console.log('Iniciando captura de rostro del conductor...')
    const response = await fetch('/capture/camara_usuario_entrada_vehicular', {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta del endpoint rostro:', data)

    // El endpoint devuelve {success: boolean, image_base64: string, ...}
    let imagen = ''
    let exito = false
    
    if (data && typeof data === 'object') {
      exito = data.success === true
      imagen = data.image_base64 || ''
    }

    return {
      fotoDriver: imagen,
      exito: exito && !!imagen
    }
  } catch (error) {
    console.error('Error al capturar rostro del conductor:', error)
    return {
      fotoDriver: '',
      exito: false
    }
  }
}

/**
 * Captura imagen de la cédula del conductor
 * @returns Foto de la cédula en base64 + datos OCR extraídos
 */
export async function capturarCedulaConductor(): Promise<{
  fotoCedula: string
  nui: string
  nombres: string
  apellidos: string
  exito: boolean
}> {
  try {
    console.log('Iniciando captura de cédula del conductor...')
    const response = await fetch('/capture/camara_cedula_entrada_vehicular', {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta del endpoint cédula:', data)

    let imagen = ''
    let exito = false
    let nui = ''
    let nombres = ''
    let apellidos = ''
    
    if (data && typeof data === 'object') {
      exito = data.success === true
      imagen = data.image_base64 || ''

      // El endpoint ya retorna OCR embebido en ocr_data
      const ocrData = data.ocr_data && typeof data.ocr_data === 'object' ? data.ocr_data : null
      if (ocrData) {
        nui = ocrData.cedula || ocrData.nui || ''
        nombres = ocrData.nombres || ''
        apellidos = ocrData.apellidos || ''
        console.log('Datos OCR extraídos:', { nui, nombres, apellidos })
      }
    }

    return {
      fotoCedula: imagen,
      nui: nui,
      nombres: nombres,
      apellidos: apellidos,
      exito: exito && !!imagen
    }
  } catch (error) {
    console.error('Error al capturar cédula del conductor:', error)
    return {
      fotoCedula: '',
      nui: '',
      nombres: '',
      apellidos: '',
      exito: false
    }
  }
}

/**
 * Ejecuta la extraccion OCR de la cedula vehicular sobre la ultima captura disponible.
 */
export async function extraerCedulaVehicular(imageData: string): Promise<ExtraerCedulaVehicularResponse> {
  try {
    console.log('Iniciando extraccion OCR de cedula vehicular...')
    const response = await fetch('/extract/camara_cedula_entrada_vehicular', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imagen_cedula_base64: obtenerBase64Plano(imageData)
      })
    })

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta OCR cedula vehicular:', data)

    const ocrData = data?.ocr_data && typeof data.ocr_data === 'object' ? data.ocr_data : null

    return {
      exito: data?.success === true,
      nui: ocrData?.cedula || ocrData?.nui || '',
      nombres: ocrData?.nombres || '',
      apellidos: ocrData?.apellidos || ''
    }
  } catch (error) {
    console.error('Error al extraer OCR de cedula vehicular:', error)
    return {
      exito: false,
      nui: '',
      nombres: '',
      apellidos: ''
    }
  }
}

/**
 * Captura imagen de cámara para registro peatonal
 * @returns Array con [fotoID, fotoFace] en base64
 */
export async function capturarImagenesPeatonal(): Promise<{
  fotoID: string
  fotoFace: string
  exito: boolean
}> {
  try {
    console.log('Iniciando captura peatonal...')
    const response = await fetch('http://localhost:8001/endpoint/capture/camara-entrada-peatonal', {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    console.log('Imágenes capturadas:', data)

    return {
      fotoID: data.fotoID || data.foto_id || data.fotoCedula || '',
      fotoFace: data.fotoFace || data.foto_face || data.fotoRostro || '',
      exito: !!data.fotoID || !!data.fotoFace
    }
  } catch (error) {
    console.error('Error al capturar imágenes peatonal:', error)
    return {
      fotoID: '',
      fotoFace: '',
      exito: false
    }
  }
}

/**
 * Captura imagen de la cédula para registro peatonal (con OCR)
 * @returns Foto de la cédula en base64 + datos OCR (nui, nombres, apellidos)
 */
export async function capturarCedulaPeatonal(): Promise<{
  fotoID: string
  nui: string
  nombres: string
  apellidos: string
  exito: boolean
}> {
  try {
    console.log('Iniciando captura de cédula peatonal...')
    const response = await fetch('/capture/camara_cedula_entrada_peatonal', {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta cédula peatonal:', {
      success: data?.success,
      camera: data?.camera,
      size_bytes: data?.size_bytes,
      has_image: !!data?.image_base64
    })

    let imagen = ''
    let exito = false
    let nui = ''
    let nombres = ''
    let apellidos = ''
    
    if (data && typeof data === 'object') {
      exito = data.success === true
      imagen = data.image_base64 || ''
      
      if (data.ocr_data) {
        nui = data.ocr_data.cedula || data.ocr_data.nui || ''
        nombres = data.ocr_data.nombres || ''
        apellidos = data.ocr_data.apellidos || ''
      }
    }

    return {
      fotoID: imagen,
      nui: nui,
      nombres: nombres,
      apellidos: apellidos,
      exito: exito && !!imagen
    }
  } catch (error) {
    console.error('Error al capturar cédula peatonal:', error)
    return {
      fotoID: '',
      nui: '',
      nombres: '',
      apellidos: '',
      exito: false
    }
  }
}

/**
 * Captura imagen del rostro para registro peatonal
 * @returns Foto del rostro en base64
 */
export async function capturarRostroPeatonal(): Promise<{
  fotoFace: string
  exito: boolean
}> {
  try {
    console.log('Iniciando captura de rostro peatonal...')
    const response = await fetch('/capture/camara_usuario_entrada_peatonal', {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta rostro peatonal:', {
      success: data?.success,
      camera: data?.camera,
      size_bytes: data?.size_bytes,
      has_image: !!data?.image_base64
    })

    let imagen = ''
    let exito = false
    
    if (data && typeof data === 'object') {
      exito = data.success === true
      imagen = data.image_base64 || ''
    }

    return {
      fotoFace: imagen,
      exito: exito && !!imagen
    }
  } catch (error) {
    console.error('Error al capturar rostro peatonal:', error)
    return {
      fotoFace: '',
      exito: false
    }
  }
}
