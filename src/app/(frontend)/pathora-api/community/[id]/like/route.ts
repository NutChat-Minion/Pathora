import { getReadablePost, recountPostLikes } from "@/lib/community-server";
import { getPayloadServer, handleError, jsonError, requireSession, relId } from "@/lib/journey-server";

export const dynamic = "force-dynamic";

type Context = RouteContext<"/pathora-api/community/[id]/like">;

export async function POST(_request: Request, context: Context) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const { id } = await context.params;

    const payload = await getPayloadServer();
    const post = await getReadablePost(payload, id, session.user);
    if (!post || post.status !== "visible") return jsonError(404, "Post not found.");

    const existing = await payload.find({
      collection: "post-likes",
      where: { and: [{ owner: { equals: session.user.id } }, { post: { equals: id } }] },
      limit: 1,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });

    let liked: boolean;
    if (existing.docs.length) {
      await payload.delete({
        collection: "post-likes",
        id: existing.docs[0].id,
        overrideAccess: false,
        user: session.user,
      });
      liked = false;
    } else {
      try {
        await payload.create({
          collection: "post-likes",
          data: { post: relId(id) },
          depth: 0,
          overrideAccess: false,
          user: session.user,
        });
      } catch {
        /* concurrent duplicate: unique index guarantees one like; treat as liked */
      }
      liked = true;
    }
    const likeCount = await recountPostLikes(payload, id);
    return Response.json({ liked, likeCount });
  } catch (error) {
    return handleError(error);
  }
}
