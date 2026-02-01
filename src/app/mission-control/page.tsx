'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bot, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  Zap,
  Search,
  Mail,
  Twitter,
  TrendingUp,
  Dumbbell
} from "lucide-react"

// Agent data
const agents = [
  { 
    id: 'chiquitin', 
    name: 'Chiquitín', 
    role: 'Squad Lead', 
    emoji: '🦀',
    status: 'working',
    badge: 'LEAD',
    statusReason: 'Managing daily operations. Twitter engagement active. Monitoring all agent activities.',
    about: 'I am Chiquitín. Squad Lead and your personal AI assistant. A Mexican crab on a mission. I coordinate the team, handle social media, and make sure Bernardo stays on track with his goals. My mission: Help Bernardo achieve his half-marathon and 1 BTC goals.',
    skills: ['coordination', 'twitter', 'automation', 'fitness-tracking', 'crypto-alerts'],
    since: '2 hours ago'
  },
  { 
    id: 'apollo', 
    name: 'Apollo', 
    role: 'Research Agent', 
    emoji: '🔭',
    status: 'working',
    badge: 'SPC',
    statusReason: 'Researching AI partnership opportunities. Currently analyzing Weights & Biases partner program.',
    about: 'I am Apollo. Research Specialist. I find and analyze partnership opportunities for Nexaminds. I dig deep into partner programs, find key contacts, and prepare actionable intelligence.',
    skills: ['research', 'partnerships', 'web-search', 'competitive-analysis', 'linkedin'],
    since: '4 hours ago'
  },
  { 
    id: 'classifier', 
    name: 'Classifier', 
    role: 'Email Processor', 
    emoji: '📧',
    status: 'working',
    badge: 'INT',
    statusReason: 'Processing incoming emails. Last batch: 5 emails classified.',
    about: 'I am Classifier. Email Intelligence Agent. I process, categorize, and label incoming emails so Bernardo can focus on what matters. Every email gets the right label.',
    skills: ['email-processing', 'classification', 'gmail-api', 'labeling'],
    since: '15 min ago'
  },
  { 
    id: 'scribe', 
    name: 'Scribe', 
    role: 'Content Writer', 
    emoji: '✍️',
    status: 'idle',
    badge: 'SPC',
    statusReason: 'Awaiting content tasks.',
    about: 'I am Scribe. Content Creator. I write blog posts, documentation, and marketing copy. Currently on standby for content requests.',
    skills: ['writing', 'content', 'documentation', 'copywriting'],
    since: '1 day ago'
  },
]

// Task data with Kanban columns
const initialTasks = {
  inbox: [
    { id: 't1', title: 'Research Datadog Partnership', description: 'Find partner program details and contacts', tags: ['research', 'partnerships'], agent: 'apollo', time: '2 hours ago' },
    { id: 't2', title: 'Weekly Expense Report', description: 'Generate summary of January expenses', tags: ['finance', 'report'], agent: null, time: '1 day ago' },
  ],
  assigned: [
    { id: 't3', title: 'Email Classification Optimization', description: 'Improve accuracy of email categorization', tags: ['email', 'ml'], agent: 'classifier', time: '3 hours ago' },
    { id: 't4', title: 'Partnership Outreach - Arize AI', description: 'Draft initial contact email', tags: ['partnerships', 'outreach'], agent: 'apollo', time: '5 hours ago' },
  ],
  inProgress: [
    { id: 't5', title: 'Twitter Engagement Campaign', description: 'Daily crypto/AI community engagement', tags: ['social', 'twitter'], agent: 'chiquitin', time: '1 hour ago' },
    { id: 't6', title: 'Morning Briefing System', description: 'Automate daily briefing delivery', tags: ['automation'], agent: 'chiquitin', time: '2 hours ago' },
  ],
  review: [
    { id: 't7', title: 'Gym Reminder with Images', description: 'PPL workout system with AI-generated images', tags: ['fitness', 'automation'], agent: 'chiquitin', time: '30 min ago' },
  ],
  done: [
    { id: 't8', title: 'BTC Price Alerts Setup', description: 'Alert when BTC drops >5% or below $85K', tags: ['crypto', 'alerts'], agent: 'chiquitin', time: '1 day ago' },
  ],
}

