'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Bot, 
  MessageSquare,
  Zap,
  Plus,
  User,
  Tag,
  Loader2,
  X
} from "lucide-react"
import { supabase, type Ticket, type Comment } from "@/lib/supabase"

// Types
type Priority = "critical" | "high" | "medium" | "low"
type Status = "backlog" | "todo" | "in-progress" | "review" | "done"

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
    about: 'I am Chiquitín. Squad Lead and your personal AI assistant. A Mexican crab on a mission. I coordinate the team, handle social media, and make sure Bernardo stays on track with his goals.',
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
    about: 'I am Apollo. Research Specialist. I find and analyze partnership opportunities for Nexaminds.',
    skills: ['research', 'partnerships', 'web-search', 'competitive-analysis'],
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
    about: 'I am Classifier. Email Intelligence Agent. I process, categorize, and label incoming emails.',
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
    about: 'I am Scribe. Content Creator. I write blog posts, documentation, and marketing copy.',
    skills: ['writing', 'content', 'documentation', 'copywriting'],
    since: '1 day ago'
  },
]

type Agent = typeof agents[number]

// Status columns config
const statusColumns: { id: Status; title: string; color: string }[] = [
  { id: "backlog", title: "INBOX", color: "bg-zinc-500" },
  { id: "todo", title: "ASSIGNED", color: "bg-blue-500" },
  { id: "in-progress", title: "IN PROGRESS", color: "bg-amber-500" },
  { id: "review", title: "REVIEW", color: "bg-purple-500" },
  { id: "done", title: "DONE", color: "bg-emerald-500" },
]

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-500 text-white" },
  high: { label: "High", color: "bg-orange-500 text-white" },
  medium: { label: "Medium", color: "bg-amber-500 text-black" },
  low: { label: "Low", color: "bg-zinc-600 text-white" },
}

