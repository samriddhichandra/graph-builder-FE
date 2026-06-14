import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type ReactFlowInstance,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Activity,
  ArrowRight,
  Bell,
  Boxes,
  Cpu,
  ChevronDown,
  Cloud,
  Code2,
  Database,
  GitBranch,
  LayoutDashboard,
  Menu,
  MousePointer2,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Moon,
  Sparkles,
  Sun,
  Workflow,
  X,
} from 'lucide-react'
import { create } from 'zustand'
import { Button } from './components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { cn } from './lib/utils'
import { createServiceNode, getApps, getGraph, type GraphNode, type ServiceNodeData, type ServiceStatus } from './mocks/api'
import heroImage from './assets/hero.png'
import './App.css'

type BuilderState = {
  selectedAppId: string
  selectedNodeId: string | null
  isMobilePanelOpen: boolean
  activeInspectorTab: string
  shouldFailRequests: boolean
  theme: 'dark' | 'light'
  hasOpenedBuilder: boolean
  setSelectedApp: (id: string) => void
  setSelectedNode: (id: string | null) => void
  setMobilePanelOpen: (open: boolean) => void
  setActiveInspectorTab: (tab: string) => void
  setRequestFailure: (shouldFail: boolean) => void
  openBuilder: () => void
  toggleRequestFailure: () => void
  toggleTheme: () => void
}

const useBuilderStore = create<BuilderState>((set) => ({
  selectedAppId: 'commerce',
  selectedNodeId: null,
  isMobilePanelOpen: false,
  activeInspectorTab: 'config',
  shouldFailRequests: false,
  theme: 'dark',
  hasOpenedBuilder: false,
  setSelectedApp: (id) => set({ selectedAppId: id, selectedNodeId: null }),
  setSelectedNode: (id) => set({ selectedNodeId: id, isMobilePanelOpen: true }),
  setMobilePanelOpen: (open) => set({ isMobilePanelOpen: open }),
  setActiveInspectorTab: (tab) => set({ activeInspectorTab: tab }),
  setRequestFailure: (shouldFail) => set({ shouldFailRequests: shouldFail }),
  openBuilder: () => set({ hasOpenedBuilder: true }),
  toggleRequestFailure: () => set((state) => ({ shouldFailRequests: !state.shouldFailRequests })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}))

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'graph', icon: GitBranch },
  { id: 'cloud', icon: Cloud },
  { id: 'security', icon: ShieldCheck },
  { id: 'settings', icon: Settings },
]


