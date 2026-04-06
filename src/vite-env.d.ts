/// <reference types="vite/client" />

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.svg' {
  import type React from 'react'
  const SVGComponent: React.VFC<React.SVGProps<SVGSVGElement> & { title?: string }>
  export default SVGComponent
}
