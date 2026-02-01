"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Wallet, TrendingUp, Receipt } from "lucide-react"

interface ExpenseCategory {
  name: string
  amount: number
  icon: string
  color: string
}

interface ExpensesTrackerProps {
  monthName: string
  totalAmount: number
  transactionCount: number
  categories: ExpenseCategory[]
  budget?: number
}

export function ExpensesTracker({
  monthName = "Febrero",
  totalAmount = 0,
  transactionCount = 0,
  categories = [],
  budget
}: ExpensesTrackerProps) {
  
  const maxCategory = Math.max(...categories.map(c => c.amount), 1)
  const budgetProgress = budget ? (totalAmount / budget) * 100 : 0
  
  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    comida: '🍽️',
    entretenimiento: '🎉',
    transporte: '🚗',
    compras: '🛒',
    servicios: '📱',
    otros: '📦'
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wallet className="h-4 w-4 text-purple-500" />
          Gastos {monthName} 2026
        </CardTitle>
        <Receipt className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* Total */}
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">
              ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-sm text-muted-foreground">
              {transactionCount} transacciones
            </span>
          </div>

          {/* Budget progress (if set) */}
          {budget && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Presupuesto</span>
                <span>${budget.toLocaleString()} MXN</span>
              </div>
              <Progress 
                value={Math.min(budgetProgress, 100)} 
                className={`h-2 ${budgetProgress > 100 ? '[&>div]:bg-red-500' : ''}`}
              />
              {budgetProgress > 80 && (
                <p className="text-xs text-amber-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {budgetProgress >= 100 ? 'Presupuesto excedido!' : 'Cerca del límite'}
                </p>
              )}
            </div>
          )}

          {/* Categories breakdown */}
          <div className="space-y-2 pt-2 border-t">
            {categories.slice(0, 4).map((cat) => {
              const percentage = totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0
              const barWidth = (cat.amount / maxCategory) * 100
              
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <span>{categoryIcons[cat.name.toLowerCase()] || '📦'}</span>
                      <span className="capitalize">{cat.name}</span>
                    </span>
                    <span className="font-medium">
                      ${cat.amount.toLocaleString('es-MX')}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Link to full sheet */}
          <a 
            href="https://docs.google.com/spreadsheets/d/1HTgCUPreAEstYQckOuLNrNyJKcwHzmMtEZJKYAWZxBI/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-purple-500 hover:underline pt-2"
          >
            Ver detalle en Google Sheets →
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
