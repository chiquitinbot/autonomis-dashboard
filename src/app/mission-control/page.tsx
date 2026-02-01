'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Zap,
  Plus,
  User,
  Tag,
  Loader2,
  X,
  MessageCircle,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Search,
  Telescope,
  Mail,
  PenTool,
  Cog,
  Bot,
  Send,
  FileText,
  Radio
} from "lucide-react"
import { supabase, type Ticket, type Comment, type Message } from "@/lib/supabase"

// Types
type Priority = "critical" | "high" | "medium" | "low"
type Status = "backlog" | "todo" | "in-progress" | "review" | "done"

// Agent data with unique colors and icons
const agents = [
  { 
    id: 'chiquitin', 
    name: 'Chiquitín', 
    role: 'Squad Lead', 
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    status: 'working',
    badge: 'LEAD',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    statusReason: 'Managing daily operations. Twitter engagement active. Coordinating team activities.',
    about: 'Squad Lead and personal AI assistant. Mexican crab on a mission. Coordinates the team, handles social media, and keeps Bernardo on track.',
    skills: ['coordination', 'twitter', 'automation', 'fitness', 'crypto'],
    since: '2 hours ago',
    tasksCount: 5
  },
  { 
    id: 'apollo', 
    name: 'Apollo', 
    role: 'Research Agent', 
    icon: Telescope,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-500',
    status: 'working',
    badge: 'SPC',
    badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    statusReason: 'Researching AI partnership opportunities. Analyzing Weights & Biases partner program.',
    about: 'Research Specialist. Finds and analyzes partnership opportunities for Nexaminds. Deep research and competitive analysis.',
    skills: ['research', 'partnerships', 'analysis', 'linkedin'],
    since: '4 hours ago',
    tasksCount: 3
  },
  { 
    id: 'classifier', 
    name: 'Classifier', 
    role: 'Email Processor', 
    icon: Mail,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    status: 'working',
    badge: 'INT',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    statusReason: 'Processing incoming emails. Last batch: 5 emails classified and labeled.',
    about: 'Email Intelligence Agent. Processes, categorizes, and labels incoming emails so Bernardo can focus on what matters.',
    skills: ['email', 'classification', 'gmail', 'labeling'],
    since: '15 min ago',
    tasksCount: 12
  },
  { 
    id: 'scribe', 
    name: 'Scribe', 
    role: 'Content Writer', 
    icon: PenTool,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    status: 'idle',
    badge: 'SPC',
    badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    statusReason: 'Awaiting content tasks. Ready for writing assignments.',
    about: 'Content Creator. Writes blog posts, documentation, and marketing copy. Currently on standby.',
    skills: ['writing', 'content', 'docs', 'copywriting'],
    since: '1 day ago',
    tasksCount: 0
  },
]

type Agent = typeof agents[number]

// Status columns config
const statusColumns: { id: Status; title: string; dotColor: string }[] = [
  { id: "backlog", title: "INBOX", dotColor: "bg-zinc-400" },
  { id: "todo", title: "ASSIGNED", dotColor: "bg-blue-400" },
  { id: "in-progress", title: "IN PROGRESS", dotColor: "bg-amber-400" },
  { id: "review", title: "REVIEW", dotColor: "bg-violet-400" },
  { id: "done", title: "DONE", dotColor: "bg-emerald-400" },
]

