import { checklistKeys, isChecklistId } from "@/lib/checklists";
import {
  badBody,
  getPayloadServer,
  handleError,
  jsonError,
  readJsonObject,
  requireSession,
  type LoosePayload,
  type Session,
} from "@/lib/journey-server";

export const dynamic = "force-dynamic";

type Context = RouteContext<"/pathora-api/checklists/[checklist]">;

async function findProgress(payload: LoosePayload, checklist: string, user: Session["user"]) {
  const result = await payload.find({
    collection: "checklist-progress",
    where: { and: [{ owner: { equals: user.id } }, { checklist: { equals: checklist } }] },
    limit: 1,
    depth: 0,
    overrideAccess: false,
    user,
  });
  return result.docs[0] ?? null;
}

const items = (doc: Record<string, unknown> | null | undefined): string[] =>
  Array.isArray(doc?.completedItems)
    ? (doc.completedItems as unknown[]).filter((v): v is string => typeof v === "string")
    : [];

export async function GET(_request: Request, context: Context) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const { checklist } = await context.params;
    if (!isChecklistId(checklist)) return jsonError(404, "Unknown checklist.");
    const payload = await getPayloadServer();
    const doc = await findProgress(payload, checklist, session.user);
    const valid = new Set(checklistKeys(checklist));
    return Response.json({ checklist, completedItems: items(doc).filter((k) => valid.has(k)) });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    const session = await requireSession();
    if (session instanceof Response) return session;
    const { checklist } = await context.params;
    if (!isChecklistId(checklist)) return jsonError(404, "Unknown checklist.");

    const body = await readJsonObject(request);
    if (!body) return badBody();
    const valid = new Set(checklistKeys(checklist));
    const raw = body.completedItems;
    if (!Array.isArray(raw) || raw.length > 50 || !raw.every((k) => typeof k === "string" && valid.has(k))) {
      return jsonError(400, "Check the values you entered and try again.", {
        completedItems: "Contains an unknown checklist item.",
      });
    }
    const completedItems = [...new Set(raw as string[])];

    const payload = await getPayloadServer();
    const existing = await findProgress(payload, checklist, session.user);
    if (existing) {
      await payload.update({
        collection: "checklist-progress",
        id: existing.id,
        data: { completedItems },
        depth: 0,
        overrideAccess: false,
        user: session.user,
      });
    } else {
      await payload.create({
        collection: "checklist-progress",
        data: { checklist, completedItems },
        depth: 0,
        overrideAccess: false,
        user: session.user,
      });
    }
    return Response.json({ checklist, completedItems });
  } catch (error) {
    return handleError(error);
  }
}
