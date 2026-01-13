"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

interface DashboardChartsProps {
  bookingData: {
    labels: string[]
    values: number[]
  }
  revenueData: {
    labels: string[]
    values: number[]
  }
}

export default function DashboardCharts({ bookingData, revenueData }: DashboardChartsProps) {
  const barChartData = {
    labels: bookingData.labels,
    datasets: [
      {
        label: 'Bookings',
        data: bookingData.values,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  }

  const doughnutData = {
    labels: revenueData.labels,
    datasets: [
      {
        label: 'Revenue Share',
        data: revenueData.values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Booking Trends (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar options={options} data={barChartData} />
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Revenue Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center pt-4">
          <div className="h-[300px] w-[300px]">
            <Doughnut data={doughnutData} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
