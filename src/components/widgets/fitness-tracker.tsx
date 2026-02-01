"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dumbbell, Timer, Flame, Target, Calendar } from "lucide-react"

interface WorkoutDay {
  date: string
  type: 'gym' | 'run' | 'yoga' | 'other' | null
  distance_km?: number
}

interface FitnessTrackerProps {
  weeklyGymTarget: number
  weeklyKmTarget: number
  workouts: WorkoutDay[]
  totalKmThisMonth: number
  halfMarathonDate?: string
}

export function FitnessTracker({
  weeklyGymTarget = 4,
  weeklyKmTarget = 25,
  workouts = [],
  totalKmThisMonth = 0,
  halfMarathonDate = "2026-12-31"
}: FitnessTrackerProps) {
  
  const gymDaysThisWeek = workouts.filter(w => w.type === 'gym').length
  const kmThisWeek = workouts.reduce((sum, w) => sum + (w.distance_km || 0), 0)
  
  const gymProgress = (gymDaysThisWeek / weeklyGymTarget) * 100
  const kmProgress = (kmThisWeek / weeklyKmTarget) * 100

  // Days until half marathon
  const daysUntilRace = halfMarathonDate 
    ? Math.ceil((new Date(halfMarathonDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Week days (Mon-Sun)
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  
  return (
    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-green-500" />
          Half Marathon Progress
        </CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* Week visualization */}
          <div className="flex justify-between gap-1">
            {weekDays.map((day, i) => {
              const workout = workouts[i]
              const hasWorkout = workout?.type !== null
              const isGym = workout?.type === 'gym'
              const isRun = workout?.type === 'run'
              
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${isGym ? 'bg-green-500 text-white' : ''}
                    ${isRun ? 'bg-blue-500 text-white' : ''}
                    ${!hasWorkout ? 'bg-muted' : ''}
                  `}>
                    {isGym && '🏋️'}
                    {isRun && '🏃'}
                    {!hasWorkout && '-'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Gym progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Dumbbell className="h-3 w-3" /> Gym
              </span>
              <span className="font-medium">{gymDaysThisWeek}/{weeklyGymTarget} días</span>
            </div>
            <Progress value={gymProgress} className="h-2" />
          </div>

          {/* Km progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Timer className="h-3 w-3" /> Running
              </span>
              <span className="font-medium">{kmThisWeek.toFixed(1)}/{weeklyKmTarget} km</span>
            </div>
            <Progress value={kmProgress} className="h-2" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div className="bg-background/50 rounded-lg p-2 text-center">
              <Flame className="h-4 w-4 mx-auto text-orange-500" />
              <p className="text-lg font-bold">{totalKmThisMonth.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">km este mes</p>
            </div>
            {daysUntilRace && (
              <div className="bg-background/50 rounded-lg p-2 text-center">
                <Calendar className="h-4 w-4 mx-auto text-blue-500" />
                <p className="text-lg font-bold">{daysUntilRace}</p>
                <p className="text-xs text-muted-foreground">días para 21K</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
