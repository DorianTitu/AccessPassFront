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
      
      // Si la captura fue exitosa, procesar la imagen con OCR
      if (exito && imagen) {
        // Asegurar que el formato sea correcto (Data URI)
        const imagenDataURI = imagen.startsWith('data:') 
          ? imagen 
          : `data:image/jpeg;base64,${imagen}`
        
        console.log('Procesando imagen de cédula con OCR...')
        const ocrResult = await extraerCamposCedula(imagenDataURI)
        
        if (ocrResult.exito) {
          nui = ocrResult.nui
          nombres = ocrResult.nombres
          apellidos = ocrResult.apellidos
          console.log('Datos OCR extraídos:', { nui, nombres, apellidos })
        } else {
          console.warn('OCR no pudo extraer datos, pero la imagen se capturó')
        }
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
    const response = await fetch('/capture/camara_cedula_entrada_vehicular', {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta del endpoint cédula peatonal:', data)

    let imagen = ''
    let exito = false
    let nui = ''
    let nombres = ''
    let apellidos = ''
    
    if (data && typeof data === 'object') {
      exito = data.success === true
      imagen = data.image_base64 || ''
      
      if (data.ocr_data) {
        nui = data.ocr_data.nui || ''
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
    const response = await fetch('/capture/camara_usuario_entrada_vehicular', {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta del endpoint rostro peatonal:', data)

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
