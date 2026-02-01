"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Handshake, ArrowRight, Calendar, Building2 } from "lucide-react"

interface Partner {
  id: string
  name: string
  category: string
  status: 'prospect' | 'contacted' | 'in_progress' | 'active' | 'inactive'
  priority: 'low' | 'medium' | 'high' | 'critical'
  nextStep?: string
  nextStepDate?: string
}

interface PartnershipPipelineProps {
  partners: Partner[]
  nextResearchDate?: string
}

export function PartnershipPipeline({
  partners = [],
  nextResearchDate
}: PartnershipPipelineProps) {
  
  const statusColors: Record<string, string> = {
    prospect: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    contacted: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    in_progress: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    active: 'bg-green-500/20 text-green-500 border-green-500/30',
    inactive: 'bg-gray-500/20 text-gray-500 border-gray-500/30'
  }

  const statusLabels: Record<string, string> = {
    prospect: '🟡 Prospecto',
    contacted: '🔵 Contactado',
    in_progress: '🟣 En proceso',
    active: '🟢 Activo',
    inactive: '⚫ Inactivo'
  }

  const priorityIcons: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '⚪'
  }

  const categoryLabels: Record<string, string> = {
    mlops: 'MLOps',
    observability: 'Observability',
    governance: 'Governance',
    vector_db: 'Vector DB',
    llm_infra: 'LLM Infra',
    infrastructure: 'Infrastructure',
    enterprise: 'Enterprise'
  }

  // Group by status for pipeline view
  const activePartners = partners.filter(p => p.status === 'active')
  const inProgress = partners.filter(p => ['prospect', 'contacted', 'in_progress'].includes(p.status))

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Handshake className="h-4 w-4 text-blue-500" />
          AI Partners Pipeline
        </CardTitle>
        <Building2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-green-500/10 rounded-lg p-2">
              <p className="text-xl font-bold text-green-500">{activePartners.length}</p>
              <p className="text-xs text-muted-foreground">Activos</p>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-2">
              <p className="text-xl font-bold text-yellow-500">{inProgress.length}</p>
              <p className="text-xs text-muted-foreground">En pipeline</p>
            </div>
          </div>

          {/* Partner list */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {partners.slice(0, 6).map((partner) => (
              <div 
                key={partner.id}
                className="flex items-center justify-between p-2 bg-background/50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{priorityIcons[partner.priority]}</span>
                    <span className="font-medium text-sm truncate">{partner.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs py-0">
                      {categoryLabels[partner.category] || partner.category}
                    </Badge>
                  </div>
                </div>
                <Badge className={`text-xs ${statusColors[partner.status]}`}>
                  {statusLabels[partner.status]}
                </Badge>
              </div>
            ))}
          </div>

          {/* Next step */}
          {inProgress.length > 0 && inProgress[0].nextStep && (
            <div className="bg-background/50 rounded-lg p-3 border-l-2 border-blue-500">
              <p className="text-xs text-muted-foreground">Próximo paso</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                {inProgress[0].nextStep}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {inProgress[0].name}
              </p>
            </div>
          )}

          {/* Next research */}
          {nextResearchDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <Calendar className="h-3 w-3" />
              <span>Próximo research: {nextResearchDate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
