import { communityTopicValues, type CommunityTopic } from "@/lib/community-contract";
import {
  MODERATION_HELD_MESSAGE,
  cleanOptionalText,
  cleanText,
  likedPostIds,
  loadDisplayNames,
  toPostDTO,
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
import { moderateText } from "@/lib/moderation";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;

    const params = new URL(request.url).searchParams;
    const conditions: Record<string, unknown>[] = [];
    const topic = params.get("topic");
    if (topic) {
      if (!(communityTopicValues as readonly string[]).includes(topic)) {
        return jsonError(400, "Unknown topic.");
      }
      conditions.push({ topic: { equals: topic } });
    }
    const destination = params.get("destination")?.trim();
    if (destination) {
      if (destination.length > 80) return jsonError(400, "Destination is too long.");
      conditions.push({ destination: { like: destination } });
    }
    const page = Math.max(1, Math.min(1000, Number.parseInt(params.get("page") ?? "1", 10) || 1));

    const payload = await getPayloadServer();
    const result = await payload.find({
      collection: "community-posts",
      where: conditions.length ? { and: conditions } : undefined,
      sort: "-createdAt",
      limit: PAGE_SIZE,
      page,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });

    const viewerId = String(session.user.id);
    const names = await loadDisplayNames(
      payload,
      result.docs.map((doc) => idOf(doc.author) ?? ""),
    );
    const liked = await likedPostIds(
      payload,
      session.user,
      result.docs.map((doc) => String(doc.id)),
    );
    return Response.json({
      posts: result.docs.map((doc) => toPostDTO(doc, viewerId, names, liked)),
      page,
      hasMore: page * PAGE_SIZE < result.totalDocs,
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
    const text = cleanText(body.body, 1, 2000);
    if (!text) fieldErrors.body = "Write something (up to 2000 characters).";
    const topic = (body.topic ?? "general") as string;
    if (!(communityTopicValues as readonly string[]).includes(topic)) fieldErrors.topic = "Choose a topic.";
    const destination = cleanOptionalText(body.destination, 80);
    if (!destination.ok) fieldErrors.destination = "Keep the destination under 80 characters.";
    if (Object.keys(fieldErrors).length || !text || !destination.ok) {
      return jsonError(400, "Check the highlighted fields and try again.", fieldErrors);
    }

    const payload = await getPayloadServer();

    // Simple flood guard: at most 5 posts per 10 minutes per user.
    const recent = await payload.find({
      collection: "community-posts",
      where: {
        and: [
          { author: { equals: session.user.id } },
          { createdAt: { greater_than: new Date(Date.now() - 10 * 60 * 1000).toISOString() } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (recent.totalDocs >= 5) return jsonError(429, "You are posting too quickly. Try again in a few minutes.");

    const verdict = await moderateText(destination.value ? `${text}\n(${destination.value})` : text);

    // Server-owned fields (author, status, moderation, counters) are set explicitly here, so
    // this write uses overrideAccess:true; every client-supplied field was allowlisted above.
    const doc = await payload.create({
      collection: "community-posts",
      data: {
        author: session.user.id,
        body: text,
        topic: topic as CommunityTopic,
        destination: destination.value ?? undefined,
        status: verdict.allowed ? "visible" : "flagged",
        moderationReason: verdict.allowed ? undefined : verdict.reason,
        likeCount: 0,
        replyCount: 0,
      },
      depth: 0,
      overrideAccess: true,
    });

    const names = await loadDisplayNames(payload, [String(session.user.id)]);
    return Response.json(
      {
        post: toPostDTO(doc, String(session.user.id), names, new Set()),
        held: !verdict.allowed,
        message: verdict.allowed ? undefined : MODERATION_HELD_MESSAGE,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}