// Activity feed data
const activityFeed = [
  { id: 'a1', type: 'task', agent: 'Chiquitín', action: 'completed', target: 'Gym Reminder with Images', time: '30 min ago' },
  { id: 'a2', type: 'comment', agent: 'Apollo', action: 'commented on', target: 'Partnership Research - W&B', time: '1 hour ago' },
  { id: 'a3', type: 'email', agent: 'Classifier', action: 'processed', target: '12 emails', time: '2 hours ago' },
  { id: 'a4', type: 'task', agent: 'Chiquitín', action: 'started', target: 'Twitter Engagement', time: '3 hours ago' },
  { id: 'a5', type: 'status', agent: 'Apollo', action: 'went', target: 'online', time: '4 hours ago' },
]

type Agent = typeof agents[number]

export default function MissionControlPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [tasks] = useState(initialTasks)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const totalTasks = Object.values(tasks).flat().length
  const activeAgents = agents.filter(a => a.status === 'working').length

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-amber-500" />
              <span className="text-xl font-bold">MISSION CONTROL</span>
            </div>
            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
              Autonomis
            </Badge>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{activeAgents}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Agents Active</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalTasks}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Tasks in Queue</div>
            </div>
            <div className="text-center border-l border-zinc-800 pl-8">
              <div className="text-2xl font-mono text-white">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-500 font-medium">ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Agents */}
        <aside className="w-64 border-r border-zinc-800 bg-zinc-900/30 min-h-[calc(100vh-73px)]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Agents</span>
              </div>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">{agents.length}</Badge>
            </div>

            {/* All Agents summary */}
            <div 
              className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors cursor-pointer ${
                selectedAgent === null ? 'bg-zinc-800' : 'bg-zinc-800/30 hover:bg-zinc-800/50'
              }`}
              onClick={() => setSelectedAgent(null)}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                <Bot className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-zinc-100">All Agents</div>
                <div className="text-xs text-zinc-500">{agents.length} total</div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                {activeAgents} ACTIVE
              </Badge>
            </div>

            <div className="space-y-2">
              {agents.map((agent) => (
                <div 
                  key={agent.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    selectedAgent?.id === agent.id ? 'bg-zinc-800 ring-1 ring-amber-500/50' : 'bg-zinc-800/50 hover:bg-zinc-800'
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="text-2xl">{agent.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-zinc-100">{agent.name}</span>
                      <Badge 
                        className={`text-[10px] px-1.5 py-0 ${
                          agent.badge === 'LEAD' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          agent.badge === 'INT' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        }`}
                      >
                        {agent.badge}
                      </Badge>
                    </div>
                    <div className="text-xs text-zinc-500 truncate">{agent.role}</div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${
                      agent.status === 'working' 
                        ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' 
                        : 'border-zinc-600 text-zinc-500'
                    }`}
                  >
                    {agent.status === 'working' ? 'WORKING' : 'IDLE'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content - Kanban Board */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Mission Queue</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="px-2 py-1 rounded bg-zinc-800">{Object.values(tasks).flat().filter(t => t.agent).length} active</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {/* Inbox Column */}
            <KanbanColumn 
              title="INBOX" 
              count={tasks.inbox.length} 
              tasks={tasks.inbox} 
              color="zinc"
            />
            {/* Assigned Column */}
            <KanbanColumn 
              title="ASSIGNED" 
              count={tasks.assigned.length} 
              tasks={tasks.assigned}
              color="blue"
            />
            {/* In Progress Column */}
            <KanbanColumn 
              title="IN PROGRESS" 
              count={tasks.inProgress.length} 
              tasks={tasks.inProgress}
              color="amber"
            />
            {/* Review Column */}
            <KanbanColumn 
              title="REVIEW" 
              count={tasks.review.length} 
              tasks={tasks.review}
              color="purple"
            />
            {/* Done Column */}
            <KanbanColumn 
              title="DONE" 
              count={tasks.done.length} 
              tasks={tasks.done}
              color="emerald"
            />
          </div>
        </main>

        {/* Right Sidebar - Agent Profile or Live Feed */}
        <aside className="w-80 border-l border-zinc-800 bg-zinc-900/30 min-h-[calc(100vh-73px)]">
          {selectedAgent ? (
            /* Agent Profile View */
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Agent Profile</span>
                </div>
                <button 
                  onClick={() => setSelectedAgent(null)}
                  className="text-zinc-500 hover:text-zinc-300 text-xl"
                >
                  ×
                </button>
              </div>

              {/* Agent Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">{selectedAgent.emoji}</div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">{selectedAgent.name}</h2>
                  <p className="text-sm text-zinc-400">{selectedAgent.role}</p>
                  <Badge 
                    className={`mt-2 ${
                      selectedAgent.badge === 'LEAD' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      selectedAgent.badge === 'INT' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    }`}
                  >
                    {selectedAgent.badge === 'LEAD' ? 'Lead' : selectedAgent.badge === 'INT' ? 'Internal' : 'Specialist'}
                  </Badge>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <Badge 
                  className={`px-4 py-2 text-sm ${
                    selectedAgent.status === 'working' 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : 'bg-zinc-700 text-zinc-400 border-zinc-600'
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full mr-2 ${selectedAgent.status === 'working' ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                  {selectedAgent.status === 'working' ? 'WORKING' : 'IDLE'}
                </Badge>
              </div>

              {/* Status Reason */}
              <div className="mb-6 p-3 rounded-lg bg-zinc-800/50">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status Reason:</p>
                <p className="text-sm text-zinc-300">{selectedAgent.statusReason}</p>
                <p className="text-xs text-zinc-600 mt-2">Since {selectedAgent.since}</p>
              </div>

              {/* About */}
              <div className="mb-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">About</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{selectedAgent.about}</p>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-4 border-b border-zinc-800 pb-2">
                <button className="text-amber-400 text-sm flex items-center gap-1">
                  <span className="text-amber-500">⚠</span> Attention
                  <Badge className="bg-amber-500/20 text-amber-400 text-[10px] ml-1">2</Badge>
                </button>
                <button className="text-zinc-500 text-sm hover:text-zinc-300">Timeline</button>
                <button className="text-zinc-500 text-sm hover:text-zinc-300">Messages</button>
              </div>

              <p className="text-xs text-zinc-600">Tasks & mentions needing {selectedAgent.name}&apos;s attention</p>

              {/* Message Input */}
              <div className="mt-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Send Message to {selectedAgent.name}</p>
                <input 
                  type="text"
                  placeholder={`Message ${selectedAgent.name}... (@ to mention)`}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>
            </div>
          ) : (
            /* Live Feed View */
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Live Feed</span>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 cursor-pointer">All</Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-500 cursor-pointer hover:bg-zinc-800">Tasks</Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-500 cursor-pointer hover:bg-zinc-800">Comments</Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-500 cursor-pointer hover:bg-zinc-800">Status</Badge>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 cursor-pointer">All Agents</Badge>
                {agents.slice(0, 3).map(agent => (
                  <Badge 
                    key={agent.id} 
                    variant="outline" 
                    className="border-zinc-700 text-zinc-500 cursor-pointer hover:bg-zinc-800"
                    onClick={() => setSelectedAgent(agent)}
                  >
                    {agent.emoji} {agent.name.split(' ')[0]}
                  </Badge>
                ))}
              </div>

              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-3">
                  {activityFeed.map((activity) => (
                    <div key={activity.id} className="p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-zinc-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium text-amber-400">{activity.agent}</span>
                            {' '}
                            <span className="text-zinc-400">{activity.action}</span>
                            {' '}
                            <span className="text-zinc-200">&quot;{activity.target}&quot;</span>
                          </p>
                          <p className="text-xs text-zinc-600 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

// Kanban Column Component
function KanbanColumn({ 
  title, 
  count, 
  tasks, 
  color 
}: { 
  title: string
  count: number
  tasks: Array<{
    id: string
    title: string
    description: string
    tags: string[]
    agent: string | null
    time: string
  }>
  color: 'zinc' | 'blue' | 'amber' | 'purple' | 'emerald'
}) {
  const colorClasses = {
    zinc: 'bg-zinc-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
  }

  const agentEmojis: Record<string, string> = {
    chiquitin: '🦀',
    apollo: '🔭',
    classifier: '📧',
    scribe: '✍️',
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${colorClasses[color]}`} />
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</span>
        </div>
        <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-xs">{count}</Badge>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            className="bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600 transition-colors cursor-pointer"
          >
            <div className="p-3">
              <h4 className="text-sm font-medium text-zinc-100 mb-1">{task.title}</h4>
              <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{task.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {task.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-[10px] px-1.5 py-0 border-zinc-700 text-zinc-500"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                {task.agent && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{agentEmojis[task.agent]}</span>
                    <span className="text-xs text-zinc-500 capitalize">{task.agent}</span>
                  </div>
                )}
                <span className="text-[10px] text-zinc-600">{task.time}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
