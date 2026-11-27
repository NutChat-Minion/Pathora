// Usage: pnpm payload run scripts/seed-listings.ts
// Adds well-known scholarships open to Thai students, each linked to its official page.
// Deadlines and score minimums change every round, so they are left empty unless stable;
// students are pointed to the official source instead. Safe to re-run (upserts by slug).
import { getPayload } from 'payload'
import config from '../src/payload.config'

type Seed = {
  slug: string
  title: [string, string]
  institution: string
  country: string
  summary: [string, string]
  fundingType: 'full' | 'partial' | 'waiver' | 'none'
  fundingSummary: [string, string]
  deadlineNote: [string, string]
  notes: [string, string]
  degreeLevels: ('bachelor' | 'master' | 'phd')[]
  studyFields: string[]
  sourceUrl: string
}

const seeds: Seed[] = [
  {
    slug: 'chevening-scholarships',
    title: ['Chevening Scholarships', 'ทุนชีฟนิง (Chevening)'],
    institution: 'UK Foreign, Commonwealth & Development Office',
    country: 'United Kingdom',
    summary: [
      'The UK government’s global scholarship for future leaders: a one-year master’s degree at any eligible UK university.',
      'ทุนรัฐบาลสหราชอาณาจักรสำหรับผู้นำในอนาคต เรียนปริญญาโท 1 ปี ที่มหาวิทยาลัยในสหราชอาณาจักรที่เข้าร่วมโครงการ',
    ],
    fundingType: 'full',
    fundingSummary: ['Tuition, living allowance, flights and visa', 'ค่าเล่าเรียน ค่าครองชีพ ตั๋วเครื่องบิน และค่าวีซ่า'],
    deadlineNote: [
      'Applications usually open in August and close in early November — check the official site',
      'ปกติเปิดรับสมัครช่วงสิงหาคมและปิดต้นพฤศจิกายน ตรวจสอบวันที่แน่นอนจากเว็บไซต์ทางการ',
    ],
    notes: [
      'Requires an undergraduate degree, at least two years of work experience, and a return to Thailand for two years after the award.',
      'ต้องจบปริญญาตรี มีประสบการณ์ทำงานอย่างน้อย 2 ปี และกลับมาประเทศไทยอย่างน้อย 2 ปีหลังรับทุน',
    ],
    degreeLevels: ['master'],
    studyFields: [],
    sourceUrl: 'https://www.chevening.org/scholarships/',
  },
  {
    slug: 'mext-japanese-government-scholarship',
    title: ['MEXT Japanese Government Scholarship', 'ทุนรัฐบาลญี่ปุ่น (MEXT)'],
    institution: 'Ministry of Education, Culture, Sports, Science and Technology (Japan)',
    country: 'Japan',
    summary: [
      'Japanese government scholarships for undergraduate, research and graduate study in Japan. Thai applicants usually apply through the Embassy of Japan in Thailand.',
      'ทุนรัฐบาลญี่ปุ่นสำหรับปริญญาตรี นักศึกษาวิจัย และบัณฑิตศึกษา ผู้สมัครชาวไทยมักสมัครผ่านสถานเอกอัครราชทูตญี่ปุ่นประจำประเทศไทย',
    ],
    fundingType: 'full',
    fundingSummary: ['Tuition, monthly allowance and round-trip airfare', 'ค่าเล่าเรียน เงินรายเดือน และตั๋วเครื่องบินไป-กลับ'],
    deadlineNote: [
      'Embassy selection rounds open once a year — check the official site',
      'รอบคัดเลือกผ่านสถานทูตเปิดปีละครั้ง ตรวจสอบกำหนดการจากเว็บไซต์ทางการ',
    ],
    notes: [
      'Eligibility, age limits and exams differ by category (undergraduate, research student, etc.).',
      'คุณสมบัติ อายุ และการสอบแตกต่างกันตามประเภททุน (ปริญญาตรี นักศึกษาวิจัย ฯลฯ)',
    ],
    degreeLevels: ['bachelor', 'master', 'phd'],
    studyFields: [],
    sourceUrl: 'https://www.studyinjapan.go.jp/en/smap-stopj-applications-scholarship.html',
  },
  {
    slug: 'daad-scholarships-germany',
    title: ['DAAD Scholarships', 'ทุน DAAD (เยอรมนี)'],
    institution: 'German Academic Exchange Service (DAAD)',
    country: 'Germany',
    summary: [
      'Germany’s largest scholarship organisation offers many programmes for international master’s, PhD and research stays. Use the DAAD database to find programmes open to Thai applicants.',
      'องค์กรทุนการศึกษาที่ใหญ่ที่สุดของเยอรมนี มีหลายโครงการสำหรับปริญญาโท ปริญญาเอก และการวิจัย ค้นหาโครงการที่เปิดรับผู้สมัครชาวไทยได้จากฐานข้อมูล DAAD',
    ],
    fundingType: 'full',
    fundingSummary: ['Monthly stipend; coverage depends on the programme', 'เงินรายเดือน ความคุ้มครองขึ้นกับแต่ละโครงการ'],
    deadlineNote: ['Deadlines vary by programme — check the official database', 'กำหนดปิดรับสมัครต่างกันตามโครงการ ตรวจสอบจากฐานข้อมูลทางการ'],
    notes: [
      'Requirements (degree, work experience, language) depend on the specific programme.',
      'คุณสมบัติ (วุฒิการศึกษา ประสบการณ์ทำงาน ภาษา) ขึ้นกับแต่ละโครงการ',
    ],
    degreeLevels: ['master', 'phd'],
    studyFields: [],
    sourceUrl: 'https://www.daad.de/en/studying-in-germany/scholarships/',
  },
  {
    slug: 'fulbright-thai-graduate-scholarship',
    title: ['Fulbright Thai Graduate Scholarship', 'ทุนฟุลไบรท์สำหรับบัณฑิตศึกษา'],
    institution: 'Thailand–United States Educational Foundation (TUSEF/Fulbright)',
    country: 'United States',
    summary: [
      'Fulbright scholarships for Thai citizens to pursue graduate study in the United States, administered in Thailand by TUSEF.',
      'ทุนฟุลไบรท์สำหรับคนไทยเพื่อศึกษาต่อระดับบัณฑิตศึกษาในสหรัฐอเมริกา ดำเนินการในประเทศไทยโดยมูลนิธิการศึกษาไทย-อเมริกัน (TUSEF)',
    ],
    fundingType: 'full',
    fundingSummary: ['Coverage depends on the award', 'ความคุ้มครองขึ้นกับประเภททุน'],
    deadlineNote: ['Annual competition — check the official site for the current round', 'เปิดรับสมัครปีละครั้ง ตรวจสอบรอบปัจจุบันจากเว็บไซต์ทางการ'],
    notes: [
      'Open to Thai citizens; English test and other requirements are listed per award.',
      'สำหรับผู้มีสัญชาติไทย ข้อกำหนดด้านภาษาอังกฤษและอื่น ๆ ระบุในแต่ละทุน',
    ],
    degreeLevels: ['master', 'phd'],
    studyFields: [],
    sourceUrl: 'https://www.tusef.or.th/',
  },
  {
    slug: 'global-korea-scholarship',
    title: ['Global Korea Scholarship (GKS)', 'ทุนรัฐบาลเกาหลี (GKS)'],
    institution: 'National Institute for International Education (Korea)',
    country: 'South Korea',
    summary: [
      'Korean government scholarship for international students for undergraduate and graduate degrees, usually including a year of Korean language study.',
      'ทุนรัฐบาลเกาหลีสำหรับนักศึกษาต่างชาติระดับปริญญาตรีและบัณฑิตศึกษา โดยทั่วไปรวมการเรียนภาษาเกาหลี 1 ปี',
    ],
    fundingType: 'full',
    fundingSummary: ['Tuition, monthly allowance, airfare and language training', 'ค่าเล่าเรียน เงินรายเดือน ตั๋วเครื่องบิน และการเรียนภาษา'],
    deadlineNote: [
      'Undergraduate and graduate tracks open at different times each year — check the official site',
      'ทุนปริญญาตรีและบัณฑิตศึกษาเปิดรับสมัครคนละช่วง ตรวจสอบจากเว็บไซต์ทางการ',
    ],
    notes: [
      'Apply via the Korean embassy or a Korean university, depending on the track.',
      'สมัครผ่านสถานทูตเกาหลีหรือมหาวิทยาลัยในเกาหลี ขึ้นกับประเภทการสมัคร',
    ],
    degreeLevels: ['bachelor', 'master', 'phd'],
    studyFields: [],
    sourceUrl: 'https://www.studyinkorea.go.kr/',
  },
  {
    slug: 'erasmus-mundus-joint-masters',
    title: ['Erasmus Mundus Joint Masters', 'ทุน Erasmus Mundus (ปริญญาโทร่วม)'],
    institution: 'European Commission',
    country: 'Europe (multiple countries)',
    summary: [
      'EU-funded joint master’s programmes taught across two or more European universities, with full scholarships for top applicants worldwide.',
      'หลักสูตรปริญญาโทร่วมที่สหภาพยุโรปสนับสนุน เรียนในมหาวิทยาลัยยุโรปตั้งแต่ 2 แห่งขึ้นไป พร้อมทุนเต็มจำนวนสำหรับผู้สมัครที่โดดเด่นจากทั่วโลก',
    ],
    fundingType: 'full',
    fundingSummary: ['Participation costs, travel and monthly allowance', 'ค่าใช้จ่ายหลักสูตร ค่าเดินทาง และเงินรายเดือน'],
    deadlineNote: [
      'Each programme sets its own deadline, often between October and January',
      'แต่ละหลักสูตรกำหนดวันปิดรับเอง มักอยู่ระหว่างตุลาคมถึงมกราคม',
    ],
    notes: ['Apply directly to each joint programme.', 'สมัครโดยตรงกับแต่ละหลักสูตร'],
    degreeLevels: ['master'],
    studyFields: [],
    sourceUrl:
      'https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters',
  },
  {
    slug: 'eiffel-excellence-scholarship',
    title: ['Eiffel Excellence Scholarship', 'ทุน Eiffel Excellence (ฝรั่งเศส)'],
    institution: 'French Ministry for Europe and Foreign Affairs (Campus France)',
    country: 'France',
    summary: [
      'French government scholarship for international master’s and PhD students. Candidates are nominated by French higher-education institutions.',
      'ทุนรัฐบาลฝรั่งเศสสำหรับนักศึกษาต่างชาติระดับปริญญาโทและเอก ผู้สมัครได้รับการเสนอชื่อโดยสถาบันอุดมศึกษาในฝรั่งเศส',
    ],
    fundingType: 'partial',
    fundingSummary: ['Monthly allowance plus travel and insurance', 'เงินรายเดือน ค่าเดินทาง และประกันสุขภาพ'],
    deadlineNote: [
      'Universities submit nominations around January — check the official site',
      'มหาวิทยาลัยส่งรายชื่อเสนอชื่อประมาณเดือนมกราคม ตรวจสอบจากเว็บไซต์ทางการ',
    ],
    notes: [
      'Apply to a French programme first; the institution nominates you for the award.',
      'ต้องสมัครหลักสูตรในฝรั่งเศสก่อน แล้วสถาบันจะเสนอชื่อเพื่อรับทุน',
    ],
    degreeLevels: ['master', 'phd'],
    studyFields: [],
    sourceUrl: 'https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence',
  },
  {
    slug: 'orange-tulip-scholarship-thailand',
    title: ['Orange Tulip Scholarship Thailand', 'ทุน Orange Tulip (เนเธอร์แลนด์)'],
    institution: 'Nuffic Neso & Dutch universities',
    country: 'Netherlands',
    summary: [
      'Scholarships offered by participating Dutch universities to students from selected countries, including Thailand, for bachelor’s and master’s programmes.',
      'ทุนจากมหาวิทยาลัยในเนเธอร์แลนด์ที่เข้าร่วมโครงการ สำหรับนักศึกษาจากประเทศที่กำหนด รวมถึงประเทศไทย ระดับปริญญาตรีและโท',
    ],
    fundingType: 'partial',
    fundingSummary: ['Ranges from partial tuition to full cost, by university', 'ตั้งแต่ลดค่าเล่าเรียนบางส่วนถึงเต็มจำนวน ขึ้นกับมหาวิทยาลัย'],
    deadlineNote: ['Deadlines differ by university — check the official site', 'กำหนดปิดรับสมัครต่างกันตามมหาวิทยาลัย ตรวจสอบจากเว็บไซต์ทางการ'],
    notes: [
      'You usually need an admission offer from the participating programme first.',
      'โดยทั่วไปต้องได้รับการตอบรับเข้าหลักสูตรที่เข้าร่วมโครงการก่อน',
    ],
    degreeLevels: ['bachelor', 'master'],
    studyFields: [],
    sourceUrl: 'https://www.studyinholland.nl/finances/orange-tulip-scholarship',
  },
  {
    slug: 'nus-asean-undergraduate-scholarship',
    title: ['NUS ASEAN Undergraduate Scholarship', 'ทุนอาเซียนระดับปริญญาตรี NUS (สิงคโปร์)'],
    institution: 'National University of Singapore',
    country: 'Singapore',
    summary: [
      'Undergraduate scholarship at the National University of Singapore for academically strong students from ASEAN countries, including Thailand.',
      'ทุนปริญญาตรีที่มหาวิทยาลัยแห่งชาติสิงคโปร์ สำหรับนักเรียนผลการเรียนดีจากประเทศอาเซียน รวมถึงประเทศไทย',
    ],
    fundingType: 'full',
    fundingSummary: ['Tuition (after grant) plus an annual allowance', 'ค่าเล่าเรียน (หลังหักทุนรัฐบาล) และเงินช่วยเหลือรายปี'],
    deadlineNote: ['Considered with your NUS admission application — check the official site', 'พิจารณาพร้อมใบสมัครเข้า NUS ตรวจสอบจากเว็บไซต์ทางการ'],
    notes: ['No separate application in most cases; see the NUS scholarships page.', 'ส่วนใหญ่ไม่ต้องสมัครแยก ดูรายละเอียดที่หน้าทุนของ NUS'],
    degreeLevels: ['bachelor'],
    studyFields: [],
    sourceUrl: 'https://www.nus.edu.sg/oam/scholarships',
  },
  {
    slug: 'ocsc-royal-thai-government-scholarships',
    title: ['Royal Thai Government Scholarships (OCSC)', 'ทุนรัฐบาลไทย (สำนักงาน ก.พ.)'],
    institution: 'Office of the Civil Service Commission (OCSC)',
    country: 'Multiple countries',
    summary: [
      'Thai government scholarships for study abroad at bachelor’s to doctoral level, usually with a commitment to work in Thai government service afterwards.',
      'ทุนรัฐบาลไทยสำหรับศึกษาต่อต่างประเทศตั้งแต่ปริญญาตรีถึงปริญญาเอก โดยทั่วไปมีข้อผูกพันให้กลับมาปฏิบัติงานในหน่วยงานรัฐ',
    ],
    fundingType: 'full',
    fundingSummary: ['Full funding with a service obligation', 'ทุนเต็มจำนวน มีข้อผูกพันการทำงานชดใช้ทุน'],
    deadlineNote: ['Announced in rounds during the year — check the official site', 'ประกาศรับสมัครเป็นรอบตลอดปี ตรวจสอบจากเว็บไซต์ทางการ'],
    notes: [
      'Each scholarship lists its field, destination and agency; read the obligation terms carefully.',
      'แต่ละทุนระบุสาขา ประเทศ และหน่วยงานต้นสังกัด ควรอ่านเงื่อนไขการชดใช้ทุนอย่างละเอียด',
    ],
    degreeLevels: ['bachelor', 'master', 'phd'],
    studyFields: [],
    sourceUrl: 'https://www.ocsc.go.th/',
  },
]

