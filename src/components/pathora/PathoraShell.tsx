'use client'

import dynamic from 'next/dynamic'

const PathoraApp = dynamic(() => import('./App'), { ssr: false })

export default function PathoraShell() {
  return <PathoraApp />
}
