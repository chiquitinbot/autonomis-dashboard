"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bitcoin, TrendingDown, TrendingUp, Target } from "lucide-react"
import { useEffect, useState } from "react"

interface BitcoinTrackerProps {
  currentHolding: number
  targetAmount: number
}

export function BitcoinTracker({ currentHolding = 0.2, targetAmount = 1.0 }: BitcoinTrackerProps) {
  const [btcPrice, setBtcPrice] = useState<number | null>(null)
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
        )
        const data = await res.json()
        setBtcPrice(data.bitcoin.usd)
        setPriceChange24h(data.bitcoin.usd_24h_change)
      } catch (error) {
        console.error("Failed to fetch BTC price:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPrice()
    const interval = setInterval(fetchPrice, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const progress = (currentHolding / targetAmount) * 100
  const currentValueUSD = btcPrice ? currentHolding * btcPrice : 0
  const remainingBTC = targetAmount - currentHolding
  const remainingUSD = btcPrice ? remainingBTC * btcPrice : 0

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bitcoin className="h-4 w-4 text-orange-500" />
          Road to 1 BTC
        </CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Holdings */}
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">{currentHolding.toFixed(3)} BTC</span>
            <span className="text-muted-foreground">/ {targetAmount} BTC</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground text-right">{progress.toFixed(1)}% complete</p>
          </div>

          {/* Price info */}
          {!loading && btcPrice && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">BTC Price</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  ${btcPrice.toLocaleString()}
                  {priceChange24h !== null && (
                    <span className={`text-xs flex items-center ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {priceChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(priceChange24h).toFixed(1)}%
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Your Value</p>
                <p className="text-sm font-medium">${currentValueUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          )}

          {/* Remaining */}
          <div className="bg-background/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Still need</p>
            <p className="text-lg font-semibold text-orange-500">
              {remainingBTC.toFixed(3)} BTC
              {btcPrice && <span className="text-sm text-muted-foreground ml-2">(~${remainingUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
