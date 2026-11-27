import { roomTypeValues } from "@/lib/community-contract";
import { cleanHttpUrl, cleanOptionalText, cleanText, toHousingDTO } from "@/lib/community-server";
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

type Context = RouteContext<"/pathora-api/housing/[id]">;

async function getOwned(payload: LoosePayload, id: string, user: Session["user"]) {
  try {
    const doc = await payload.findByID({
      collection: "housing-shortlist",
      id,
      depth: 0,
      overrideAccess: false,
      user,
    });
    return idOf(doc.owner) === String(user.id) ? doc : null;
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
    if (!body) return badBody();

    const data: Record<string, unknown> = {};
    const fieldErrors: Record<string, string> = {};
    if ("name" in body) {
      const name = cleanText(body.name, 1, 160);
      if (name) data.name = name;
      else fieldErrors.name = "Enter a name (up to 160 characters).";
    }
    if ("url" in body) {
      const url = cleanHttpUrl(body.url);
      if (url.ok) data.url = url.value ?? "";
      else fieldErrors.url = "Enter a valid http(s) link.";
    }
    for (const [key, max] of [["city", 80], ["currency", 8], ["notes", 1000]] as const) {
      if (!(key in body)) continue;
      const clean = cleanOptionalText(body[key], max);
      if (clean.ok) data[key] = clean.value ?? "";
      else fieldErrors[key] = `Keep this under ${max} characters.`;
    }
    if ("weeklyPrice" in body) {
      const v = body.weeklyPrice;
      if (v === null || v === "") data.weeklyPrice = null;
      else if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 1_000_000) data.weeklyPrice = v;
      else fieldErrors.weeklyPrice = "Enter a price of 0 or more.";
    }
    if ("roomType" in body) {
      const v = body.roomType;
      if (v === null || v === "") data.roomType = null;
      else if (typeof v === "string" && (roomTypeValues as readonly string[]).includes(v)) data.roomType = v;
      else fieldErrors.roomType = "Choose a room type.";
    }
    if (Object.keys(fieldErrors).length) {
      return jsonError(400, "Check the highlighted fields and try again.", fieldErrors);
    }

    const payload = await getPayloadServer();
    if (!(await getOwned(payload, id, session.user))) return jsonError(404, "Item not found.");
    const doc = await payload.update({
      collection: "housing-shortlist",
      id,
      data,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    });
    return Response.json({ item: toHousingDTO(doc) });
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
    if (!(await getOwned(payload, id, session.user))) return jsonError(404, "Item not found.");
    await payload.delete({
      collection: "housing-shortlist",
      id,
      overrideAccess: false,
      user: session.user,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
