// Server-only.
import type { Payload } from 'payload'

type Seed = { query: string; country: string; type: 'scholarship' | 'university' | 'program'; priority: number }

const gov: Seed[] = [
  { query: 'Chevening Scholarships for Thai students (UK government fully funded master\'s)', country: 'United Kingdom', type: 'scholarship', priority: 10 },
  { query: 'Australia Awards Scholarships for Thailand', country: 'Australia', type: 'scholarship', priority: 10 },
  { query: 'MEXT Japanese Government Scholarship for Thai applicants', country: 'Japan', type: 'scholarship', priority: 10 },
  { query: 'DAAD scholarships for Thai students to study in Germany', country: 'Germany', type: 'scholarship', priority: 9 },
  { query: 'Fulbright Thailand scholarships for study in the United States', country: 'United States', type: 'scholarship', priority: 9 },
  { query: 'Global Korea Scholarship GKS / KGSP for Thai students', country: 'South Korea', type: 'scholarship', priority: 9 },
  { query: 'Erasmus Mundus Joint Masters scholarships open to Thai students', country: 'Europe', type: 'scholarship', priority: 8 },
  { query: 'Thai government OCSC scholarships (Office of the Civil Service Commission) for study abroad', country: 'Thailand', type: 'scholarship', priority: 8 },
]


const general: Seed[] = [
  { query: 'Fully funded master\'s scholarships in the United Kingdom open to Thai students', country: 'United Kingdom', type: 'scholarship', priority: 5 },
  { query: 'Undergraduate scholarships in the United States for international students from Thailand', country: 'United States', type: 'scholarship', priority: 5 },
  { query: 'Fully funded master\'s scholarships in Canada open to Thai students', country: 'Canada', type: 'scholarship', priority: 4 },
  { query: 'Scholarships for Thai students at Dutch universities (Netherlands)', country: 'Netherlands', type: 'scholarship', priority: 4 },
  { query: 'New Zealand scholarships for Thai students (NZ government and universities)', country: 'New Zealand', type: 'scholarship', priority: 4 },
  { query: 'Singapore scholarships for ASEAN and Thai students (undergraduate and graduate)', country: 'Singapore', type: 'scholarship', priority: 4 },
  { query: 'Top universities in Australia accepting Thai students with scholarships', country: 'Australia', type: 'university', priority: 3 },
  { query: 'Top universities in Japan accepting Thai students with English-taught programs and scholarships', country: 'Japan', type: 'university', priority: 3 },
  { query: 'Popular master\'s programs in data science for international students in Germany and the Netherlands', country: 'Europe', type: 'program', priority: 2 },
  { query: 'Popular master\'s programs in business and management for Thai students in the United Kingdom', country: 'United Kingdom', type: 'program', priority: 2 },
  { query: 'Popular engineering master\'s programs in Canada and the United States accepting Thai students', country: 'North America', type: 'program', priority: 2 },
  { query: 'Popular master\'s programs in data science and engineering in Singapore and South Korea', country: 'Asia', type: 'program', priority: 2 },
]

/** Creates ~20 default topics when none exist. Returns number created. */
export async function seedDefaultTopics(payload: Payload): Promise<number> {
  const existing = await payload.count({ collection: 'research-topics', overrideAccess: true })
  if (existing.totalDocs > 0) return 0
  const seeds = [...gov, ...general]
  for (const s of seeds) {
    await payload.create({ collection: 'research-topics', data: { ...s, active: true }, overrideAccess: true })
  }
  return seeds.length
}
