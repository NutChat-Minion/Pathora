import type { BuddyDTO } from "@/lib/community-contract";
import { BUDDY_SELECT, matchScore, toPublicBuddy } from "@/lib/community-server";
import {
  getPayloadServer,
  handleError,
  idOf,
  loadUserDoc,
  requireSession,
} from "@/lib/journey-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;

    const payload = await getPayloadServer();
    const me = await loadUserDoc(payload, session);

    // Users are readable only by their owner, so discovery reads with overrideAccess:true.
    // This is safe because the query is restricted to users who opted in
    // (settings.profileVisibility = buddies) and `select` limits it to non-sensitive fields.
    const candidates = await payload.find({
      collection: "users",
      where: {
        and: [
          { "settings.profileVisibility": { equals: "buddies" } },
          { id: { not_equals: session.user.id } },
        ],
      },
      select: BUDDY_SELECT,
      limit: 100,
      depth: 0,
      overrideAccess: true,
    });

    const connections = await payload.find({
      collection: "buddy-connections",
      where: {
        or: [{ from: { equals: session.user.id } }, { to: { equals: session.user.id } }],
      },
      limit: 200,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    const byOther = new Map<string, BuddyDTO["connection"]>();
    const viewerId = String(session.user.id);
    for (const c of connections.docs) {
      const outgoing = idOf(c.from) === viewerId;
      const other = (outgoing ? idOf(c.to) : idOf(c.from)) ?? "";
      byOther.set(other, {
        id: String(c.id),
        status: c.status ?? "pending",
        direction: outgoing ? "outgoing" : "incoming",
      });
    }

    const buddies: BuddyDTO[] = candidates.docs
      .map((doc) => ({
        ...toPublicBuddy(doc),
        match: matchScore(me, doc),
        connection: byOther.get(String(doc.id)) ?? null,
      }))
      .sort((a, b) => b.match - a.match);

    return Response.json({ buddies });
  } catch (error) {
    return handleError(error);
  }
}
