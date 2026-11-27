import {
  cleanText,
  getReadablePost,
  loadDisplayNames,
  recountPostReplies,
  toReplyDTO,
} from "@/lib/community-server";
import {
  badBody,
  getPayloadServer,
  handleError,
  idOf,
  jsonError,
  readJsonObject,
  requireSession, relId
} from "@/lib/journey-server";
import { moderateText } from "@/lib/moderation";

export const dynamic = "force-dynamic";

type Context = RouteContext<"/pathora-api/community/[id]/replies">;

export async function GET(_request: Request, context: Context) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const { id } = await context.params;

    const payload = await getPayloadServer();
    const post = await getReadablePost(payload, id, session.user);
    if (!post) return jsonError(404, "Post not found.");

    const result = await payload.find({
      collection: "post-replies",
      where: { post: { equals: id } },
      sort: "createdAt",
      limit: 100,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    const names = await loadDisplayNames(
      payload,
      result.docs.map((doc) => idOf(doc.author) ?? ""),
    );
    const viewerId = String(session.user.id);
    return Response.json({ replies: result.docs.map((doc) => toReplyDTO(doc, viewerId, names)) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const { id } = await context.params;

    const body = await readJsonObject(request);
    if (!body) return badBody();
    const text = cleanText(body.body, 1, 1000);
    if (!text) {
      return jsonError(400, "Check the highlighted fields and try again.", {
        body: "Write a reply (up to 1000 characters).",
      });
    }

    const payload = await getPayloadServer();
    const post = await getReadablePost(payload, id, session.user);
    if (!post || post.status !== "visible") return jsonError(404, "Post not found.");

    const recent = await payload.find({
      collection: "post-replies",
      where: {
        and: [
          { author: { equals: session.user.id } },
          { createdAt: { greater_than: new Date(Date.now() - 5 * 60 * 1000).toISOString() } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (recent.totalDocs >= 10) return jsonError(429, "You are replying too quickly. Try again shortly.");

    const verdict = await moderateText(text);
    // Server-owned author/status are set explicitly, hence overrideAccess:true (body allowlisted above).
    const doc = await payload.create({
      collection: "post-replies",
      data: {
        post: relId(id),
        author: session.user.id,
        body: text,
        status: verdict.allowed ? "visible" : "flagged",
        moderationReason: verdict.allowed ? undefined : verdict.reason,
      },
      depth: 0,
      overrideAccess: true,
    });
    if (verdict.allowed) await recountPostReplies(payload, id);

    const names = await loadDisplayNames(payload, [String(session.user.id)]);
    return Response.json(
      {
        reply: toReplyDTO(doc, String(session.user.id), names),
        held: !verdict.allowed,
        message: verdict.allowed ? undefined : "Your reply is held for review.",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}
