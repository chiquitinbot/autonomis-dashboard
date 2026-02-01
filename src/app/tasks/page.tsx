"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, MessageSquare, Search, Filter, User, Tag, Loader2 } from "lucide-react"
import { supabase, type Ticket, type Comment } from "@/lib/supabase"

type Priority = "critical" | "high" | "medium" | "low"
type Status = "backlog" | "todo" | "in-progress" | "review" | "done"

const statusColumns: { id: Status; title: string; color: string }[] = [
  { id: "backlog", title: "Backlog", color: "bg-slate-500" },
  { id: "todo", title: "To Do", color: "bg-blue-500" },
  { id: "in-progress", title: "In Progress", color: "bg-yellow-500" },
  { id: "review", title: "Review", color: "bg-purple-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
]

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-500 text-white" },
  high: { label: "High", color: "bg-orange-500 text-white" },
  medium: { label: "Medium", color: "bg-yellow-500 text-black" },
  low: { label: "Low", color: "bg-slate-500 text-white" },
}

export default function TasksPage() {
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
    assignee: "Bernardo",
    labels: [] as string[],
  })

  // Fetch tickets and comments
  useEffect(() => {
    fetchData()
    
    // Subscribe to realtime changes
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
    
    const ticketId = `MONEY-${String(tickets.length + 1).padStart(3, '0')}`
    
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
      assignee: "Bernardo",
      labels: [],
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">📋 Tasks</h1>
          <p className="text-muted-foreground">Track and manage your work</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-9 w-64" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowNewTicket(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-4">
        {statusColumns.map((column) => (
          <div
            key={column.id}
            className="space-y-3"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex items-center gap-2 px-2">
              <div className={`h-2 w-2 rounded-full ${column.color}`} />
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <Badge variant="secondary" className="ml-auto">
                {tickets.filter(t => t.status === column.id).length}
              </Badge>
            </div>

            <div className="space-y-2 min-h-[400px] rounded-lg bg-muted/30 p-2">
              {tickets
                .filter(t => t.status === column.id)
                .map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="cursor-pointer hover:border-primary/50 transition-all"
                    draggable
                    onDragStart={() => handleDragStart(ticket.id)}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-muted-foreground font-mono">{ticket.id}</span>
                        <Badge className={priorityConfig[ticket.priority].color} variant="secondary">
                          {priorityConfig[ticket.priority].label}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm line-clamp-2">{ticket.title}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {ticket.labels?.slice(0, 2).map((label) => (
                          <Badge key={label} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          {comments.filter(c => c.ticket_id === ticket.id).length}
                        </div>
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-[10px] text-white font-medium">
                          {ticket.assignee === "Chiquitín" ? "🦀" : ticket.assignee?.charAt(0) || "?"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Ticket Modal */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to track</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                placeholder="Task title..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Task description..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <div className="flex gap-2 mt-1">
                {(["critical", "high", "medium", "low"] as Priority[]).map((p) => (
                  <Button
                    key={p}
                    variant={newTicket.priority === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewTicket({ ...newTicket, priority: p })}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Assignee</label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={newTicket.assignee === "Bernardo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewTicket({ ...newTicket, assignee: "Bernardo" })}
                >
                  Bernardo
                </Button>
                <Button
                  variant={newTicket.assignee === "Chiquitín" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewTicket({ ...newTicket, assignee: "Chiquitín" })}
                >
                  🦀 Chiquitín
                </Button>
              </div>
            </div>
            <Button onClick={createTicket} className="w-full">
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-mono">{selectedTicket.id}</span>
                  <Badge className={priorityConfig[selectedTicket.priority].color}>
                    {priorityConfig[selectedTicket.priority].label}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{selectedTicket.title}</DialogTitle>
                <DialogDescription>{selectedTicket.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {statusColumns.map((col) => (
                      <Button
                        key={col.id}
                        variant={selectedTicket.status === col.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => changeStatus(selectedTicket.id, col.id)}
                      >
                        <div className={`h-2 w-2 rounded-full ${col.color} mr-2`} />
                        {col.title}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" /> Assignee
                    </label>
                    <p className="font-medium">{selectedTicket.assignee}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Labels
                    </label>
                    <div className="flex gap-1 flex-wrap">
                      {selectedTicket.labels?.map((label) => (
                        <Badge key={label} variant="outline">{label}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments ({ticketComments.length})
                  </label>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {ticketComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                          {comment.author === "Chiquitín" ? "🦀" : comment.author?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
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
                    />
                    <Button onClick={addComment}>Send</Button>
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
