import { cleanHttpUrl, cleanOptionalText, cleanText, toHousingDTO } from "@/lib/community-server";
import { roomTypeValues } from "@/lib/community-contract";
import {
  badBody,
  getPayloadServer,
  handleError,
  jsonError,
  readJsonObject,
  requireSession,
} from "@/lib/journey-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const payload = await getPayloadServer();
    const result = await payload.find({
      collection: "housing-shortlist",
      where: { owner: { equals: session.user.id } },
      sort: "-createdAt",
      limit: 100,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    return Response.json({ items: result.docs.map(toHousingDTO) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const body = await readJsonObject(request);
    if (!body) return badBody();

    const fieldErrors: Record<string, string> = {};
    const name = cleanText(body.name, 1, 160);
    if (!name) fieldErrors.name = "Enter a name (up to 160 characters).";
    const url = cleanHttpUrl(body.url);
    if (!url.ok) fieldErrors.url = "Enter a valid http(s) link.";
    const city = cleanOptionalText(body.city, 80);
    if (!city.ok) fieldErrors.city = "Keep the city under 80 characters.";
    const currency = cleanOptionalText(body.currency, 8);
    if (!currency.ok) fieldErrors.currency = "Keep the currency under 8 characters.";
    const notes = cleanOptionalText(body.notes, 1000);
    if (!notes.ok) fieldErrors.notes = "Keep the notes under 1000 characters.";
    let weeklyPrice: number | undefined;
    if (body.weeklyPrice !== undefined && body.weeklyPrice !== null && body.weeklyPrice !== "") {
      if (typeof body.weeklyPrice === "number" && Number.isFinite(body.weeklyPrice) && body.weeklyPrice >= 0 && body.weeklyPrice < 1_000_000) {
        weeklyPrice = body.weeklyPrice;
      } else fieldErrors.weeklyPrice = "Enter a price of 0 or more.";
    }
    let roomType: string | undefined;
    if (body.roomType !== undefined && body.roomType !== null && body.roomType !== "") {
      if (typeof body.roomType === "string" && (roomTypeValues as readonly string[]).includes(body.roomType)) {
        roomType = body.roomType;
      } else fieldErrors.roomType = "Choose a room type.";
    }
    if (Object.keys(fieldErrors).length || !name || !url.ok || !city.ok || !currency.ok || !notes.ok) {
      return jsonError(400, "Check the highlighted fields and try again.", fieldErrors);
    }

    const payload = await getPayloadServer();
    const count = await payload.find({
      collection: "housing-shortlist",
      where: { owner: { equals: session.user.id } },
      limit: 1,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    if (count.totalDocs >= 100) return jsonError(400, "Your shortlist is full (100 items).");

    const doc = await payload.create({
      collection: "housing-shortlist",
      data: {
        name,
        url: url.value ?? undefined,
        city: city.value ?? undefined,
        weeklyPrice,
        currency: currency.value ?? undefined,
        roomType,
        notes: notes.value ?? undefined,
      },
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    return Response.json({ item: toHousingDTO(doc) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
