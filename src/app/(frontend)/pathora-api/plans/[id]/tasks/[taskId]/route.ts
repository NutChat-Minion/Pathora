import {
  badBody,
  cleanDate,
  cleanTaskTitle,
  getOwnedPlan,
  getPayloadServer,
  handleError,
  jsonError,
  rawTasks,
  readJsonObject,
  requireSession,
  writePlanTasks,
} from '@/lib/journey-server'

export const dynamic = 'force-dynamic'

type Context = RouteContext<'/pathora-api/plans/[id]/tasks/[taskId]'>

export async function PATCH(request: Request, context: Context) {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const body = await readJsonObject(request)
    if (!body) return badBody()

    const changes: { done?: boolean; title?: string; dueDate?: string | null } = {}
    const fieldErrors: Record<string, string> = {}

    if ('done' in body) {
      if (typeof body.done === 'boolean') changes.done = body.done
      else fieldErrors.done = 'Must be true or false.'
    }
    if ('title' in body) {
      const title = cleanTaskTitle(body.title)
      if (title) changes.title = title
      else fieldErrors.title = 'Enter a task title (1-200 characters).'
    }
    if ('dueDate' in body) {
      const due = cleanDate(body.dueDate)
      if (due.ok) changes.dueDate = due.value
      else fieldErrors.dueDate = 'Enter a valid date (YYYY-MM-DD).'
    }
    if (Object.keys(fieldErrors).length) {
      return jsonError(400, 'Check the highlighted fields and try again.', fieldErrors)
    }

    const { id, taskId } = await context.params
    const payload = await getPayloadServer()
    const plan = await getOwnedPlan(payload, id, session.user)
    if (!plan) return jsonError(404, 'Plan not found.')

    const tasks = rawTasks(plan)
    const index = tasks.findIndex((t) => String(t.id) === taskId)
    if (index === -1) return jsonError(404, 'Task not found.')
    tasks[index] = { ...tasks[index], ...changes }

    const updated = await writePlanTasks(payload, plan, tasks, session.user)
    return Response.json({ plan: updated })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const { id, taskId } = await context.params
    const payload = await getPayloadServer()
    const plan = await getOwnedPlan(payload, id, session.user)
    if (!plan) return jsonError(404, 'Plan not found.')

    const tasks = rawTasks(plan)
    if (!tasks.some((t) => String(t.id) === taskId)) return jsonError(404, 'Task not found.')

    const updated = await writePlanTasks(
      payload,
      plan,
      tasks.filter((t) => String(t.id) !== taskId),
      session.user,
    )
    return Response.json({ plan: updated })
  } catch (error) {
    return handleError(error)
  }
}
