import type { AppSummary, GraphResponse } from './api'
import { createServiceNode } from './api'

export const mockApps: AppSummary[] = [
  { id: 'commerce', name: 'supertokens-golang', environment: 'Production', health: 'Healthy', services: 3 },
  { id: 'ops', name: 'supertokens-java', environment: 'Staging', health: 'Warning', services: 3 },
  { id: 'analytics', name: 'supertokens-python', environment: 'Preview', health: 'Healthy', services: 3 },
]

export const mockGraphs: Record<string, GraphResponse> = {
  commerce: {
    nodes: [
      createServiceNode('api', 'Go API', 'gateway', 'Healthy', 22, { x: 120, y: 90 }),
      createServiceNode('postgres', 'Postgres', 'postgres', 'Healthy', 34, { x: 530, y: 70 }),
      createServiceNode('redis', 'Redis', 'redis', 'Degraded', 58, { x: 330, y: 310 }),
    ],
    edges: [
      { id: 'api-postgres', source: 'api', target: 'postgres', label: 'queries' },
      { id: 'api-redis', source: 'api', target: 'redis', animated: true, label: 'cache' },
    ],
  },
  ops: {
    nodes: [
      createServiceNode('console', 'Admin Console', 'gateway', 'Healthy', 30, { x: 80, y: 130 }),
      createServiceNode('worker', 'Jobs Worker', 'queue', 'Healthy', 45, { x: 420, y: 70 }),
      createServiceNode('audit', 'Audit DB', 'postgres', 'Down', 76, { x: 430, y: 300 }),
    ],
    edges: [
      { id: 'console-worker', source: 'console', target: 'worker', animated: true },
      { id: 'console-audit', source: 'console', target: 'audit' },
    ],
  },
  analytics: {
    nodes: [
      createServiceNode('collector', 'Collector', 'gateway', 'Healthy', 18, { x: 90, y: 130 }),
      createServiceNode('mongo', 'Mongodb', 'mongo', 'Degraded', 64, { x: 500, y: 80 }),
      createServiceNode('warehouse', 'Warehouse Sync', 'queue', 'Healthy', 39, { x: 470, y: 300 }),
    ],
    edges: [
      { id: 'collector-mongo', source: 'collector', target: 'mongo' },
      { id: 'mongo-warehouse', source: 'mongo', target: 'warehouse', animated: true },
    ],
  },
}
