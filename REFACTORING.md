# Refactorización de Servicios API

## Estructura Anterior
El archivo `api.ts` original tenía **1215 líneas** con toda la lógica mezclada:
- Interfaces y tipos
- Cliente HTTP
- Funciones de captura
- Funciones de registros
- Funciones de tickets

## Nueva Estructura
La lógica ha sido separada en módulos pequeños y mantenibles:

```
src/services/
├── api.ts                      # Re-exportación (compatibilidad)
├── types.ts                    # Todas las interfaces y tipos
├── constants.ts                # URLs, endpoints y configuración
├── httpClient.ts               # Cliente HTTP centralizado
│
├── tickets/
│   ├── ticket.service.ts       # Operaciones: obtener, editar, info
│   └── (ticket.types.ts reserved)
│
├── records/
│   ├── record.service.ts       # Operaciones: guardar, actualizar horas
│   └── (record.types.ts reserved)
│
├── captures/
│   ├── capture.service.ts      # Operaciones: capturar, extraer OCR
│   └── (capture.types.ts reserved)
│
└── configuracion.ts            # EXISTENTE - Configuración de departamentos
```

## Beneficios de la Refactorización

### 1. **Separación de Responsabilidades**
- Cada módulo tiene una única responsabilidad
- Cliente HTTP centralizado → fácil mantenimiento
- Tipos separados → mejor reutilización

### 2. **Mejor Mantenibilidad**
- Archivos más pequeños y legibles
- Fácil localizar cambios
- Cambios aislados por dominio

### 3. **Escalabilidad**
- Agregar nueva funcionalidad es más simple
- Estructura preparada para testing
- Fácil de documentar

### 4. **Reutilización**
- `httpClient` puedeusarse en otros servicios
- Tipos centralizados en `types.ts`
- Constantes centralizadas en `constants.ts`

## Compatibilidad

✅ **Sin cambios en la interfaz pública**
- `api.ts` re-exporta todo como antes
- Los componentes no necesitan cambios en imports

## Archivos Creados

### `constants.ts` (40 líneas)
```typescript
// URLs, endpoints y parámetros centralizados
export const API_BASE_URL = '...'
export const ENDPOINTS = { ... }
export const CAPTURE_PARAMS = { ... }
```

### `httpClient.ts` (90 líneas)
```typescript
// Funciones HTTP reutilizables
export async function httpGet<T>(url: string): Promise<HttpResponse<T>>
export async function httpPost<T>(url: string, body): Promise<HttpResponse<T>>
export async function httpPut<T>(url: string, body): Promise<HttpResponse<T>>
```

### `types.ts` (150 líneas)
```typescript
// Todas las interfaces y tipos
export interface TicketVehicular { ... }
export interface TicketPeatonal { ... }
export interface InformacionTicket { ... }
// ... y más
```

### `tickets/ticket.service.ts` (180 líneas)
```typescript
// Operaciones con tickets
export async function obtenerTicketInfoVehicular(code)
export async function editarRegistroVehicular(payload)
export async function obtenerRegistrosVehiculares()
// ... y más
```

### `records/record.service.ts` (70 líneas)
```typescript
// Operaciones de registros
export async function guardarRegistroVehicular(payload)
export async function actualizarHoraSalida(payload)
// ... y más
```

### `captures/capture.service.ts` (350 líneas)
```typescript
// Captura y OCR
export async function capturarImagenesVehicular()
export async function extraerCamposCedula(imageData)
// ... y más
```

### `api.ts` (55 líneas)
```typescript
// Re-exportación centralizadapara compatibilidad
export type { TicketVehicular, ... }
export { obtenerTicketInfoVehicular, ... }
```

## Próximos Pasos (Opcional)

1. **Testing**: Crear tests unitarios por servicio
2. **Hooks**: Crear custom React hooks (`useTickets`, `useCapture`, etc)
3. **Error Handling**: Sistema centralizado de errores
4. **Logging**: Sistema de logging centralizado
5. **Caching**: Implementar cache en el cliente HTTP

## Resumen de Cambios

| Métrica | Antes | Después |
|---------|-------|---------|
| Líneas en api.ts | 1215 | 55 |
| Archivos de servicio | 1 | 4 |
| Módulos | 1 | 6 (tipos, http, 3 servicios) |
| Responsabilidades | 20+ | 1-3 por archivo |

✅ **Refactorización completada exitosamente**
