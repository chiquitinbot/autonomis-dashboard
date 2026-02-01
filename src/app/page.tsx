import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Calendar, CheckSquare, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { BitcoinTracker } from "@/components/widgets/bitcoin-tracker"
import { FitnessTracker } from "@/components/widgets/fitness-tracker"
import { ExpensesTracker } from "@/components/widgets/expenses-tracker"
import { PartnershipPipeline } from "@/components/widgets/partnership-pipeline"

// Mock data - replace with real data from Supabase
const mockWorkouts = [
  { date: '2026-02-01', type: null, distance_km: 0 },
  { date: '2026-02-02', type: null, distance_km: 0 },
  { date: '2026-02-03', type: null, distance_km: 0 },
  { date: '2026-02-04', type: null, distance_km: 0 },
  { date: '2026-02-05', type: null, distance_km: 0 },
  { date: '2026-02-06', type: null, distance_km: 0 },
  { date: '2026-02-07', type: null, distance_km: 0 },
] as const

const mockExpenseCategories = [
  { name: 'Comida', amount: 1818, icon: '🍽️', color: 'purple' },
  { name: 'Entretenimiento', amount: 650, icon: '🎉', color: 'pink' },
]

const mockPartners = [
  { id: '1', name: 'HashiCorp', category: 'infrastructure', status: 'active' as const, priority: 'high' as const },
  { id: '2', name: 'IBM', category: 'enterprise', status: 'active' as const, priority: 'high' as const, nextStep: 'Follow up with Jason Simons' },
  { id: '3', name: 'Arize AI', category: 'observability', status: 'prospect' as const, priority: 'high' as const, nextStep: 'Find partnership contact on LinkedIn' },
  { id: '4', name: 'Weights & Biases', category: 'mlops', status: 'prospect' as const, priority: 'high' as const, nextStep: 'Research partner program' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Bernardo. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Quick Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Emails"
          value="5"
          description="Unread messages"
          icon={Mail}
          trend={{ value: 2, direction: "down" }}
        />
        <MetricCard
          title="Tasks"
          value="12"
          description="Pending items"
          icon={CheckSquare}
          trend={{ value: 3, direction: "down" }}
        />
        <MetricCard
          title="Meetings"
          value="3"
          description="Today"
          icon={Calendar}
        />
        <MetricCard
          title="Portfolio"
          value="$19,500"
          description="0.2 BTC value"
          icon={TrendingUp}
          trend={{ value: 2.3, direction: "up", suffix: "%" }}
        />
      </div>

      {/* Goals Widgets Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <BitcoinTracker 
          currentHolding={0.2} 
          targetAmount={1.0} 
        />
        <FitnessTracker 
          weeklyGymTarget={4}
          weeklyKmTarget={25}
          workouts={mockWorkouts as any}
          totalKmThisMonth={0}
          halfMarathonDate="2026-12-31"
        />
        <ExpensesTracker
          monthName="Febrero"
          totalAmount={2468}
          transactionCount={3}
          categories={mockExpenseCategories}
          budget={10000}
        />
        <PartnershipPipeline
          partners={mockPartners}
          nextResearchDate="Lun 3 Feb, 2PM"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Tasks Card */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Priority Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TaskItem
                title="Review JEALT proposal"
                priority="high"
                due="Today"
              />
              <TaskItem
                title="IBM Partnership call"
                priority="medium"
                due="Tomorrow"
              />
              <TaskItem
                title="Contact Arize AI partnerships"
                priority="high"
                due="This week"
              />
              <TaskItem
                title="Update COE documentation"
                priority="low"
                due="This week"
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule Card */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <CardDescription>Your upcoming events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ScheduleItem time="10:30" title="Nexaminds Weekly Sales" />
              <ScheduleItem time="12:00" title="Leda : Bernardo sync" />
              <ScheduleItem time="15:00" title="🏋️ Gym time!" highlight />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Emails</CardTitle>
          <CardDescription>Latest messages from your inbox</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <EmailItem
              from="parminder@nexaminds.ai"
              subject="COE Update Required"
              time="10:30 AM"
            />
            <EmailItem
              from="jason.simons@ibm.com"
              subject="Partnership Follow-up"
              time="9:15 AM"
            />
            <EmailItem
              from="aurora@nexaminds.ai"
              subject="AI Strategy Meeting Notes"
              time="Yesterday"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  description: string
  icon: React.ElementType
  trend?: { value: number; direction: "up" | "down"; suffix?: string }
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <span className={`flex items-center text-xs ${trend.direction === "up" ? "text-green-500" : "text-red-500"}`}>
              {trend.direction === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trend.value}{trend.suffix || ""}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TaskItem({
  title,
  priority,
  due,
}: {
  title: string
  priority: "high" | "medium" | "low"
  due: string
}) {
  const priorityColors = {
    high: "bg-red-500/10 text-red-500 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    low: "bg-green-500/10 text-green-500 border-green-500/20",
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${priority === "high" ? "bg-red-500" : priority === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
        <span className="font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={priorityColors[priority]}>
          {priority}
        </Badge>
        <span className="text-sm text-muted-foreground">{due}</span>
      </div>
    </div>
  )
}

function ScheduleItem({ time, title, highlight }: { time: string; title: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg border transition-colors
      ${highlight 
        ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
        : 'bg-card hover:bg-accent/50'
      }`}
    >
      <div className="text-sm font-mono text-muted-foreground w-14">{time}</div>
      <div className="h-full w-px bg-border" />
      <span className={`font-medium ${highlight ? 'text-green-500' : ''}`}>{title}</span>
    </div>
  )
}

function EmailItem({
  from,
  subject,
  time,
}: {
  from: string
  subject: string
  time: string
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium">
          {from.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-sm">{from}</p>
          <p className="text-sm text-muted-foreground">{subject}</p>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  )
}
