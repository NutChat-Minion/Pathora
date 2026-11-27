import PathoraShell from '@/components/pathora/PathoraShell'

const staticPaths = [
  'explore',
  'pricing',
  'login',
  'about',
  'support',
  'partners',
  'app',
  'app/explore',
  'app/pricing',
  'saved',
  'applications',
  'prepare',
  'profile',
  'settings',
  'community',
  'study-buddy',
  'accommodation',
  'visa',
  'travel-together',
  'pre-departure',
]

export const dynamicParams = false

export function generateStaticParams() {
  return staticPaths.map((path) => ({ path: path.split('/') }))
}

export default function PathoraPage() {
  return <PathoraShell />
}
