import PathoraShell from '@/components/pathora/PathoraShell'

export const dynamic = 'force-static'
export const dynamicParams = true

export function generateStaticParams() {
  return []
}

export default function ScholarshipPage() {
  return <PathoraShell />
}
