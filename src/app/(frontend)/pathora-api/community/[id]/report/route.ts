import { reportReasons } from "@/lib/community-contract";
import { cleanOptionalText, getReadablePost, recountPostReplies } from "@/lib/community-server";
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

type Context = RouteContext<"/pathora-api/community/[id]/report">;

const AUTO_HIDE_AT = 3;

export async function POST(request: Request, context: Context) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const { id } = await context.params;

    const body = await readJsonObject(request);
    if (!body) return badBody();

    const fieldErrors: Record<string, string> = {};
    const reason = body.reason;
    if (typeof reason !== "string" || !(reportReasons as readonly string[]).includes(reason)) {
      fieldErrors.reason = "Choose a reason.";
    }
    const note = cleanOptionalText(body.note, 500);
    if (!note.ok) fieldErrors.note = "Keep the note under 500 characters.";
    const replyId = body.replyId === undefined || body.replyId === null ? null : body.replyId;
    if (replyId !== null && (typeof replyId !== "string" || !replyId || replyId.length > 100)) {
      fieldErrors.replyId = "Invalid reply.";
    }
    if (Object.keys(fieldErrors).length || !note.ok) {
      return jsonError(400, "Check the highlighted fields and try again.", fieldErrors);
    }

    const payload = await getPayloadServer();
    const post = await getReadablePost(payload, id, session.user);
    if (!post) return jsonError(404, "Post not found.");

    const viewerId = String(session.user.id);
    let reply = null;
    if (replyId) {
      try {
        reply = await payload.findByID({
          collection: "post-replies",
          id: replyId as string,
          depth: 0,
          overrideAccess: false,
          user: session.user,
        });
      } catch {
        reply = null;
      }
      if (!reply || idOf(reply.post) !== id) return jsonError(404, "Reply not found.");
      if (idOf(reply.author) === viewerId) return jsonError(400, "You cannot report your own reply.");
    } else if (idOf(post.author) === viewerId) {
      return jsonError(400, "You cannot report your own post.");
    }

    const target = reply
      ? { reply: { equals: reply.id } }
      : { and: [{ post: { equals: id } }, { reply: { exists: false } }] };
    const mine = await payload.find({
      collection: "post-reports",
      where: { and: [{ reporter: { equals: viewerId } }, target] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (mine.docs.length) return jsonError(409, "You have already reported this.");

    // Reporter is set explicitly; post-reports is admin-read-only so this uses overrideAccess:true.
    await payload.create({
      collection: "post-reports",
      data: {
        post: relId(id),
        reply: reply ? reply.id : undefined,
        reporter: relId(viewerId),
        reason,
        note: note.value ?? undefined,
      },
      depth: 0,
      overrideAccess: true,
    });

    const all = await payload.find({
      collection: "post-reports",
      where: target,
      limit: 50,
      depth: 0,
      overrideAccess: true,
    });
    const distinct = new Set(all.docs.map((doc) => idOf(doc.reporter)));
    if (distinct.size >= AUTO_HIDE_AT) {
      const reasonText = "Hidden automatically after multiple reports.";
      if (reply) {
        await payload.update({
          collection: "post-replies",
          id: reply.id,
          data: { status: "hidden", moderationReason: reasonText },
          depth: 0,
          overrideAccess: true,
        });
        await recountPostReplies(payload, id);
      } else {
        await payload.update({
          collection: "community-posts",
          id,
          data: { status: "hidden", moderationReason: reasonText },
          depth: 0,
          overrideAccess: true,
        });
      }
    }
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
