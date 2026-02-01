'use client'

import { useState, useEffect, useRef } from 'react'
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
  Circle,
  Search,
  Telescope,
  Mail,
  PenTool,
  Cog,
  Bot,
  Send,
  FileText,
  Radio,
  Menu,
  Users,
  LayoutGrid,
  Activity,
  ChevronLeft,
  ChevronRight
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
const statusColumns: { id: Status; title: string; shortTitle: string; dotColor: string }[] = [
  { id: "backlog", title: "INBOX", shortTitle: "INBOX", dotColor: "bg-zinc-400" },
  { id: "todo", title: "ASSIGNED", shortTitle: "TODO", dotColor: "bg-blue-400" },
  { id: "in-progress", title: "IN PROGRESS", shortTitle: "DOING", dotColor: "bg-amber-400" },
  { id: "review", title: "REVIEW", shortTitle: "REVIEW", dotColor: "bg-violet-400" },
  { id: "done", title: "DONE", shortTitle: "DONE", dotColor: "bg-emerald-400" },
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

  // Mobile states
  const [showAgentsSidebar, setShowAgentsSidebar] = useState(false)
  const [showActivitySidebar, setShowActivitySidebar] = useState(false)
  const [mobileColumnIndex, setMobileColumnIndex] = useState(0)
  const kanbanRef = useRef<HTMLDivElement>(null)

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

  // Mobile column navigation
  const scrollToColumn = (index: number) => {
    setMobileColumnIndex(index)
    if (kanbanRef.current) {
      const columnWidth = kanbanRef.current.scrollWidth / statusColumns.length
      kanbanRef.current.scrollTo({ left: columnWidth * index, behavior: 'smooth' })
    }
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
          <span className="text-zinc-500 text-sm tracking-wider">LOADING...</span>
        </div>
      </div>
    )
  }

  // Agent Sidebar Content (reusable for desktop and mobile)
  const AgentSidebarContent = () => (
    <div className="p-4 lg:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em]">Agents</span>
        </div>
        <Badge className="bg-zinc-800/80 text-zinc-400 border-0 text-[10px] font-normal">{agents.length}</Badge>
      </div>

      {/* All Agents */}
      <div 
        className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-all duration-200 cursor-pointer ${
          selectedAgent === null 
            ? 'bg-zinc-800/60 ring-1 ring-zinc-700/50' 
            : 'hover:bg-zinc-800/30'
        }`}
        onClick={() => { setSelectedAgent(null); setShowAgentsSidebar(false) }}
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
              onClick={() => { setSelectedAgent(agent); setShowAgentsSidebar(false) }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-zinc-200">{agent.name}</span>
                  <Badge className={`${agent.badgeColor} text-[9px] px-1.5 py-0 font-normal hidden sm:inline-flex`}>
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
                <span className="hidden sm:inline">{agent.status === 'working' ? 'WORKING' : 'IDLE'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // Activity Sidebar Content
  const ActivitySidebarContent = () => (
    <div className="p-4 lg:p-5">
      {selectedAgent ? (
        /* Agent Profile */
        <>
          <div className="flex items-center justify-between mb-6">
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

          {/* Agent Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${selectedAgent.color} flex items-center justify-center shadow-xl`}>
              <selectedAgent.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-white">{selectedAgent.name}</h2>
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
            <div className="p-3 lg:p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
              <p className="text-sm text-zinc-300 leading-relaxed">{selectedAgent.statusReason}</p>
              <p className="text-[10px] text-zinc-600 mt-3 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Since {selectedAgent.since}
              </p>
            </div>
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

          {/* Message Input */}
          <div className="pt-4 border-t border-zinc-800/50">
            <div className="text-[10px] font-medium text-zinc-600 uppercase tracking-[0.15em] mb-2">
              Send Message
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder={`Message ${selectedAgent.name}...`}
                value={agentMessage}
                onChange={(e) => setAgentMessage(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700/50 text-sm placeholder:text-zinc-600"
              />
              <Button size="icon" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0 shadow-lg shadow-amber-500/20 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* Live Feed */
        <>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em]">Live Feed</span>
          </div>

          <div className="space-y-2 max-h-[60vh] lg:max-h-none overflow-y-auto">
            {comments.slice(-10).reverse().map((comment) => (
              <div 
                key={comment.id} 
                className="p-3 rounded-xl bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">
                      <span className="font-medium text-amber-400">{comment.author}</span>
                      <span className="text-zinc-500"> on </span>
                      <span className="text-zinc-300">{comment.ticket_id}</span>
                    </p>
                    <p className="text-xs text-zinc-600 mt-1 line-clamp-2">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 antialiased">
      {/* Header - Responsive */}
      <header className="border-b border-zinc-800/50 bg-[#0a0a0b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-3 lg:px-6 h-14 lg:h-16">
          {/* Left - Logo & Menu */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Mobile Menu Button */}
            <Sheet open={showAgentsSidebar} onOpenChange={setShowAgentsSidebar}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-zinc-400">
                  <Users className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-zinc-900 border-zinc-800 p-0">
                <SheetHeader className="p-4 border-b border-zinc-800">
                  <SheetTitle className="text-zinc-100">Agents</SheetTitle>
                </SheetHeader>
                <AgentSidebarContent />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Zap className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
              </div>
              <span className="text-base lg:text-lg font-semibold tracking-tight hidden sm:inline">MISSION CONTROL</span>
              <span className="text-base font-semibold tracking-tight sm:hidden">MC</span>
            </div>
          </div>

          {/* Center - Stats (Desktop) */}
          <div className="hidden md:flex items-center gap-8 lg:gap-12">
            <div className="text-center">
              <div className="text-2xl lg:text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                {activeAgents}
              </div>
              <div className="text-[9px] lg:text-[10px] text-zinc-600 uppercase tracking-[0.2em]">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                {tickets.length}
              </div>
              <div className="text-[9px] lg:text-[10px] text-zinc-600 uppercase tracking-[0.2em]">Tasks</div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="flex md:hidden items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{activeAgents}</div>
              <div className="text-[8px] text-zinc-600 uppercase">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{tickets.length}</div>
              <div className="text-[8px] text-zinc-600 uppercase">Tasks</div>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-2">
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

            {/* Clock - Desktop only */}
            <div className="hidden xl:block border-l border-zinc-800 pl-4 text-right">
              <div className="text-lg font-mono font-medium text-white">
                {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-wider">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-1.5 pl-2 lg:pl-4 lg:border-l border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-xs font-medium text-emerald-400 tracking-wider hidden sm:inline">ONLINE</span>
            </div>

            {/* Mobile Activity Button */}
            <Sheet open={showActivitySidebar} onOpenChange={setShowActivitySidebar}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-zinc-400">
                  <Activity className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-zinc-900 border-zinc-800 p-0">
                <SheetHeader className="p-4 border-b border-zinc-800">
                  <SheetTitle className="text-zinc-100">
                    {selectedAgent ? 'Agent Profile' : 'Activity'}
                  </SheetTitle>
                </SheetHeader>
                <ActivitySidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)] lg:h-[calc(100vh-64px)]">
        {/* Left Sidebar - Desktop only */}
        <aside className="hidden lg:flex w-72 border-r border-zinc-800/50 bg-zinc-900/20 flex-col overflow-y-auto">
          <AgentSidebarContent />
        </aside>

        {/* Main Content - Kanban Board */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 lg:px-6 py-3 lg:py-4 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.1em] lg:tracking-[0.15em]">Tasks</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Search - Desktop */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input 
                  placeholder="Search..." 
                  className="w-48 lg:w-64 bg-zinc-900/50 border-zinc-800 pl-9 text-sm placeholder:text-zinc-600 focus:ring-amber-500/20 focus:border-amber-500/50"
                />
              </div>
              <Button 
                onClick={() => setShowNewTicket(true)}
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 border-0"
              >
                <Plus className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">New Task</span>
              </Button>
            </div>
          </div>

          {/* Mobile Column Selector */}
          <div className="flex lg:hidden items-center justify-between px-3 py-2 border-b border-zinc-800/30 bg-zinc-900/30">
            <button 
              onClick={() => scrollToColumn(Math.max(0, mobileColumnIndex - 1))}
              className="p-2 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
              disabled={mobileColumnIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {statusColumns.map((col, idx) => (
                <button
                  key={col.id}
                  onClick={() => scrollToColumn(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                    mobileColumnIndex === idx 
                      ? 'bg-zinc-800 text-zinc-200' 
                      : 'text-zinc-600'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
                  <span className="hidden sm:inline">{col.shortTitle}</span>
                  <span className="text-[10px] text-zinc-500">
                    {tickets.filter(t => t.status === col.id).length}
                  </span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => scrollToColumn(Math.min(statusColumns.length - 1, mobileColumnIndex + 1))}
              className="p-2 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
              disabled={mobileColumnIndex === statusColumns.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Kanban Board */}
          <div 
            ref={kanbanRef}
            className="flex-1 overflow-x-auto overflow-y-auto p-3 lg:p-6 snap-x snap-mandatory lg:snap-none"
          >
            <div className="flex gap-3 lg:gap-4 min-w-max lg:min-w-0 h-full">
              {statusColumns.map((column, idx) => (
                <div
                  key={column.id}
                  className="w-[85vw] sm:w-[70vw] lg:w-72 flex-shrink-0 lg:flex-shrink flex flex-col snap-center"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.id)}
                >
                  {/* Column Header - Desktop */}
                  <div className="hidden lg:flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                      <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.1em]">{column.title}</span>
                    </div>
                    <Badge className="bg-zinc-800/80 text-zinc-500 border-0 text-[10px] font-normal min-w-[24px] justify-center">
                      {tickets.filter(t => t.status === column.id).length}
                    </Badge>
                  </div>

                  {/* Column Content */}
                  <div className="flex-1 space-y-2 lg:space-y-3 rounded-xl bg-zinc-900/30 p-2 lg:p-3 min-h-[300px] lg:min-h-[400px]">
                    {tickets
                      .filter(t => t.status === column.id)
                      .map((ticket) => (
                        <div
                          key={ticket.id}
                          className="group bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-zinc-700/50 rounded-xl p-3 lg:p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]"
                          draggable
                          onDragStart={() => handleDragStart(ticket.id)}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-[10px] font-mono text-zinc-600">{ticket.id}</span>
                            <Badge className={`${priorityConfig[ticket.priority].color} text-[9px] font-normal`}>
                              {priorityConfig[ticket.priority].label}
                            </Badge>
                          </div>
                          
                          {/* Title */}
                          <h4 className="text-sm font-medium text-zinc-200 mb-2 line-clamp-2 leading-snug">
                            {ticket.title}
                          </h4>
                          
                          {/* Tags - Show fewer on mobile */}
                          {ticket.labels && ticket.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {ticket.labels.slice(0, 2).map((label) => (
                                <span 
                                  key={label} 
                                  className="text-[9px] lg:text-[10px] px-1.5 lg:px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-500 border border-zinc-700/50"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                            <div className="flex items-center gap-1.5 text-zinc-600">
                              <MessageCircle className="w-3 h-3" />
                              <span className="text-[10px]">{comments.filter(c => c.ticket_id === ticket.id).length}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {getAgentIcon(ticket.assignee || '')}
                              <span className="text-[10px] text-zinc-600 hidden sm:inline">{ticket.assignee}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {tickets.filter(t => t.status === column.id).length === 0 && (
                      <div className="flex flex-col items-center justify-center h-32 text-zinc-700">
                        <LayoutGrid className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs">No tasks</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Desktop only */}
        <aside className="hidden lg:flex w-80 border-l border-zinc-800/50 bg-zinc-900/20 flex-col overflow-y-auto">
          <ActivitySidebarContent />
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800/50 px-4 py-2 safe-area-pb">
        <div className="flex items-center justify-around">
          <button 
            onClick={() => setShowChat(true)}
            className="flex flex-col items-center gap-1 p-2 text-zinc-500 hover:text-amber-400 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px]">Chat</span>
          </button>
          <button 
            onClick={() => setShowBroadcast(true)}
            className="flex flex-col items-center gap-1 p-2 text-zinc-500 hover:text-violet-400 transition-colors"
          >
            <Radio className="w-5 h-5" />
            <span className="text-[10px]">Broadcast</span>
          </button>
          <button 
            onClick={() => setShowNewTicket(true)}
            className="flex flex-col items-center gap-1 p-2 -mt-4"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </button>
          <button 
            onClick={() => setShowDocs(true)}
            className="flex flex-col items-center gap-1 p-2 text-zinc-500 hover:text-emerald-400 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px]">Docs</span>
          </button>
          <button 
            onClick={() => setShowAgentsSidebar(true)}
            className="flex flex-col items-center gap-1 p-2 text-zinc-500 hover:text-blue-400 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Agents</span>
          </button>
        </div>
      </div>

      {/* New Task Modal */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-[95vw] lg:max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Create New Task</DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">Add a new task to the queue</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
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
                className="mt-2 bg-zinc-800/50 border-zinc-700/50 focus:border-amber-500/50 focus:ring-amber-500/20 min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Priority</label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(["critical", "high", "medium", "low"] as Priority[]).map((p) => (
                  <Button
                    key={p}
                    variant="outline"
                    size="sm"
                    onClick={() => setNewTicket({ ...newTicket, priority: p })}
                    className={`capitalize text-xs ${newTicket.priority === p 
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
                      className={`gap-1.5 text-xs ${newTicket.assignee === agent.name 
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                        : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <Icon className="w-3 h-3" /> <span className="hidden sm:inline">{agent.name}</span>
                    </Button>
                  )
                })}
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
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-[95vw] lg:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-zinc-600 bg-zinc-800 px-2 py-1 rounded">{selectedTicket.id}</span>
                  <Badge className={priorityConfig[selectedTicket.priority].color}>
                    {priorityConfig[selectedTicket.priority].label}
                  </Badge>
                </div>
                <DialogTitle className="text-lg lg:text-xl font-semibold text-white">{selectedTicket.title}</DialogTitle>
                {selectedTicket.description && (
                  <DialogDescription className="text-zinc-400 text-sm">{selectedTicket.description}</DialogDescription>
                )}
              </DialogHeader>

              <div className="space-y-5 mt-4">
                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {statusColumns.map((col) => (
                      <Button
                        key={col.id}
                        variant="outline"
                        size="sm"
                        onClick={() => changeStatus(selectedTicket.id, col.id)}
                        className={`gap-1.5 text-xs ${selectedTicket.status === col.id 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                          : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
                        {col.shortTitle}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                  <div>
                    <label className="text-[10px] text-zinc-600 flex items-center gap-1 mb-1">
                      <User className="w-3 h-3" /> Assignee
                    </label>
                    <div className="flex items-center gap-2">
                      {getAgentIcon(selectedTicket.assignee || '')}
                      <span className="text-sm text-zinc-200">{selectedTicket.assignee}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-600 flex items-center gap-1 mb-1">
                      <Tag className="w-3 h-3" /> Labels
                    </label>
                    <div className="flex gap-1 flex-wrap">
                      {selectedTicket.labels?.map((label) => (
                        <span key={label} className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                          {label}
                        </span>
                      )) || <span className="text-zinc-600 text-xs">None</span>}
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Comments ({ticketComments.length})
                  </label>
                  <div className="space-y-2 mt-3 max-h-48 overflow-y-auto">
                    {ticketComments.map((comment) => (
                      <div key={comment.id} className="flex gap-2 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                        {getAgentIcon(comment.author || '')}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-zinc-200">{comment.author}</span>
                            <span className="text-[10px] text-zinc-600">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400 mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {ticketComments.length === 0 && (
                      <p className="text-sm text-zinc-600 text-center py-4">No comments</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Add comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addComment()}
                      className="bg-zinc-800/50 border-zinc-700/50 focus:border-amber-500/50"
                    />
                    <Button 
                      onClick={addComment} 
                      size="icon"
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shrink-0"
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
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-[95vw] lg:max-w-2xl h-[80vh] lg:h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-amber-500" />
              Agent Chat
            </DialogTitle>
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
                  className={`gap-1.5 text-xs ${chatRecipient === agent.name 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Icon className="w-3 h-3" /> {agent.name}
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
                  <div className={`max-w-[80%] p-3 rounded-xl ${
                    msg.sender === 'Bernardo' 
                      ? 'bg-amber-500/20 text-amber-100' 
                      : msg.message_type === 'broadcast'
                      ? 'bg-violet-500/20 text-violet-100'
                      : 'bg-zinc-800 text-zinc-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{msg.sender}</span>
                      {msg.message_type === 'broadcast' && (
                        <Badge className="bg-violet-500/30 text-violet-300 text-[9px]">ALL</Badge>
                      )}
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            {messages.filter(m => m.recipient === chatRecipient || m.sender === chatRecipient || m.recipient === 'all').length === 0 && (
              <div className="text-center py-12 text-zinc-600">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
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
              size="icon"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Broadcast Modal */}
      <Dialog open={showBroadcast} onOpenChange={setShowBroadcast}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-[95vw] lg:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Radio className="w-5 h-5 text-violet-500" />
              Broadcast
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">Send to ALL agents</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
              {agents.map((agent) => {
                const Icon = agent.icon
                return (
                  <Badge key={agent.id} className={`${agent.badgeColor} gap-1`}>
                    <Icon className="w-3 h-3" /> {agent.name}
                  </Badge>
                )
              })}
            </div>

            <Textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Your message..."
              className="bg-zinc-800/50 border-zinc-700/50 focus:border-violet-500/50 min-h-[100px]"
            />

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
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Docs Modal */}
      <Dialog open={showDocs} onOpenChange={setShowDocs}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-[95vw] lg:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              Documentation
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 mt-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 text-center">
                <div className="text-xl font-bold text-white">{agents.length}</div>
                <div className="text-[10px] text-zinc-500">Agents</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 text-center">
                <div className="text-xl font-bold text-emerald-400">{activeAgents}</div>
                <div className="text-[10px] text-zinc-500">Active</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 text-center">
                <div className="text-xl font-bold text-amber-400">{tickets.length}</div>
                <div className="text-[10px] text-zinc-500">Tasks</div>
              </div>
            </div>

            {/* Agent List */}
            <div>
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4" /> Agents
              </h3>
              <div className="space-y-2">
                {agents.map((agent) => {
                  const Icon = agent.icon
                  return (
                    <div key={agent.id} className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-zinc-200">{agent.name}</span>
                            <Badge className={`${agent.badgeColor} text-[9px]`}>{agent.badge}</Badge>
                          </div>
                          <p className="text-xs text-zinc-500">{agent.role}</p>
                        </div>
                        <span className={`text-xs ${agent.status === 'working' ? 'text-emerald-400' : 'text-zinc-600'}`}>
                          {agent.status === 'working' ? '● Active' : '○ Idle'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* System */}
            <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Cog className="w-4 h-4" /> System
              </h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Platform</span><span className="text-zinc-300">Autonomis v1.0</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Database</span><span className="text-zinc-300">Supabase</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Status</span><span className="text-emerald-400">● Online</span></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
