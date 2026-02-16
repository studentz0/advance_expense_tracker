'use client'

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

interface TrendProps {
  data: {
    month: string
    income: number
    expenses: number
  }[]
}

export default function TrendChart({ data }: TrendProps) {
  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
            }}
          />
          <Legend iconType="circle" />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#22c55e" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#22c55e' }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#ef4444' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
