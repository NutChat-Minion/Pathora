import { getPayloadServer, handleError, idOf, jsonError, requireSession } from "@/lib/journey-server";
import { getReadablePost } from "@/lib/community-server";

export const dynamic = "force-dynamic";

type Context = RouteContext<"/pathora-api/community/[id]">;

export async function DELETE(_request: Request, context: Context) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const { id } = await context.params;

    const payload = await getPayloadServer();
    const post = await getReadablePost(payload, id, session.user);
    if (!post || idOf(post.author) !== String(session.user.id)) return jsonError(404, "Post not found.");

    await payload.delete({
      collection: "community-posts",
      id,
      overrideAccess: false,
      user: session.user,
    });
    // Clean up dependants (the author's delete does not carry access to others' rows).
    for (const collection of ["post-replies", "post-likes", "post-reports"]) {
      await payload.delete({
        collection,
        where: { post: { equals: id } },
        overrideAccess: true,
      });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
