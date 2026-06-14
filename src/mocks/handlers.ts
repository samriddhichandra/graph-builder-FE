import { delay, http, HttpResponse } from 'msw'
import { mockApps, mockGraphs } from './fixtures'

export const handlers = [
  http.get('/apps', async ({ request }) => {
    await delay(350)
    if (shouldFail(request)) {
      return HttpResponse.json({ message: 'Mock GET /apps failed' }, { status: 500 })
    }
    return HttpResponse.json(mockApps)
  }),
  http.get('/apps/:appId/graph', async ({ params, request }) => {
    await delay(450)
    const appId = String(params.appId)
    if (shouldFail(request)) {
      return HttpResponse.json({ message: `Mock GET /apps/${appId}/graph failed` }, { status: 500 })
    }
    return HttpResponse.json(mockGraphs[appId] ?? mockGraphs.commerce)
  }),
]

function shouldFail(request: Request) {
  return new URL(request.url).searchParams.get('fail') === 'true'
}
