/**
 * Archivo de compatibilidad - re-exporta todas las funciones y tipos
 * para mantener la interfaz pública igual
 * 
 * La lógica ha sido refactorizada en módulos separados:
 * - types.ts: Interfaces y tipos compartidos
 * - httpClient.ts: Cliente HTTP centralizado
 * - constants.ts: Constantes compartidas
 * - tickets/ticket.service.ts: Operaciones con tickets
 * - records/record.service.ts: Operaciones de registros
 * - captures/capture.service.ts: Captura de imágenes y OCR
 */

// Tipos
export type {
  ExtraerCamposResponse,
  ExtraerPlacaResponse,
  ExtraerCedulaVehicularResponse,
  ExtraerCedulaPeatonalResponse,
  ImagenPeatonalUsuarioResponse,
  ImagenPeatonalCedulaResponse,
  TicketVehicular,
  TicketPeatonal,
  TicketPeatonalRaw,
  TicketPeatonalDiaRaw,
  ObtenerIngresosPeatonalDiaResponse,
  DetalleTicketPeatonalDatos,
  ObtenerDetalleTicketPeatonalResponse,
  ActualizarDetalleTicketPeatonalPayload,
  InformacionTicket,
  FotoTicket,
  GuardarRegistroVehicularPayload,
  GuardarRegistroPeatonalPayload,
  ActualizarHoraSalidaPayload,
  EditarRegistroVehicularPayload,
  EditarRegistroPeatonalPayload,
  BaseResponse,
  ObtenerRegistrosResponse,
  ObtenerFotosResponse,
  ObtenerTicketInfoResponse,
  EditarRegistroResponse
} from './types'

// Servicios de Tickets
export { 
  obtenerTicketInfoVehicular,
  obtenerTicketInfoPeatonal,
  editarRegistroVehicular,
  editarRegistroPeatonal,
  obtenerFotosTicket,
  obtenerFotosTicketPeatonal,
  obtenerRegistrosVehiculares,
  obtenerRegistrosPeatonales,
  obtenerRegistrosPeatonalesPorDia,
  obtenerDetalleTicketPeatonal,
  actualizarDetalleTicketPeatonal
} from './tickets/ticket.service'

// Servicios de Registros
export {
  guardarRegistroVehicular,
  guardarRegistroPeatonal,
  actualizarHoraSalida,
  actualizarHoraSalidaPeatonal
} from './records/record.service'

// Servicios de Captura
export {
  extraerCamposCedula,
  extraerPlaca,
  capturarImagenesVehicular,
  capturarRostroConductor,
  capturarCedulaConductor,
  extraerCedulaVehicular,
  extraerCedulaPeatonal,
  capturarImagenesPeatonal,
  capturarCedulaPeatonal,
  capturarRostroPeatonal,
  obtenerImagenUsuarioPeatonal,
  obtenerImagenCedulaPeatonal,
  extraerNumeroCedula,
  extraerNombresApellidosCedula,
  extraerNumeroCedulaAntiga,
  extraerNombresApellidosCedulaAntiga,
  verificarHealth
} from './captures/capture.service'
