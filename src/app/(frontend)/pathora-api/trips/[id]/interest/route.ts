import { tripInterestInfo } from "@/lib/community-server";
import { getPayloadServer, handleError, idOf, jsonError, requireSession, relId } from "@/lib/journey-server";

export const dynamic = "force-dynamic";

type Context = RouteContext<"/pathora-api/trips/[id]/interest">;

export async function POST(_request: Request, context: Context) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const { id } = await context.params;
    const viewerId = String(session.user.id);

    const payload = await getPayloadServer();
    let trip;
    try {
      trip = await payload.findByID({
        collection: "trips",
        id,
        depth: 0,
        overrideAccess: false,
        user: session.user,
      });
    } catch {
      return jsonError(404, "Trip not found.");
    }
    if (idOf(trip.owner) === viewerId) return jsonError(400, "This is your own trip.");

    const existing = await payload.find({
      collection: "trip-interests",
      where: { and: [{ owner: { equals: viewerId } }, { trip: { equals: id } }] },
      limit: 1,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    if (existing.docs.length) {
      await payload.delete({
        collection: "trip-interests",
        id: existing.docs[0].id,
        overrideAccess: false,
        user: session.user,
      });
    } else {
      if (trip.status !== "open") return jsonError(409, "This trip is closed.");
      try {
        await payload.create({
          collection: "trip-interests",
          data: { trip: relId(id) },
          depth: 0,
          overrideAccess: false,
          user: session.user,
        });
      } catch {
        /* duplicate from a concurrent request: already interested */
      }
    }
    const { counts, mine } = await tripInterestInfo(payload, [id], viewerId);
    return Response.json({ interested: mine.has(id), interestCount: counts.get(id) ?? 0 });
  } catch (error) {
    return handleError(error);
  }
}