const payload = await getPayload({ config })
let created = 0
let updated = 0
for (const s of seeds) {
  const en = {
    type: 'scholarship' as const,
    listingStatus: 'active' as const,
    origin: 'manual' as const,
    slug: s.slug,
    institution: s.institution,
    country: s.country,
    title: s.title[0],
    summary: s.summary[0],
    fundingType: s.fundingType,
    fundingSummary: s.fundingSummary[0],
    deadlineNote: s.deadlineNote[0],
    requirements: { notes: s.notes[0] },
    degreeLevels: s.degreeLevels,
    studyFields: s.studyFields,
    sourceUrl: s.sourceUrl,
  }
  const th = {
    title: s.title[1],
    summary: s.summary[1],
    fundingSummary: s.fundingSummary[1],
    deadlineNote: s.deadlineNote[1],
    requirements: { notes: s.notes[1] },
  }
  // Trusted one-off admin script: bypasses access control on purpose.
  const existing = await payload.find({
    collection: 'opportunities',
    where: { slug: { equals: s.slug } },
    limit: 1,
    overrideAccess: true,
  })
  const doc = existing.docs[0]
    ? await payload.update({ collection: 'opportunities', id: existing.docs[0].id, data: en, locale: 'en', overrideAccess: true })
    : await payload.create({ collection: 'opportunities', data: en, locale: 'en', overrideAccess: true })
  if (existing.docs[0]) updated++
  else created++
  await payload.update({ collection: 'opportunities', id: doc.id, data: th, locale: 'th', overrideAccess: true })
}
console.log(`Listings seeded: ${created} created, ${updated} updated`)
process.exit(0)
