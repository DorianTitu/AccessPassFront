/**
 * Constantes de configuración API
 */
export const API_BASE_URL = 'http://localhost:8000/api'

export const ENDPOINTS = {
  // Health
  HEALTH: '/health',
  
  // OCR y Extracción
  EXTRAER_CAMPOS: '/extraer-campos',
  PLACA_EXTRAER: '/placa/extraer',
  EXTRAER_CEDULA_VEHICULAR: '/extract/camara_cedula_entrada_vehicular',
  EXTRAER_CEDULA_PEATONAL: '/extract/camara_cedula_entrada_peatonal',
  
  // Captura
  CAPTURA_PLACA: '/capture/camara_placa_entrada_vehicular',
  CAPTURA_ROSTRO_CONDUCTOR: '/capture/camara_usuario_entrada_vehicular',
  CAPTURA_CEDULA_CONDUCTOR: '/capture/camara_cedula_entrada_vehicular',
  CAPTURA_CEDULA_PEATONAL: '/capture/camara_cedula_entrada_peatonal',
  CAPTURA_ROSTRO_PEATONAL: '/capture/camara_usuario_entrada_peatonal',
  CAPTURA_PEATONAL: 'http://localhost:8001/endpoint/capture/camara-entrada-peatonal',
  
  // Obtener imagen de usuario peatonal (nuevo endpoint)
  OBTENER_IMAGEN_PEATONAL_USUARIO: '/camaras/peatonal-usuario/imagen',
  
  // Obtener imagen de cédula peatonal (nuevo endpoint)
  OBTENER_IMAGEN_PEATONAL_CEDULA: '/camaras/peatonal-cedula/imagen',
  
  // OCR Cédula Nueva
  OCR_CEDULA_NUMERO: '/ocr/cedula-nueva/numero',
  OCR_CEDULA_NOMBRES_APELLIDOS: '/ocr/cedula-nueva/nombres-apellidos',
  
  // OCR Cédula Antigua
  OCR_CEDULA_ANTIGUA_NUMERO: '/ocr/cedula-antigua/numero',
  OCR_CEDULA_ANTIGUA_NOMBRES_APELLIDOS: '/ocr/cedula-antigua/nombres-apellidos',
  
  // Registros
  GUARDAR_REGISTRO_VEHICULAR: '/save/registro_vehicular',
  GUARDAR_REGISTRO_PEATONAL: '/save/registro_peatonal',
  OBTENER_REGISTROS_VEHICULARES: '/get/registro_vehicular',
  OBTENER_REGISTROS_PEATONALES: '/get/registro_peatonal',
  OBTENER_INGRESOS_PEATONAL_DIA: '/ingresos-peatonal/listar/dia',
  OBTENER_DETALLE_INGRESO_PEATONAL: '/ingresos-peatonal',
  
  // Horas de Salida
  ACTUALIZAR_HORA_SALIDA: '/update/hora_salida',
  ACTUALIZAR_HORA_SALIDA_PEATONAL: '/update/hora_salida_peatonal',
  
  // Fotos
  OBTENER_FOTOS_TICKET: '/get/fotos_ticket',
  OBTENER_FOTOS_TICKET_PEATONAL: '/get/fotos_ticket_peatonal',
  
  // Información de Tickets
  OBTENER_INFO_TICKET_VEHICULAR: '/get/ticket_info',
  OBTENER_INFO_TICKET_PEATONAL: '/get/ticket_info_peatonal',
  
  // Edición
  EDITAR_REGISTRO_VEHICULAR: '/edit/registro_vehicular',
  EDITAR_REGISTRO_PEATONAL: '/edit/registro_peatonal'
} as const

export const CAPTURE_PARAMS = {
  INCLUDE_DATA_URL: 'include_data_url=false',
  INCLUDE_IMAGE: 'include_image=true',
  RESPONSE_MODE: 'response_mode=json'
} as const
