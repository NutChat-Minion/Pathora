import {
  cleanOptionalText,
  cleanText,
  cleanTravelDate,
  loadDisplayNames,
  toTripDTO,
  tripInterestInfo,
} from "@/lib/community-server";
import {
  getPayloadServer,
  handleError,
  idOf,
  jsonError,
  readJsonObject,
  requireSession,
  badBody,
  type LoosePayload,
  type Session,
} from "@/lib/journey-server";

export const dynamic = "force-dynamic";

type Context = RouteContext<"/pathora-api/trips/[id]">;

async function getOwnedTrip(payload: LoosePayload, id: string, user: Session["user"]) {
  try {
    const trip = await payload.findByID({
      collection: "trips",
      id,
      depth: 0,
      overrideAccess: false,
      user,
    });
    return idOf(trip.owner) === String(user.id) ? trip : null;
  } catch {
    return null;
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const { id } = await context.params;
    const body = await readJsonObject(request);
    if (!body) return badBody();

    const data: Record<string, unknown> = {};
    const fieldErrors: Record<string, string> = {};
    if ("status" in body) {
      if (body.status === "open" || body.status === "closed") data.status = body.status;
      else fieldErrors.status = "Must be open or closed.";
    }
    for (const key of ["origin", "destination"] as const) {
      if (!(key in body)) continue;
      const text = cleanText(body[key], 1, 80);
      if (text) data[key] = text;
      else fieldErrors[key] = "Enter 1-80 characters.";
    }
    if ("travelDate" in body) {
      const date = cleanTravelDate(body.travelDate);
      if (date) data.travelDate = date;
      else fieldErrors.travelDate = "Enter a valid travel date within the next 3 years.";
    }
    if ("flexible" in body) {
      if (typeof body.flexible === "boolean") data.flexible = body.flexible;
      else fieldErrors.flexible = "Must be true or false.";
    }
    if ("note" in body) {
      const note = cleanOptionalText(body.note, 500);
      if (note.ok) data.note = note.value ?? "";
      else fieldErrors.note = "Keep the note under 500 characters.";
    }
    if (Object.keys(fieldErrors).length) {
      return jsonError(400, "Check the highlighted fields and try again.", fieldErrors);
    }

    const payload = await getPayloadServer();
    if (!(await getOwnedTrip(payload, id, session.user))) return jsonError(404, "Trip not found.");
    const doc = await payload.update({
      collection: "trips",
      id,
      data,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    const viewerId = String(session.user.id);
    const names = await loadDisplayNames(payload, [viewerId]);
    const { counts, mine } = await tripInterestInfo(payload, [id], viewerId);
    return Response.json({ trip: toTripDTO(doc, viewerId, names, counts.get(id) ?? 0, mine.has(id)) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const { id } = await context.params;
    const payload = await getPayloadServer();
    if (!(await getOwnedTrip(payload, id, session.user))) return jsonError(404, "Trip not found.");
    await payload.delete({ collection: "trips", id, overrideAccess: false, user: session.user });
    await payload.delete({
      collection: "trip-interests",
      where: { trip: { equals: id } },
      overrideAccess: true,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