function ServiceNode({ data, selected }: NodeProps<GraphNode>) {
  const Icon = data.service === 'postgres' || data.service === 'mongo' ? Database : data.service === 'queue' ? Workflow : data.service === 'redis' ? Boxes : Server

  return (
    <div className={cn('service-node', `service-node-${data.service}`, selected && 'service-node-selected')}>
      <Handle type="target" position={Position.Left} />
      <div className="service-node-icon">
        <Icon size={18} />
      </div>
      <div className="service-node-copy">
        <strong>{data.label}</strong>
        <span>{data.runtime}</span>
      </div>
      <StatusBadge status={data.status} />
      <div className="service-node-meter" aria-hidden="true">
        <span style={{ width: `${data.cpu}%` }} />
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const nodeTypes = { service: ServiceNode }

function App() {
  const hasOpenedBuilder = useBuilderStore((state) => state.hasOpenedBuilder)
  const selectedAppId = useBuilderStore((state) => state.selectedAppId)
  const selectedNodeId = useBuilderStore((state) => state.selectedNodeId)
  const isMobilePanelOpen = useBuilderStore((state) => state.isMobilePanelOpen)
  const activeInspectorTab = useBuilderStore((state) => state.activeInspectorTab)
  const shouldFailRequests = useBuilderStore((state) => state.shouldFailRequests)
  const theme = useBuilderStore((state) => state.theme)
  const setSelectedApp = useBuilderStore((state) => state.setSelectedApp)
  const setSelectedNode = useBuilderStore((state) => state.setSelectedNode)
  const setMobilePanelOpen = useBuilderStore((state) => state.setMobilePanelOpen)
  const setActiveInspectorTab = useBuilderStore((state) => state.setActiveInspectorTab)
  const setRequestFailure = useBuilderStore((state) => state.setRequestFailure)
  const openBuilder = useBuilderStore((state) => state.openBuilder)
  const toggleRequestFailure = useBuilderStore((state) => state.toggleRequestFailure)
  const toggleTheme = useBuilderStore((state) => state.toggleTheme)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'All'>('All')
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<GraphNode, Edge> | null>(null)
  const [isOpeningBuilder, setIsOpeningBuilder] = useState(false)

  const appsQuery = useQuery({ queryKey: ['apps', shouldFailRequests], queryFn: () => getApps(shouldFailRequests), retry: false })
  const graphQuery = useQuery({ queryKey: ['graph', selectedAppId, shouldFailRequests], queryFn: () => getGraph(selectedAppId, shouldFailRequests), retry: false })

  const [nodes, setNodes, onNodesChange] = useNodesState<GraphNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    if (!graphQuery.data) return
    setNodes(graphQuery.data.nodes)
    setEdges(graphQuery.data.edges)
    setSelectedNode(graphQuery.data.nodes[0]?.id ?? null)
    setMobilePanelOpen(false)
  }, [graphQuery.data, setEdges, setMobilePanelOpen, setNodes, setSelectedNode])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isEditing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)

      if (isEditing) return

      if (event.key.toLowerCase() === 'f') {
        flowInstance?.fitView({ padding: 0.2, duration: 250 })
      }

      if (event.key.toLowerCase() === 'p') {
        setMobilePanelOpen(!isMobilePanelOpen)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [flowInstance, isMobilePanelOpen, setMobilePanelOpen])

  useEffect(() => {
    if (!isOpeningBuilder) return undefined

    const timer = window.setTimeout(() => {
      openBuilder()
      setIsOpeningBuilder(false)
    }, 850)

    return () => window.clearTimeout(timer)
  }, [isOpeningBuilder, openBuilder])

  const selectedApp = appsQuery.data?.find((app) => app.id === selectedAppId)
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId])
  const isLoading = appsQuery.isLoading || graphQuery.isLoading
  const error = appsQuery.error ?? graphQuery.error
  const healthyCount = nodes.filter((node) => node.data.status === 'Healthy').length
  const averageCpu = nodes.length > 0 ? Math.round(nodes.reduce((total, node) => total + node.data.cpu, 0) / nodes.length) : 0
  const visibleNodes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return nodes.filter((node) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        node.data.label.toLowerCase().includes(normalizedSearch) ||
        node.data.runtime.toLowerCase().includes(normalizedSearch) ||
        node.data.description.toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'All' || node.data.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [nodes, searchTerm, statusFilter])
  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes])
  const visibleEdges = useMemo(
    () => edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)),
    [edges, visibleNodeIds],
  )

  const updateSelectedNodeData = (patch: Partial<ServiceNodeData>) => {
    if (!selectedNodeId) return
    setNodes((currentNodes) =>
      currentNodes.map((node) => (node.id === selectedNodeId ? { ...node, data: { ...node.data, ...patch } } : node)),
    )
  }

  const onConnect = (connection: Connection) => setEdges((currentEdges) => addEdge({ ...connection, animated: true }, currentEdges))
  const onNodesDelete = () => {
    setSelectedNode(null)
  }

  const addService = () => {
    const serviceNumber = nodes.length + 1
    const id = `service-${Date.now()}`
    const newNode: GraphNode = createServiceNode(
      id,
      `New Service ${serviceNumber}`,
      'gateway',
      'Healthy',
      20,
      { x: 160 + serviceNumber * 36, y: 180 + serviceNumber * 24 },
    )

    setNodes((currentNodes) => [...currentNodes, newNode])
    setSelectedNode(id)
  }
  const retryRequests = () => {
    setRequestFailure(false)
  }
  const startBuilderTransition = () => {
    setIsOpeningBuilder(true)
  }

  if (!hasOpenedBuilder) {
    if (isOpeningBuilder) {
      return <WorkspaceLoader theme={theme} />
    }

    return <LandingPage onOpenBuilder={startBuilderTransition} theme={theme} toggleTheme={toggleTheme} />
  }

  return (
    <main className="builder-shell" data-theme={theme}>
      <aside className="left-rail" aria-label="Primary navigation">
        <div className="brand-mark"><Boxes size={22} /></div>
        {navItems.map((item) => (
          <button className={cn('rail-button', item.id === 'graph' && 'rail-button-active')} key={item.id} type="button">
            <item.icon size={19} />
          </button>
        ))}
      </aside>

      <section className="workbench">
        <header className="top-bar">
          <div className="workspace-title">
            <p className="eyebrow">App Graph Builder</p>
            <h1>{selectedApp?.name ?? 'Loading workspace'}</h1>
            <div className="workspace-meta" aria-label="Workspace summary">
              <span>{selectedApp?.environment ?? 'Loading'}</span>
              <span>{nodes.length} services</span>
              <span>{healthyCount} healthy</span>
            </div>
          </div>
          <div className="top-actions">
            <label className="search-box">
              <Search size={16} />
              <input aria-label="Search graph" placeholder="Search services" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            </label>
            <Button variant={shouldFailRequests ? 'default' : 'secondary'} onClick={toggleRequestFailure}>Test error</Button>
            <Button variant="secondary" size="icon" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </Button>
            <Button variant="secondary" size="icon" aria-label="Notifications"><Bell size={17} /></Button>
            <Button className="mobile-panel-button" variant="secondary" onClick={() => setMobilePanelOpen(true)}><Menu size={17} /> Panel</Button>
            <Button onClick={addService}><Plus size={17} /> Add service</Button>
          </div>
        </header>

        <div className="content-grid">
          <section className="canvas-panel" aria-label="Application graph canvas">
            <div className="canvas-toolbar">
              <div className="canvas-chip">
                <span className="status-dot" />
                {selectedApp?.environment ?? 'Loading'}
              </div>
              <label className="filter-control">
                <SlidersHorizontal size={15} />
                <select aria-label="Filter services by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ServiceStatus | 'All')}>
                  <option value="All">All statuses</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Degraded">Degraded</option>
                  <option value="Down">Down</option>
                </select>
              </label>
            </div>
            <div className="canvas-metrics" aria-label="Graph health metrics">
              <div>
                <span>Services</span>
                <strong>{nodes.length}</strong>
              </div>
              <div>
                <span>Avg CPU</span>
                <strong>{averageCpu}%</strong>
              </div>
              <div>
                <span>Edges</span>
                <strong>{edges.length}</strong>
              </div>
            </div>
            {isLoading && <div className="state-panel">Loading mock graph...</div>}
            {error && (
              <div className="state-panel state-panel-error">
                <span>{error.message}</span>
                <Button variant="secondary" size="sm" onClick={retryRequests}><RefreshCw size={14} /> Retry</Button>
              </div>
            )}
            {!error && !isLoading && visibleNodes.length === 0 && <div className="state-panel">No services match the current search or filter.</div>}
            {!error && (
              <ReactFlow
                nodes={visibleNodes}
                edges={visibleEdges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setFlowInstance}
                onNodeClick={(_, node) => setSelectedNode(node.id)}
                onPaneClick={() => setSelectedNode(null)}
                onNodesDelete={onNodesDelete}
                deleteKeyCode={['Delete', 'Backspace']}
                fitView
                proOptions={{ hideAttribution: true }}
              >
                <MiniMap pannable zoomable nodeStrokeWidth={3} />
                <Controls />
              </ReactFlow>
            )}
          </section>

          <div className={cn('panel-backdrop', isMobilePanelOpen && 'panel-backdrop-open')} onClick={() => setMobilePanelOpen(false)} />
          <aside className={cn('app-panel', isMobilePanelOpen && 'app-panel-open')} aria-label="Application and node details">
            <Button className="panel-close" variant="secondary" size="icon" aria-label="Close panel" onClick={() => setMobilePanelOpen(false)}><X size={17} /></Button>
            <div className="app-switcher">
              <div>
                <p className="eyebrow">Selected App</p>
                <strong>{selectedApp?.name ?? 'Fetching apps'}</strong>
              </div>
              <ChevronDown size={18} />
            </div>

            <div className="app-list">
              {appsQuery.isLoading && <p>Loading apps...</p>}
              {appsQuery.error && <p className="error-text">{appsQuery.error.message}</p>}
              {appsQuery.data?.map((app) => (
                <button className={cn('app-list-item', app.id === selectedAppId && 'app-list-item-active')} key={app.id} type="button" onClick={() => setSelectedApp(app.id)}>
                  <span>{app.name}</span>
                  <small>{app.services} services - {app.health}</small>
                </button>
              ))}
            </div>

            <section className="inspector">
              {!selectedNode ? (
                <div className="empty-inspector">Select a node to view and edit its settings.</div>
              ) : (
                <>
                  <div className="inspector-heading">
                    <div className="service-node-icon"><Code2 size={18} /></div>
                    <div>
                      <p className="eyebrow">Service Node</p>
                      <h2>{selectedNode.data.label}</h2>
                    </div>
                    <StatusBadge status={selectedNode.data.status} />
                  </div>
                  <div className="inspector-stats">
                    <ControlRow icon={<Cpu size={15} />} label="CPU" value={`${selectedNode.data.cpu}%`} />
                    <ControlRow icon={<MousePointer2 size={15} />} label="Status" value={selectedNode.data.status} />
                  </div>
                  <Tabs value={activeInspectorTab} onValueChange={setActiveInspectorTab}>
                    <TabsList>
                      <TabsTrigger value="config">Config</TabsTrigger>
                      <TabsTrigger value="runtime">Runtime</TabsTrigger>
                    </TabsList>
                    <TabsContent value="config">
                      <label className="field-label">
                        Node name
                        <input value={selectedNode.data.label} onChange={(event) => updateSelectedNodeData({ label: event.target.value })} />
                      </label>
                      <label className="field-label">
                        Description
                        <textarea value={selectedNode.data.description} onChange={(event) => updateSelectedNodeData({ description: event.target.value })} />
                      </label>
                    </TabsContent>
                    <TabsContent value="runtime">
                      <ControlRow label="Runtime" value={selectedNode.data.runtime} />
                      <label className="field-label">
                        CPU target
                        <div className="slider-row">
                          <input
                            aria-label="CPU slider"
                            max={100}
                            min={0}
                            type="range"
                            value={selectedNode.data.cpu}
                            onChange={(event) => updateSelectedNodeData({ cpu: Number(event.target.value) })}
                          />
                          <input
                            aria-label="CPU number"
                            max={100}
                            min={0}
                            type="number"
                            value={selectedNode.data.cpu}
                            onChange={(event) => updateSelectedNodeData({ cpu: clampCpu(event.target.value) })}
                          />
                        </div>
                      </label>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  )
}

function WorkspaceLoader({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <main className="workspace-loader" data-theme={theme} aria-live="polite" aria-busy="true">
      <div className="workspace-loader-card">
        <div className="workspace-loader-mark">
          <Boxes size={24} />
        </div>
        <div className="workspace-loader-copy">
          <p>Opening workspace</p>
          <span>Preparing graph canvas and mock app data...</span>
        </div>
        <div className="workspace-loader-progress" aria-hidden="true">
          <span />
        </div>
        <div className="workspace-loader-steps" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="workspace-loader-spinner" aria-hidden="true" />
      </div>
    </main>
  )
}

function LandingPage({ onOpenBuilder, theme, toggleTheme }: { onOpenBuilder: () => void; theme: 'dark' | 'light'; toggleTheme: () => void }) {
  return (
    <main className="landing-shell" data-theme={theme}>
      <header className="landing-nav">
        <div className="landing-brand">
          <span><Boxes size={20} /></span>
          <strong>App Graph Builder</strong>
        </div>
        <div className="landing-nav-actions">
          <button className="landing-icon-button" type="button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          
        </div>
      </header>

      <section className="landing-hero">
        <img className="landing-hero-media" src={heroImage} alt="" aria-hidden="true" />
        <div className="landing-copy">
          <p className="landing-kicker"><Sparkles size={15} /></p>
          <h1>Build and inspect a small service graph.</h1>
          <p className="landing-lede">
            React Flow canvas, mock app data, node editing, query states, and a responsive inspector panel.
          </p>
          <div className="landing-actions">
            <button className="landing-primary-button" type="button" onClick={onOpenBuilder}>
              Open workspace
              <ArrowRight size={18} />
            </button>
            <span className="landing-live-chip"><Activity size={15} /> Mock data ready</span>
          </div>
        </div>

        <div className="landing-preview" aria-hidden="true">
          <div className="preview-topline">
            <span />
            <strong>supertokens-golang</strong>
            <small>Production</small>
          </div>
          <div className="preview-canvas">
            <div className="preview-node preview-node-api">
              <Server size={16} />
              <span>Go API</span>
              <i>Healthy</i>
            </div>
            <div className="preview-link preview-link-one" />
            <div className="preview-link preview-link-two" />
            <div className="preview-node preview-node-db">
              <Database size={16} />
              <span>Postgres</span>
              <i>Healthy</i>
            </div>
            <div className="preview-node preview-node-cache">
              <Boxes size={16} />
              <span>Redis</span>
              <i>Degraded</i>
            </div>
          </div>
          <div className="preview-bottom">
            <span>3 services</span>
            <span>2 edges</span>
            <span>editable nodes</span>
          </div>
        </div>
      </section>
    </main>
  )
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  return <span className={cn('node-status', status === 'Degraded' && 'node-status-warning', status === 'Down' && 'node-status-error')}>{status}</span>
}

function ControlRow({ icon, label, value }: { icon?: ReactNode; label: string; value?: string }) {
  return (
    <div className="control-row">
      <span>{icon}{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function clampCpu(value: string) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0
  return Math.min(100, Math.max(0, parsed))
}

export default App
