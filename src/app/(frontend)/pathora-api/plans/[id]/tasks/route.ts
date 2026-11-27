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

const MAX_TASKS = 100

export async function POST(request: Request, context: RouteContext<'/pathora-api/plans/[id]/tasks'>) {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const body = await readJsonObject(request)
    if (!body) return badBody()

    const fieldErrors: Record<string, string> = {}
    const title = cleanTaskTitle(body.title)
    if (!title) fieldErrors.title = 'Enter a task title (1-200 characters).'
    const due = cleanDate(body.dueDate)
    if (!due.ok) fieldErrors.dueDate = 'Enter a valid date (YYYY-MM-DD).'
    if (!title || !due.ok) {
      return jsonError(400, 'Check the highlighted fields and try again.', fieldErrors)
    }

    const { id } = await context.params
    const payload = await getPayloadServer()
    const plan = await getOwnedPlan(payload, id, session.user)
    if (!plan) return jsonError(404, 'Plan not found.')

    const tasks = rawTasks(plan)
    if (tasks.length >= MAX_TASKS) return jsonError(400, `A plan can have up to ${MAX_TASKS} tasks.`)

    const updated = await writePlanTasks(
      payload,
      plan,
      [...tasks, { title, done: false, dueDate: due.value }],
      session.user,
    )
    return Response.json({ plan: updated }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