const priorityConfig: Record<Priority, { label: string; color: string; icon: typeof AlertTriangle }> = {
  critical: { label: "Critical", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle },
  high: { label: "High", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: AlertTriangle },
  medium: { label: "Medium", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Circle },
  low: { label: "Low", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", icon: Circle },
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
  const [agentMessage, setAgentMessage] = useState("")

  // New modal states
  const [showChat, setShowChat] = useState(false)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [showDocs, setShowDocs] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [chatMessage, setChatMessage] = useState("")
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [chatRecipient, setChatRecipient] = useState("Chiquitín")

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchData())
      .subscribe()

    return () => { supabase.removeChannel(ticketsChannel) }
  }, [])

  const fetchData = async () => {
    const { data: ticketsData } = await supabase.from('tickets').select('*').order('updated_at', { ascending: false })
    const { data: commentsData } = await supabase.from('comments').select('*').order('created_at', { ascending: true })
    const { data: messagesData } = await supabase.from('messages').select('*').order('created_at', { ascending: true })
    if (ticketsData) setTickets(ticketsData)
    if (commentsData) setComments(commentsData)
    if (messagesData) setMessages(messagesData)
    setLoading(false)
  }

  // Send chat message
  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return
    const { data } = await supabase.from('messages').insert([{
      sender: 'Bernardo',
      recipient: chatRecipient,
      content: chatMessage,
      message_type: 'chat'
    }]).select()
    if (data) setMessages([...messages, data[0]])
    setChatMessage("")
  }

  // Send broadcast
  const sendBroadcast = async () => {
    if (!broadcastMessage.trim()) return
    const { data } = await supabase.from('messages').insert([{
      sender: 'Bernardo',
      recipient: 'all',
      content: broadcastMessage,
      message_type: 'broadcast'
    }]).select()
    if (data) setMessages([...messages, data[0]])
    setBroadcastMessage("")
    setShowBroadcast(false)
  }

  useEffect(() => {
    if (selectedTicket) {
      setTicketComments(comments.filter(c => c.ticket_id === selectedTicket.id))
    }
  }, [selectedTicket, comments])

  const handleDragStart = (ticketId: string) => setDraggedTicket(ticketId)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  
  const handleDrop = async (status: Status) => {
    if (draggedTicket) {
      await supabase.from('tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', draggedTicket)
      setTickets(tickets.map(t => t.id === draggedTicket ? { ...t, status } : t))
      setDraggedTicket(null)
    }
  }

  const changeStatus = async (ticketId: string, newStatus: Status) => {
    await supabase.from('tickets').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', ticketId)
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
    if (selectedTicket?.id === ticketId) setSelectedTicket({ ...selectedTicket, status: newStatus })
  }

  const addComment = async () => {
    if (selectedTicket && newComment.trim()) {
      const comment = { ticket_id: selectedTicket.id, author: "Bernardo", content: newComment }
      const { data } = await supabase.from('comments').insert([comment]).select()
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
    const { data } = await supabase.from('tickets').insert([{
      id: ticketId, title: newTicket.title, description: newTicket.description,
      status: 'todo' as Status, priority: newTicket.priority, assignee: newTicket.assignee, labels: newTicket.labels,
    }]).select()
    if (data) setTickets([data[0], ...tickets])
    setShowNewTicket(false)
    setNewTicket({ title: "", description: "", priority: "medium", assignee: "Chiquitín", labels: [] })
  }

  const activeAgents = agents.filter(a => a.status === 'working').length
  const getAgentIcon = (assignee: string) => {
    const agent = agents.find(a => a.name === assignee)
    if (agent) {
      const Icon = agent.icon
      return <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
        <Icon className="w-3 h-3 text-white" />
      </div>
    }
    return <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-600 flex items-center justify-center">
      <User className="w-3 h-3 text-white" />
    </div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 animate-pulse" />
            <Loader2 className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
          </div>
          <span className="text-zinc-500 text-sm tracking-wider">LOADING MISSION CONTROL...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 antialiased">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-[#0a0a0b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Left - Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight">MISSION CONTROL</span>
            </div>
            <Badge variant="outline" className="border-zinc-800 text-zinc-500 bg-zinc-900/50 font-normal">
              Autonomis
            </Badge>
          </div>

          {/* Center - Stats */}
          <div className="flex items-center gap-12">
            <div className="text-center">
              <div className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                {activeAgents}
              </div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] mt-0.5">Agents Active</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                {tickets.length}
              </div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] mt-0.5">Tasks in Queue</div>
            </div>
          </div>

          {/* Right - Actions & Clock */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowChat(true)}
                variant="outline" 
                size="sm" 
                className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </Button>
              <Button 
                onClick={() => setShowBroadcast(true)}
                variant="outline" 
                size="sm" 
                className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 gap-2"
              >
                <Radio className="w-4 h-4" />
                Broadcast
              </Button>
              <Button 
                onClick={() => setShowDocs(true)}
                variant="outline" 
                size="sm" 
                className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 gap-2"
              >
                <FileText className="w-4 h-4" />
                Docs
              </Button>
            </div>
            
            <div className="border-l border-zinc-800 pl-6 text-right">
              <div className="text-xl font-mono font-medium tracking-tight text-white">
                {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-[0.15em]">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
              </div>
            </div>

            <div className="flex items-center gap-2 pl-4 border-l border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-xs font-medium text-emerald-400 tracking-wider">ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Agents */}
        <aside className="w-72 border-r border-zinc-800/50 bg-zinc-900/20 flex flex-col">
          <div className="p-5 border-b border-zinc-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em]">Agents</span>
              </div>
              <Badge className="bg-zinc-800/80 text-zinc-400 border-0 text-[10px] font-normal">{agents.length}</Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {/* All Agents */}
            <div 
              className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-all duration-200 cursor-pointer ${
                selectedAgent === null 
                  ? 'bg-zinc-800/60 ring-1 ring-zinc-700/50' 
                  : 'hover:bg-zinc-800/30'
              }`}
              onClick={() => setSelectedAgent(null)}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-zinc-200">All Agents</div>
                <div className="text-xs text-zinc-600">{agents.length} total</div>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px] font-normal">
                {activeAgents} ACTIVE
              </Badge>
            </div>

            <div className="space-y-1.5 mt-4">
              {agents.map((agent) => {
                const Icon = agent.icon
                return (
                  <div 
                    key={agent.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                      selectedAgent?.id === agent.id 
                        ? 'bg-zinc-800/60 ring-1 ring-amber-500/30' 
                        : 'hover:bg-zinc-800/30'
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-zinc-200">{agent.name}</span>
                        <Badge className={`${agent.badgeColor} text-[9px] px-1.5 py-0 font-normal`}>
                          {agent.badge}
                        </Badge>
                      </div>
                      <div className="text-xs text-zinc-600 truncate">{agent.role}</div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium ${
                      agent.status === 'working' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'working' ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                      {agent.status === 'working' ? 'WORKING' : 'IDLE'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content - Kanban Board */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em]">Mission Queue</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input 
                  placeholder="Search tasks..." 
                  className="w-64 bg-zinc-900/50 border-zinc-800 pl-9 text-sm placeholder:text-zinc-600 focus:ring-amber-500/20 focus:border-amber-500/50"
                />
              </div>
              <Button 
                onClick={() => setShowNewTicket(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto p-6">
            <div className="flex gap-4 min-w-max h-full">
              {statusColumns.map((column) => (
                <div
                  key={column.id}
                  className="w-72 flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.id)}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                      <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.1em]">{column.title}</span>
                    </div>
                    <Badge className="bg-zinc-800/80 text-zinc-500 border-0 text-[10px] font-normal min-w-[24px] justify-center">
                      {tickets.filter(t => t.status === column.id).length}
                    </Badge>
                  </div>

                  {/* Column Content */}
                  <div className="flex-1 space-y-3 rounded-xl bg-zinc-900/30 p-2 min-h-[400px]">
                    {tickets
                      .filter(t => t.status === column.id)
                      .map((ticket) => (
                        <div
                          key={ticket.id}
                          className="group bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-zinc-700/50 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5"
                          draggable
                          onDragStart={() => handleDragStart(ticket.id)}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-[10px] font-mono text-zinc-600">{ticket.id}</span>
                            <Badge className={`${priorityConfig[ticket.priority].color} text-[9px] font-normal`}>
                              {priorityConfig[ticket.priority].label}
                            </Badge>
                          </div>
                          
                          {/* Title */}
                          <h4 className="text-sm font-medium text-zinc-200 mb-2 line-clamp-2 leading-snug">
                            {ticket.title}
                          </h4>
                          
                          {/* Description preview */}
                          {ticket.description && (
                            <p className="text-xs text-zinc-600 mb-3 line-clamp-2">{ticket.description}</p>
                          )}
                          
                          {/* Tags */}
                          {ticket.labels && ticket.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {ticket.labels.slice(0, 3).map((label) => (
                                <span 
                                  key={label} 
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-500 border border-zinc-700/50"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                            <div className="flex items-center gap-1.5 text-zinc-600">
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="text-[10px]">{comments.filter(c => c.ticket_id === ticket.id).length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getAgentIcon(ticket.assignee || '')}
                              <span className="text-[10px] text-zinc-600">{ticket.assignee}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Agent Profile or Activity */}
        <aside className="w-80 border-l border-zinc-800/50 bg-zinc-900/20 flex flex-col">
          {selectedAgent ? (
            /* Agent Profile */
            <>
              <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em]">Agent Profile</span>
                </div>
                <button 
                  onClick={() => setSelectedAgent(null)}
                  className="w-6 h-6 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {/* Agent Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedAgent.color} flex items-center justify-center shadow-xl`}>
                    <selectedAgent.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{selectedAgent.name}</h2>
                    <p className="text-sm text-zinc-500">{selectedAgent.role}</p>
                    <Badge className={`${selectedAgent.badgeColor} mt-2 text-[10px] font-normal`}>
                      {selectedAgent.badge === 'LEAD' ? 'Lead' : selectedAgent.badge === 'INT' ? 'Internal' : 'Specialist'}
                    </Badge>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                  selectedAgent.status === 'working' 
                    ? 'bg-emerald-500/10 border border-emerald-500/20' 
                    : 'bg-zinc-800 border border-zinc-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${selectedAgent.status === 'working' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                  <span className={`text-sm font-medium ${selectedAgent.status === 'working' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {selectedAgent.status === 'working' ? 'WORKING' : 'IDLE'}
                  </span>
                </div>

                {/* Status Reason */}
                <div className="mb-6">
                  <div className="text-[10px] font-medium text-zinc-600 uppercase tracking-[0.15em] mb-2">Status Reason</div>
                  <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                    <p className="text-sm text-zinc-300 leading-relaxed">{selectedAgent.statusReason}</p>
                    <p className="text-[10px] text-zinc-600 mt-3 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Since {selectedAgent.since}
                    </p>
                  </div>
                </div>

                {/* About */}
                <div className="mb-6">
                  <div className="text-[10px] font-medium text-zinc-600 uppercase tracking-[0.15em] mb-2">About</div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{selectedAgent.about}</p>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <div className="text-[10px] font-medium text-zinc-600 uppercase tracking-[0.15em] mb-3">Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.skills.map((skill) => (
                      <span key={skill} className="text-xs px-3 py-1.5 rounded-full bg-zinc-800/60 text-zinc-400 border border-zinc-700/50">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4 mb-4 pb-3 border-b border-zinc-800/50">
                  <button className="flex items-center gap-1.5 text-amber-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Attention
                    <Badge className="bg-amber-500/20 text-amber-400 border-0 text-[9px] ml-1">2</Badge>
                  </button>
                  <button className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">Timeline</button>
                  <button className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">Messages</button>
                </div>
                <p className="text-[10px] text-zinc-600 mb-4">Tasks & mentions needing {selectedAgent.name}&apos;s attention</p>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-zinc-800/50">
                <div className="text-[10px] font-medium text-zinc-600 uppercase tracking-[0.15em] mb-2">
                  Send Message to {selectedAgent.name}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder={`Message ${selectedAgent.name}...`}
                    value={agentMessage}
                    onChange={(e) => setAgentMessage(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700/50 text-sm placeholder:text-zinc-600"
                  />
                  <Button size="icon" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0 shadow-lg shadow-amber-500/20">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Live Feed */
            <>
              <div className="p-5 border-b border-zinc-800/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em]">Live Feed</span>
                </div>
              </div>

              <div className="p-4 border-b border-zinc-800/50 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/20 text-[10px] cursor-pointer">All</Badge>
                  <Badge className="bg-zinc-800 text-zinc-500 border-zinc-700 text-[10px] cursor-pointer hover:bg-zinc-700">Tasks</Badge>
                  <Badge className="bg-zinc-800 text-zinc-500 border-zinc-700 text-[10px] cursor-pointer hover:bg-zinc-700">Comments</Badge>
                  <Badge className="bg-zinc-800 text-zinc-500 border-zinc-700 text-[10px] cursor-pointer hover:bg-zinc-700">Status</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-zinc-800 text-zinc-400 border-0 text-[10px]">All Agents</Badge>
                  {agents.slice(0, 3).map(agent => {
                    const Icon = agent.icon
                    return (
                      <Badge 
                        key={agent.id} 
                        className="bg-zinc-800/60 text-zinc-500 border-zinc-700/50 text-[10px] cursor-pointer hover:bg-zinc-700 gap-1"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <Icon className="w-3 h-3" /> {agent.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {comments.slice(-15).reverse().map((comment) => (
                    <div 
                      key={comment.id} 
                      className="p-3 rounded-xl bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-relaxed">
                            <span className="font-medium text-amber-400">{comment.author}</span>
                            <span className="text-zinc-500"> commented on </span>
                            <span className="text-zinc-300">&quot;{comment.ticket_id}&quot;</span>
                          </p>
                          <p className="text-xs text-zinc-600 mt-1.5 line-clamp-2">{comment.content}</p>
                          <p className="text-[10px] text-zinc-700 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* New Task Modal */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Create New Task</DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">Add a new task to the mission queue</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Title</label>
              <Input
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                placeholder="Task title..."
                className="mt-2 bg-zinc-800/50 border-zinc-700/50 focus:border-amber-500/50 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</label>
              <Textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Task description..."
                className="mt-2 bg-zinc-800/50 border-zinc-700/50 focus:border-amber-500/50 focus:ring-amber-500/20 min-h-[100px]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Priority</label>
              <div className="flex gap-2 mt-2">
                {(["critical", "high", "medium", "low"] as Priority[]).map((p) => (
                  <Button
                    key={p}
                    variant="outline"
                    size="sm"
                    onClick={() => setNewTicket({ ...newTicket, priority: p })}
                    className={`capitalize ${newTicket.priority === p 
                      ? `${priorityConfig[p].color} border-current` 
                      : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Assignee</label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {agents.map((agent) => {
                  const Icon = agent.icon
                  return (
                    <Button
                      key={agent.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewTicket({ ...newTicket, assignee: agent.name })}
                      className={`gap-2 ${newTicket.assignee === agent.name 
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                        : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {agent.name}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewTicket({ ...newTicket, assignee: "Bernardo" })}
                  className={`gap-2 ${newTicket.assignee === "Bernardo" 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}
                >
                  <User className="w-3.5 h-3.5" /> Bernardo
                </Button>
              </div>
            </div>
            <Button 
              onClick={createTicket} 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 border-0 mt-2"
            >
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-zinc-600 bg-zinc-800 px-2 py-1 rounded">{selectedTicket.id}</span>
                  <Badge className={priorityConfig[selectedTicket.priority].color}>
                    {priorityConfig[selectedTicket.priority].label}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-semibold text-white">{selectedTicket.title}</DialogTitle>
                {selectedTicket.description && (
                  <DialogDescription className="text-zinc-400 text-sm mt-2">{selectedTicket.description}</DialogDescription>
                )}
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</label>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {statusColumns.map((col) => (
                      <Button
                        key={col.id}
                        variant="outline"
                        size="sm"
                        onClick={() => changeStatus(selectedTicket.id, col.id)}
                        className={`gap-2 ${selectedTicket.status === col.id 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                          : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                        {col.title}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                  <div>
                    <label className="text-xs text-zinc-600 flex items-center gap-2 mb-1">
                      <User className="w-3.5 h-3.5" /> Assignee
                    </label>
                    <div className="flex items-center gap-2">
                      {getAgentIcon(selectedTicket.assignee || '')}
                      <span className="font-medium text-zinc-200">{selectedTicket.assignee}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-600 flex items-center gap-2 mb-1">
                      <Tag className="w-3.5 h-3.5" /> Labels
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {selectedTicket.labels?.map((label) => (
                        <span key={label} className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                          {label}
                        </span>
                      )) || <span className="text-zinc-600 text-sm">No labels</span>}
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Comments ({ticketComments.length})
                  </label>
                  <div className="space-y-3 mt-4 max-h-60 overflow-y-auto">
                    {ticketComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                        {getAgentIcon(comment.author || '')}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-zinc-200">{comment.author}</span>
                            <span className="text-[10px] text-zinc-600">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {ticketComments.length === 0 && (
                      <p className="text-sm text-zinc-600 text-center py-4">No comments yet</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addComment()}
                      className="bg-zinc-800/50 border-zinc-700/50 focus:border-amber-500/50 focus:ring-amber-500/20"
                    />
                    <Button 
                      onClick={addComment} 
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 border-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-amber-500" />
              Agent Chat
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">Send direct messages to your agents</DialogDescription>
          </DialogHeader>
          
          {/* Agent Selector */}
          <div className="flex gap-2 flex-wrap py-3 border-b border-zinc-800">
            {agents.map((agent) => {
              const Icon = agent.icon
              return (
                <Button
                  key={agent.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setChatRecipient(agent.name)}
                  className={`gap-2 ${chatRecipient === agent.name 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {agent.name}
                </Button>
              )
            })}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 py-4">
            {messages
              .filter(m => m.recipient === chatRecipient || m.sender === chatRecipient || m.recipient === 'all')
              .map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 ${msg.sender === 'Bernardo' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`max-w-[70%] p-3 rounded-xl ${
                    msg.sender === 'Bernardo' 
                      ? 'bg-amber-500/20 text-amber-100' 
                      : msg.message_type === 'broadcast'
                      ? 'bg-violet-500/20 text-violet-100'
                      : 'bg-zinc-800 text-zinc-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{msg.sender}</span>
                      {msg.message_type === 'broadcast' && (
                        <Badge className="bg-violet-500/30 text-violet-300 text-[9px]">BROADCAST</Badge>
                      )}
                    </div>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            {messages.filter(m => m.recipient === chatRecipient || m.sender === chatRecipient || m.recipient === 'all').length === 0 && (
              <div className="text-center py-12 text-zinc-600">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No messages with {chatRecipient} yet</p>
                <p className="text-xs mt-1">Start a conversation!</p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-3 border-t border-zinc-800">
            <Input
              placeholder={`Message ${chatRecipient}...`}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
              className="bg-zinc-800/50 border-zinc-700/50 focus:border-amber-500/50"
            />
            <Button 
              onClick={sendChatMessage}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Broadcast Modal */}
      <Dialog open={showBroadcast} onOpenChange={setShowBroadcast}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Radio className="w-5 h-5 text-violet-500" />
              Broadcast Message
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">Send a message to ALL agents simultaneously</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
              <span className="text-xs text-zinc-500 w-full mb-2">Recipients:</span>
              {agents.map((agent) => {
                const Icon = agent.icon
                return (
                  <Badge key={agent.id} className={`${agent.badgeColor} gap-1`}>
                    <Icon className="w-3 h-3" /> {agent.name}
                  </Badge>
                )
              })}
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Message</label>
              <Textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type your broadcast message..."
                className="mt-2 bg-zinc-800/50 border-zinc-700/50 focus:border-violet-500/50 min-h-[120px]"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowBroadcast(false)}
                className="flex-1 border-zinc-700 text-zinc-400"
              >
                Cancel
              </Button>
              <Button 
                onClick={sendBroadcast}
                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0"
              >
                <Radio className="w-4 h-4 mr-2" />
                Send Broadcast
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Docs Modal */}
      <Dialog open={showDocs} onOpenChange={setShowDocs}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              Documentation
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">Agent squad reference & system docs</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50 text-center">
                <div className="text-2xl font-bold text-white">{agents.length}</div>
                <div className="text-xs text-zinc-500">Total Agents</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50 text-center">
                <div className="text-2xl font-bold text-emerald-400">{agents.filter(a => a.status === 'working').length}</div>
                <div className="text-xs text-zinc-500">Active Now</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50 text-center">
                <div className="text-2xl font-bold text-amber-400">{tickets.length}</div>
                <div className="text-xs text-zinc-500">Total Tasks</div>
              </div>
            </div>

            {/* Agent Reference */}
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4" /> Agent Reference
              </h3>
              <div className="space-y-2">
                {agents.map((agent) => {
                  const Icon = agent.icon
                  return (
                    <div key={agent.id} className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-200">{agent.name}</span>
                            <Badge className={agent.badgeColor}>{agent.badge}</Badge>
                          </div>
                          <p className="text-xs text-zinc-500">{agent.role}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs ${agent.status === 'working' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {agent.status === 'working' ? '● Working' : '○ Idle'}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 mt-2">{agent.about}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {agent.skills.map((skill) => (
                          <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* System Info */}
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                <Cog className="w-4 h-4" /> System Info
              </h3>
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Platform</span>
                  <span className="text-zinc-300">Autonomis v1.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Database</span>
                  <span className="text-zinc-300">Supabase (Realtime)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Owner</span>
                  <span className="text-zinc-300">Bernardo Garza</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Status</span>
                  <span className="text-emerald-400">● Online</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
