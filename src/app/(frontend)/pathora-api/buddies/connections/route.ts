import type { ConnectionDTO } from "@/lib/community-contract";
import { BUDDY_SELECT, toPublicBuddy } from "@/lib/community-server";
import {
  badBody,
  getPayloadServer,
  handleError,
  idOf,
  jsonError,
  readJsonObject,
  requireSession, relId
} from "@/lib/journey-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const viewerId = String(session.user.id);

    const payload = await getPayloadServer();
    const result = await payload.find({
      collection: "buddy-connections",
      where: { or: [{ from: { equals: viewerId } }, { to: { equals: viewerId } }] },
      sort: "-createdAt",
      limit: 200,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    const otherIds = result.docs.map((c) =>
      idOf(c.from) === viewerId ? (idOf(c.to) ?? "") : (idOf(c.from) ?? ""),
    );
    // Safe-field select only (see buddies/route.ts). Counterparts may have since gone private;
    // we still show their display name, but nothing beyond the public buddy fields.
    const others = otherIds.length
      ? await payload.find({
          collection: "users",
          where: { id: { in: [...new Set(otherIds)] } },
          select: BUDDY_SELECT,
          limit: otherIds.length,
          pagination: false,
          depth: 0,
          overrideAccess: true,
        })
      : { docs: [] };
    const byId = new Map(others.docs.map((d) => [String(d.id), toPublicBuddy(d)]));

    const connections: ConnectionDTO[] = result.docs.map((c) => {
      const outgoing = idOf(c.from) === viewerId;
      const otherId = (outgoing ? idOf(c.to) : idOf(c.from)) ?? "";
      const other = byId.get(otherId);
      return {
        id: String(c.id),
        status: c.status ?? "pending",
        direction: outgoing ? "outgoing" : "incoming",
        other: {
          id: otherId,
          name: other?.name ?? "Student",
          destination: other?.destination ?? "",
          university: other?.university ?? "",
        },
        createdAt: typeof c.createdAt === "string" ? c.createdAt : "",
      };
    });
    return Response.json({ connections });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const viewerId = String(session.user.id);

    const body = await readJsonObject(request);
    const toUserId = body?.toUserId;
    if (typeof toUserId !== "string" || !toUserId || toUserId.length > 100) return badBody();
    if (toUserId === viewerId) return jsonError(400, "You cannot connect with yourself.");

    const payload = await getPayloadServer();
    // Recipient must exist and have opted in to buddy discovery.
    const target = await payload.find({
      collection: "users",
      where: {
        and: [
          { id: { equals: toUserId } },
          { "settings.profileVisibility": { equals: "buddies" } },
        ],
      },
      select: { settings: { profileVisibility: true } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (!target.docs.length) return jsonError(404, "That student is not available.");

    const existing = await payload.find({
      collection: "buddy-connections",
      where: {
        or: [
          { and: [{ from: { equals: viewerId } }, { to: { equals: toUserId } }] },
          { and: [{ from: { equals: toUserId } }, { to: { equals: viewerId } }] },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    if (existing.docs.length) return jsonError(409, "You already have a connection with this student.");

    // from/status are server-owned; set explicitly (overrideAccess:true), inputs validated above.
    const doc = await payload.create({
      collection: "buddy-connections",
      data: { from: relId(viewerId), to: relId(toUserId), status: "pending" },
      depth: 0,
      overrideAccess: true,
    });
    return Response.json({ connection: { id: String(doc.id), status: "pending", direction: "outgoing" } }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
