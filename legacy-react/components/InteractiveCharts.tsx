import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Package, Clock, Star } from "lucide-react";

const earningsData = [
  { day: "Mon", earnings: 1895.0, deliveries: 14, hours: 6.5 },
  { day: "Tue", earnings: 2342.0, deliveries: 17, hours: 7.8 },
  { day: "Wed", earnings: 1987.5, deliveries: 15, hours: 7.2 },
  { day: "Thu", earnings: 2673.0, deliveries: 19, hours: 8.1 },
  { day: "Fri", earnings: 2984.5, deliveries: 21, hours: 8.5 },
  { day: "Sat", earnings: 1563.0, deliveries: 12, hours: 5.4 },
  { day: "Sun", earnings: 2018.0, deliveries: 16, hours: 6.8 }
];

const performanceData = [
  { month: "Jan", rating: 4.6, onTime: 89, deliveries: 245 },
  { month: "Feb", rating: 4.7, onTime: 92, deliveries: 268 },
  { month: "Mar", rating: 4.8, onTime: 94, deliveries: 301 },
  { month: "Apr", rating: 4.9, onTime: 96, deliveries: 287 },
  { month: "May", rating: 4.8, onTime: 95, deliveries: 312 },
  { month: "Jun", rating: 4.9, onTime: 97, deliveries: 334 }
];

const deliveryTypeData = [
  { name: "Standard", value: 45, color: "#3b82f6" },
  { name: "Express", value: 30, color: "#f59e0b" },
  { name: "Urgent", value: 15, color: "#ef4444" },
  { name: "Scheduled", value: 10, color: "#10b981" }
];

const hourlyData = [
  { hour: "6AM", deliveries: 2 },
  { hour: "8AM", deliveries: 5 },
  { hour: "10AM", deliveries: 8 },
  { hour: "12PM", deliveries: 12 },
  { hour: "2PM", deliveries: 15 },
  { hour: "4PM", deliveries: 18 },
  { hour: "6PM", deliveries: 14 },
  { hour: "8PM", deliveries: 9 },
  { hour: "10PM", deliveries: 4 }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('no-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('NOK', 'kr');
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-border">
        <p className="font-medium text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.dataKey === 'earnings' 
              ? formatCurrency(entry.value) 
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function WeeklyEarningsChart() {
  const totalEarnings = earningsData.reduce((sum, day) => sum + day.earnings, 0);
  const avgEarnings = totalEarnings / earningsData.length;
  const trend = earningsData[earningsData.length - 1].earnings > avgEarnings;

  return (
    <Card className="hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Weekly Earnings
            </CardTitle>
            <CardDescription>Daily earnings breakdown</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEarnings)}
            </div>
            <div className="flex items-center gap-1 text-sm">
              {trend ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={trend ? "text-green-600" : "text-red-600"}>
                {trend ? "+12%" : "-8%"} vs last week
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="earnings" 
              fill="url(#earningsGradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PerformanceTrendChart() {
  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Performance Trends
        </CardTitle>
        <CardDescription>Rating and on-time delivery trends</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={false}
            />
            <YAxis 
              yAxisId="rating"
              domain={[4.0, 5.0]}
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={false}
            />
            <YAxis 
              yAxisId="onTime"
              orientation="right"
              domain={[80, 100]}
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              yAxisId="rating"
              type="monotone" 
              dataKey="rating" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              name="Rating"
            />
            <Line 
              yAxisId="onTime"
              type="monotone" 
              dataKey="onTime" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="On-Time %"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DeliveryTypesChart() {
  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-500" />
          Delivery Types
        </CardTitle>
        <CardDescription>Distribution of delivery categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {deliveryTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percentage']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2">
            {deliveryTypeData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.name}</span>
                <Badge variant="outline" className="text-xs">
                  {item.value}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HourlyActivityChart() {
  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-500" />
          Hourly Activity
        </CardTitle>
        <CardDescription>Delivery distribution throughout the day</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="hour" 
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="deliveries" 
              stroke="#8b5cf6" 
              fill="url(#activityGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function MiniEarningsChart({ className }: { className?: string }) {
  const miniData = earningsData.slice(-7);
  
  return (
    <div className={`${className}`}>
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={miniData}>
          <Area 
            type="monotone" 
            dataKey="earnings" 
            stroke="#10b981" 
            fill="url(#miniGradient)"
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}