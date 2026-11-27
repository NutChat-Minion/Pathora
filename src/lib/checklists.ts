/** Client-safe checklist definitions. Server validates saved item keys against these. */

export type ChecklistId = "visa" | "pre-departure";
export const checklistIds: ChecklistId[] = ["visa", "pre-departure"];

export type ChecklistText = { title: string; description: string };
export type ChecklistItem = { key: string; title: string; description: string; th: ChecklistText };

export const CHECKLISTS: Record<ChecklistId, ChecklistItem[]> = {
  visa: [
    {
      key: "passport",
      title: "Check passport validity",
      description: "Make sure your passport is valid for the whole course plus the buffer your destination requires.",
      th: {
        title: "ตรวจอายุหนังสือเดินทาง",
        description: "ตรวจว่าหนังสือเดินทางยังไม่หมดอายุตลอดหลักสูตร และเผื่อเวลาตามที่ประเทศปลายทางกำหนด",
      },
    },
    {
      key: "offer",
      title: "Gather enrolment evidence",
      description: "Keep your offer letter and any confirmation of enrolment the official portal asks for.",
      th: {
        title: "รวบรวมหลักฐานการรับเข้าเรียน",
        description: "เก็บจดหมายตอบรับ (offer letter) และเอกสารยืนยันการลงทะเบียนที่พอร์ทัลทางการขอ",
      },
    },
    {
      key: "finances",
      title: "Prepare financial evidence",
      description: "Collect bank statements or sponsor documents that match the official funds requirement.",
      th: {
        title: "เตรียมหลักฐานทางการเงิน",
        description: "รวบรวมสเตตเมนต์ธนาคารหรือเอกสารผู้สนับสนุนให้ตรงกับเกณฑ์เงินทุนที่ทางการกำหนด",
      },
    },
    {
      key: "english",
      title: "Confirm English test evidence",
      description: "Check which English test results the visa and your university accept, and that they are still valid.",
      th: {
        title: "ยืนยันผลสอบภาษาอังกฤษ",
        description: "เช็กว่าวีซ่าและมหาวิทยาลัยยอมรับผลสอบภาษาอังกฤษแบบไหน และผลสอบของคุณยังไม่หมดอายุ",
      },
    },
    {
      key: "health",
      title: "Check health requirements",
      description: "Look up required health checks and insurance cover for your destination.",
      th: {
        title: "ตรวจเงื่อนไขด้านสุขภาพ",
        description: "ดูว่าต้องตรวจสุขภาพและทำประกันสุขภาพอะไรบ้างสำหรับประเทศปลายทาง",
      },
    },
    {
      key: "submit",
      title: "Submit through the official portal",
      description: "Apply only through the government website. Pay official fees only on official pages.",
      th: {
        title: "ยื่นผ่านพอร์ทัลทางการ",
        description: "ยื่นผ่านเว็บไซต์ของรัฐเท่านั้น และชำระค่าธรรมเนียมเฉพาะในหน้าเว็บทางการ",
      },
    },
  ],
  "pre-departure": [
    {
      key: "documents",
      title: "Documents",
      description: "Save offline copies of passport, offer, insurance and emergency contacts.",
      th: {
        title: "เอกสาร",
        description: "เก็บสำเนาหนังสือเดินทาง จดหมายตอบรับ ประกัน และรายชื่อผู้ติดต่อฉุกเฉินไว้ใช้แบบออฟไลน์",
      },
    },
    {
      key: "health-insurance",
      title: "Health & insurance",
      description: "Review cover dates, medication rules and destination health guidance.",
      th: {
        title: "สุขภาพและประกัน",
        description: "ตรวจช่วงเวลาคุ้มครอง กฎการนำยาเข้าประเทศ และคำแนะนำด้านสุขภาพของประเทศปลายทาง",
      },
    },
    {
      key: "money",
      title: "Money setup",
      description: "Plan first-week funds and compare international payment options.",
      th: {
        title: "เตรียมเรื่องเงิน",
        description: "วางแผนเงินสำหรับสัปดาห์แรก และเปรียบเทียบวิธีชำระเงินระหว่างประเทศ",
      },
    },
    {
      key: "packing",
      title: "Pack with purpose",
      description: "Build a climate-aware packing list and check airline baggage rules.",
      th: {
        title: "จัดกระเป๋าอย่างมีจุดหมาย",
        description: "ทำรายการของที่ต้องเตรียมตามสภาพอากาศ และเช็กกฎน้ำหนักกระเป๋าของสายการบิน",
      },
    },
    {
      key: "first-72",
      title: "First 72 hours",
      description: "Plan airport transfer, check-in, SIM and campus registration.",
      th: {
        title: "72 ชั่วโมงแรก",
        description: "วางแผนรถรับส่งจากสนามบิน การเช็กอินที่พัก ซิมการ์ด และการลงทะเบียนที่มหาวิทยาลัย",
      },
    },
  ],
};

export const isChecklistId = (value: unknown): value is ChecklistId =>
  typeof value === "string" && (checklistIds as string[]).includes(value);

export const checklistKeys = (id: ChecklistId): string[] => CHECKLISTS[id].map((item) => item.key);

/** Item copy for the UI language; `key` is unchanged because it is what gets stored. */
export const localizedChecklist = (id: ChecklistId, lang: "en" | "th"): ChecklistItem[] =>
  CHECKLISTS[id].map((item) => (lang === "th" ? { ...item, ...item.th } : item));
