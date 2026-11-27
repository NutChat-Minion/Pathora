import {
  badBody,
  getPayloadServer,
  handleError,
  idOf,
  jsonError,
  readJsonObject,
  requireSession,
  type LoosePayload,
  type Session,
} from "@/lib/journey-server";

export const dynamic = "force-dynamic";

type Context = RouteContext<"/pathora-api/buddies/connections/[id]">;

async function getMine(payload: LoosePayload, id: string, user: Session["user"]) {
  try {
    return await payload.findByID({
      collection: "buddy-connections",
      id,
      depth: 0,
      overrideAccess: false,
      user,
    });
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
    const status = body?.status;
    if (status !== "accepted" && status !== "declined") {
      return jsonError(400, "Check the values you entered and try again.", {
        status: "Must be accepted or declined.",
      });
    }
    if (!body) return badBody();

    const payload = await getPayloadServer();
    const connection = await getMine(payload, id, session.user);
    if (!connection) return jsonError(404, "Connection not found.");
    // Only the recipient may respond (also enforced by field access on buddy-connections.status).
    if (idOf(connection.to) !== String(session.user.id)) {
      return jsonError(403, "Only the person who received the request can respond.");
    }
    if (connection.status !== "pending") return jsonError(409, "This request was already answered.");

    const updated = await payload.update({
      collection: "buddy-connections",
      id,
      data: { status },
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    return Response.json({ connection: { id: String(updated.id), status: updated.status } });
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
    const connection = await getMine(payload, id, session.user);
    if (!connection) return jsonError(404, "Connection not found.");
    if (idOf(connection.from) !== String(session.user.id)) {
      return jsonError(403, "Only the sender can cancel a request.");
    }
    await payload.delete({
      collection: "buddy-connections",
      id,
      overrideAccess: false,
      user: session.user,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
