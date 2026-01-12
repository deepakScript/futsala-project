'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from 'next-themes';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueTrendItem {
  date: string;
  amount: number;
}

interface CourtDistItem {
  name: string;
  value: number;
}

interface PeakHourItem {
  hour: string;
  count: number;
}

export const RevenueLineChart = ({ data }: { data: RevenueTrendItem[] }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        fill: true,
        label: 'Revenue',
        data: data.map((d) => d.amount),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Revenue Trend', color: isDark ? '#fff' : '#666' },
    },
    scales: {
      y: { grid: { color: isDark ? '#333' : '#eee' }, ticks: { color: isDark ? '#fff' : '#666' } },
      x: { grid: { display: false }, ticks: { color: isDark ? '#fff' : '#666' } },
    },
  };

  return <div className="h-[300px] w-full"><Line data={chartData} options={options} /></div>;
};

export const CourtDoughnutChart = ({ data }: { data: CourtDistItem[] }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: isDark ? '#fff' : '#666' } },
      title: { display: true, text: 'Revenue by Court', color: isDark ? '#fff' : '#666' },
    },
  };

  return <div className="h-[300px] w-full"><Doughnut data={chartData} options={options} /></div>;
};

export const PeakHoursChart = ({ data }: { data: PeakHourItem[] }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = {
    labels: data.map((d) => d.hour),
    datasets: [
      {
        label: 'Bookings',
        data: data.map((d) => d.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Peak Hours Analysis', color: isDark ? '#fff' : '#666' },
    },
    scales: {
      y: { grid: { color: isDark ? '#333' : '#eee' }, ticks: { color: isDark ? '#fff' : '#666' } },
      x: { grid: { display: false }, ticks: { color: isDark ? '#fff' : '#666' } },
    },
  };

  return <div className="h-[300px] w-full"><Bar data={chartData} options={options} /></div>;
};
