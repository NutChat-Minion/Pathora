import {
  cleanOptionalText,
  cleanText,
  cleanTravelDate,
  loadDisplayNames,
  toTripDTO,
  tripInterestInfo,
} from "@/lib/community-server";
import {
  badBody,
  getPayloadServer,
  handleError,
  idOf,
  jsonError,
  readJsonObject,
  requireSession,
} from "@/lib/journey-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const viewerId = String(session.user.id);

    const payload = await getPayloadServer();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    // Read access already limits to open trips + your own; hide past open trips from others.
    const result = await payload.find({
      collection: "trips",
      where: {
        or: [
          { owner: { equals: viewerId } },
          { and: [{ status: { equals: "open" } }, { travelDate: { greater_than_equal: yesterday } }] },
        ],
      },
      sort: "travelDate",
      limit: 100,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    const names = await loadDisplayNames(payload, result.docs.map((d) => idOf(d.owner) ?? ""));
    const { counts, mine } = await tripInterestInfo(payload, result.docs.map((d) => String(d.id)), viewerId);
    return Response.json({
      trips: result.docs.map((d) =>
        toTripDTO(d, viewerId, names, counts.get(String(d.id)) ?? 0, mine.has(String(d.id))),
      ),
    });
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
    const origin = cleanText(body.origin ?? "Bangkok", 1, 80);
    if (!origin) fieldErrors.origin = "Enter where you are leaving from (up to 80 characters).";
    const destination = cleanText(body.destination, 1, 80);
    if (!destination) fieldErrors.destination = "Enter your destination (up to 80 characters).";
    const travelDate = cleanTravelDate(body.travelDate);
    if (!travelDate) fieldErrors.travelDate = "Enter a valid travel date within the next 3 years.";
    if (body.flexible !== undefined && typeof body.flexible !== "boolean") {
      fieldErrors.flexible = "Must be true or false.";
    }
    const note = cleanOptionalText(body.note, 500);
    if (!note.ok) fieldErrors.note = "Keep the note under 500 characters.";
    if (Object.keys(fieldErrors).length || !origin || !destination || !travelDate || !note.ok) {
      return jsonError(400, "Check the highlighted fields and try again.", fieldErrors);
    }

    const payload = await getPayloadServer();
    const open = await payload.find({
      collection: "trips",
      where: { and: [{ owner: { equals: session.user.id } }, { status: { equals: "open" } }] },
      limit: 1,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    if (open.totalDocs >= 10) return jsonError(400, "You can have up to 10 open trips. Close one first.");

    const doc = await payload.create({
      collection: "trips",
      data: {
        origin,
        destination,
        travelDate,
        flexible: body.flexible === true,
        note: note.value ?? undefined,
        status: "open",
      },
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    const viewerId = String(session.user.id);
    const names = await loadDisplayNames(payload, [viewerId]);
    return Response.json({ trip: toTripDTO(doc, viewerId, names, 0, false) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
