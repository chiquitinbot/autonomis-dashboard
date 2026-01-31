"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, MessageSquare, Calendar, User, Tag, MoreHorizontal, Search, Filter } from "lucide-react"

type Priority = "critical" | "high" | "medium" | "low"
type Status = "backlog" | "todo" | "in-progress" | "review" | "done"

interface Comment {
  id: string
  author: string
  content: string
  createdAt: Date
}

interface Ticket {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  assignee: string
  labels: string[]
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

const initialTickets: Ticket[] = [
  {
    id: "AUT-001",
    title: "Review JEALT proposal",
    description: "Review and provide feedback on the JEALT partnership proposal document",
    status: "in-progress",
    priority: "critical",
    assignee: "Bernardo",
    labels: ["partnership", "urgent"],
    comments: [
      { id: "c1", author: "Chiquitín", content: "I've reviewed the initial sections. Looks promising!", createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "AUT-002",
    title: "IBM Partnership call preparation",
    description: "Prepare talking points and materials for the IBM partnership call",
    status: "todo",
    priority: "high",
    assignee: "Bernardo",
    labels: ["partnership", "IBM"],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "AUT-003",
    title: "Update COE documentation",
    description: "Update the Center of Excellence documentation with latest processes",
    status: "backlog",
    priority: "medium",
    assignee: "Bernardo",
    labels: ["documentation", "COE"],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "AUT-004",
    title: "Polymarket strategy research",
    description: "Research prediction market strategies for potential opportunities",
    status: "in-progress",
    priority: "medium",
    assignee: "Chiquitín",
    labels: ["trading", "research"],
    comments: [
      { id: "c2", author: "Chiquitín", content: "Starting research on prediction markets...", createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "AUT-005",
    title: "Set up email automation",
    description: "Configure automated email responses and categorization",
    status: "review",
    priority: "low",
    assignee: "Chiquitín",
    labels: ["automation"],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "AUT-006",
    title: "CLANKER position monitoring",
    description: "Monitor CLANKER token position and market conditions",
    status: "done",
    priority: "high",
    assignee: "Chiquitín",
    labels: ["trading", "crypto"],
    comments: [
      { id: "c3", author: "Chiquitín", content: "Position opened at $45, currently monitoring.", createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

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
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newComment, setNewComment] = useState("")
  const [draggedTicket, setDraggedTicket] = useState<string | null>(null)

  const handleDragStart = (ticketId: string) => {
    setDraggedTicket(ticketId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: Status) => {
    if (draggedTicket) {
      setTickets(tickets.map(t => 
        t.id === draggedTicket ? { ...t, status, updatedAt: new Date() } : t
      ))
      setDraggedTicket(null)
    }
  }

  const changeStatus = (ticketId: string, newStatus: Status) => {
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date() } : t
    ))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus })
    }
  }

  const addComment = () => {
    if (selectedTicket && newComment.trim()) {
      const comment: Comment = {
        id: `c${Date.now()}`,
        author: "Bernardo",
        content: newComment,
        createdAt: new Date(),
      }
      const updatedTicket = {
        ...selectedTicket,
        comments: [...selectedTicket.comments, comment],
        updatedAt: new Date(),
      }
      setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t))
      setSelectedTicket(updatedTicket)
      setNewComment("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your tickets and track progress</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-9 w-64" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button>
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
            {/* Column Header */}
            <div className="flex items-center gap-2 px-2">
              <div className={`h-2 w-2 rounded-full ${column.color}`} />
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <Badge variant="secondary" className="ml-auto">
                {tickets.filter(t => t.status === column.id).length}
              </Badge>
            </div>

            {/* Column Content */}
            <div className="space-y-2 min-h-[500px] rounded-lg bg-muted/30 p-2">
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
                        {ticket.labels.slice(0, 2).map((label) => (
                          <Badge key={label} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          {ticket.comments.length}
                        </div>
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-medium">
                          {ticket.assignee.charAt(0)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

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
                {/* Status Selector */}
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

                {/* Meta Info */}
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
                    <div className="flex gap-1">
                      {selectedTicket.labels.map((label) => (
                        <Badge key={label} variant="outline">{label}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments ({selectedTicket.comments.length})
                  </label>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {selectedTicket.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                          {comment.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {comment.createdAt.toLocaleDateString()}
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
