"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { Expense } from "@/lib/api"

interface ExpenseChartProps {
  expenses: Expense[]
}

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  // Group expenses by date and sum amounts
  const chartData = expenses.reduce(
    (acc, expense) => {
      const date = new Date(expense.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })

      const existing = acc.find((item) => item.date === date)
      if (existing) {
        existing.amount += expense.amount
      } else {
        acc.push({ date, amount: expense.amount })
      }

      return acc
    },
    [] as Array<{ date: string; amount: number }>,
  )

  // Sort by date
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (chartData.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-gray-500">No expense data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                      <span className="font-bold text-muted-foreground">{label}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Amount</span>
                      <span className="font-bold">${payload[0].value}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="amount"
          strokeWidth={2}
          stroke="#8884d8"
          dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: "#8884d8", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
