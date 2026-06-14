import type { Edge, Node } from '@xyflow/react'

export type AppSummary = {
  id: string
  name: string
  environment: string
  health: 'Healthy' | 'Warning'
  services: number
}

export type ServiceStatus = 'Healthy' | 'Degraded' | 'Down'

export type ServiceNodeData = {
  label: string
  description: string
  service: 'gateway' | 'queue' | 'postgres' | 'redis' | 'mongo'
  status: ServiceStatus
  runtime: string
  cpu: number
}

export type GraphNode = Node<ServiceNodeData, 'service'>
export type GraphResponse = { nodes: GraphNode[]; edges: Edge[] }

export function createServiceNode(
  id: string,
  label: string,
  service: ServiceNodeData['service'],
  status: ServiceStatus,
  cpu: number,
  position: GraphNode['position'],
): GraphNode {
  return {
    id,
    type: 'service',
    position,
    data: {
      label,
      service,
      status,
      cpu,
      runtime: getRuntimeLabel(service),
      description: `${label} service for the selected application.`,
    },
  }
}

function getFailureQuery(shouldFail: boolean) {
  return shouldFail ? '?fail=true' : ''
}

export async function getApps(shouldFail: boolean): Promise<AppSummary[]> {
  const response = await fetch(`/apps${getFailureQuery(shouldFail)}`)
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message ?? 'Mock GET /apps failed')
  return payload as AppSummary[]
}

export async function getGraph(appId: string, shouldFail: boolean): Promise<GraphResponse> {
  const response = await fetch(`/apps/${encodeURIComponent(appId)}/graph${getFailureQuery(shouldFail)}`)
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message ?? `Mock GET /apps/${appId}/graph failed`)
  return payload as GraphResponse
}

function getRuntimeLabel(service: ServiceNodeData['service']) {
  if (service === 'postgres') return 'Postgres 17'
  if (service === 'mongo') return 'MongoDB 8'
  if (service === 'redis') return 'Redis 8'
  if (service === 'queue') return 'BullMQ 6'
  return 'Node 22'
}