export default function MissionControlPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [ticketComments, setTicketComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [draggedTicket, setDraggedTicket] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    assignee: "Chiquitín",
    labels: [] as string[],
  })

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch data from Supabase
  useEffect(() => {
    fetchData()
    
    const ticketsChannel = supabase
      .channel('tickets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ticketsChannel)
    }
  }, [])

  const fetchData = async () => {
    const { data: ticketsData } = await supabase
      .from('tickets')
      .select('*')
      .order('updated_at', { ascending: false })
    
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (ticketsData) setTickets(ticketsData)
    if (commentsData) setComments(commentsData)
    setLoading(false)
  }

  // Update ticket comments when selected ticket changes
  useEffect(() => {
    if (selectedTicket) {
      setTicketComments(comments.filter(c => c.ticket_id === selectedTicket.id))
    }
  }, [selectedTicket, comments])

  // Drag and drop handlers
  const handleDragStart = (ticketId: string) => {
    setDraggedTicket(ticketId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (status: Status) => {
    if (draggedTicket) {
      await supabase
        .from('tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', draggedTicket)
      
      setTickets(tickets.map(t => 
        t.id === draggedTicket ? { ...t, status } : t
      ))
      setDraggedTicket(null)
    }
  }

  const changeStatus = async (ticketId: string, newStatus: Status) => {
    await supabase
      .from('tickets')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', ticketId)
    
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, status: newStatus } : t
    ))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus })
    }
  }

  const addComment = async () => {
    if (selectedTicket && newComment.trim()) {
      const comment = {
        ticket_id: selectedTicket.id,
        author: "Bernardo",
        content: newComment,
      }
      
      const { data } = await supabase
        .from('comments')
        .insert([comment])
        .select()
      
      if (data) {
        setComments([...comments, data[0]])
        setTicketComments([...ticketComments, data[0]])
      }
      
      setNewComment("")
    }
  }

  const createTicket = async () => {
    if (!newTicket.title.trim()) return
    
    const ticketId = `TASK-${String(tickets.length + 1).padStart(3, '0')}`
    
    const { data } = await supabase
      .from('tickets')
      .insert([{
        id: ticketId,
        title: newTicket.title,
        description: newTicket.description,
        status: 'todo' as Status,
        priority: newTicket.priority,
        assignee: newTicket.assignee,
        labels: newTicket.labels,
      }])
      .select()
    
    if (data) {
      setTickets([data[0], ...tickets])
    }
    
    setShowNewTicket(false)
    setNewTicket({
      title: "",
      description: "",
      priority: "medium",
      assignee: "Chiquitín",
      labels: [],
    })
  }

  const activeAgents = agents.filter(a => a.status === 'working').length

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

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
              <div className="text-3xl font-bold text-white">{tickets.length}</div>
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
        <main className="flex-1 p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Mission Queue</span>
            </div>
            <Button 
              onClick={() => setShowNewTicket(true)}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-4 min-w-[1000px]">
            {statusColumns.map((column) => (
              <div
                key={column.id}
                className="space-y-3"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${column.color}`} />
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{column.title}</span>
                  </div>
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-xs">
                    {tickets.filter(t => t.status === column.id).length}
                  </Badge>
                </div>

                <div className="space-y-2 min-h-[400px] rounded-lg bg-zinc-900/50 p-2">
                  {tickets
                    .filter(t => t.status === column.id)
                    .map((ticket) => (
                      <Card
                        key={ticket.id}
                        className="bg-zinc-800/50 border-zinc-700/50 hover:border-amber-500/50 transition-all cursor-pointer"
                        draggable
                        onDragStart={() => handleDragStart(ticket.id)}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-[10px] text-zinc-500 font-mono">{ticket.id}</span>
                            <Badge className={`${priorityConfig[ticket.priority].color} text-[10px]`}>
                              {priorityConfig[ticket.priority].label}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-medium text-zinc-100 mb-2 line-clamp-2">{ticket.title}</h4>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {ticket.labels?.slice(0, 2).map((label) => (
                              <Badge 
                                key={label} 
                                variant="outline" 
                                className="text-[10px] px-1.5 py-0 border-zinc-700 text-zinc-500"
                              >
                                {label}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-700/50">
                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                              <MessageSquare className="h-3 w-3" />
                              {comments.filter(c => c.ticket_id === ticket.id).length}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm">
                                {ticket.assignee === "Chiquitín" ? "🦀" : 
                                 ticket.assignee === "Apollo" ? "🔭" :
                                 ticket.assignee === "Classifier" ? "📧" :
                                 ticket.assignee === "Scribe" ? "✍️" : "👤"}
                              </span>
                              <span className="text-[10px] text-zinc-600">{ticket.assignee}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar - Agent Profile or Activity */}
        <aside className="w-80 border-l border-zinc-800 bg-zinc-900/30 min-h-[calc(100vh-73px)]">
          {selectedAgent ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Agent Profile</span>
                </div>
                <button 
                  onClick={() => setSelectedAgent(null)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

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

              <div className="mb-6 p-3 rounded-lg bg-zinc-800/50">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status Reason:</p>
                <p className="text-sm text-zinc-300">{selectedAgent.statusReason}</p>
                <p className="text-xs text-zinc-600 mt-2">Since {selectedAgent.since}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">About</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{selectedAgent.about}</p>
              </div>

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
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Recent Activity</span>
              </div>

              <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="space-y-3">
                  {comments.slice(-10).reverse().map((comment) => (
                    <div key={comment.id} className="p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-zinc-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium text-amber-400">{comment.author}</span>
                            {' '}
                            <span className="text-zinc-400">commented on</span>
                            {' '}
                            <span className="text-zinc-200">{comment.ticket_id}</span>
                          </p>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{comment.content}</p>
                          <p className="text-[10px] text-zinc-600 mt-1">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
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

      {/* New Task Modal */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription className="text-zinc-400">Add a new task to the mission queue</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-300">Title</label>
              <Input
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                placeholder="Task title..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300">Description</label>
              <Textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Task description..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300">Priority</label>
              <div className="flex gap-2 mt-1">
                {(["critical", "high", "medium", "low"] as Priority[]).map((p) => (
                  <Button
                    key={p}
                    variant={newTicket.priority === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewTicket({ ...newTicket, priority: p })}
                    className={newTicket.priority === p ? priorityConfig[p].color : "border-zinc-700 text-zinc-400"}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300">Assignee</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {agents.map((agent) => (
                  <Button
                    key={agent.id}
                    variant={newTicket.assignee === agent.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewTicket({ ...newTicket, assignee: agent.name })}
                    className={newTicket.assignee === agent.name ? "bg-amber-500 text-black" : "border-zinc-700 text-zinc-400"}
                  >
                    {agent.emoji} {agent.name}
                  </Button>
                ))}
                <Button
                  variant={newTicket.assignee === "Bernardo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewTicket({ ...newTicket, assignee: "Bernardo" })}
                  className={newTicket.assignee === "Bernardo" ? "bg-amber-500 text-black" : "border-zinc-700 text-zinc-400"}
                >
                  👤 Bernardo
                </Button>
              </div>
            </div>
            <Button onClick={createTicket} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500 font-mono">{selectedTicket.id}</span>
                  <Badge className={priorityConfig[selectedTicket.priority].color}>
                    {priorityConfig[selectedTicket.priority].label}
                  </Badge>
                </div>
                <DialogTitle className="text-xl text-zinc-100">{selectedTicket.title}</DialogTitle>
                <DialogDescription className="text-zinc-400">{selectedTicket.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {statusColumns.map((col) => (
                      <Button
                        key={col.id}
                        variant={selectedTicket.status === col.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => changeStatus(selectedTicket.id, col.id)}
                        className={selectedTicket.status === col.id ? "bg-amber-500 text-black" : "border-zinc-700 text-zinc-400"}
                      >
                        <div className={`h-2 w-2 rounded-full ${col.color} mr-2`} />
                        {col.title}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-zinc-500 flex items-center gap-2">
                      <User className="h-4 w-4" /> Assignee
                    </label>
                    <p className="font-medium text-zinc-200">{selectedTicket.assignee}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-zinc-500 flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Labels
                    </label>
                    <div className="flex gap-1 flex-wrap">
                      {selectedTicket.labels?.map((label) => (
                        <Badge key={label} variant="outline" className="border-zinc-700 text-zinc-400">{label}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments ({ticketComments.length})
                  </label>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {ticketComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-zinc-800/50">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                          {comment.author === "Chiquitín" ? "🦀" : comment.author?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-zinc-200">{comment.author}</span>
                            <span className="text-xs text-zinc-600">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1 text-zinc-400">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addComment()}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    />
                    <Button onClick={addComment} className="bg-amber-500 hover:bg-amber-600 text-black">Send</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
