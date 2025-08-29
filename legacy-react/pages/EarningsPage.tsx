import { WeeklyEarningsChart, PerformanceTrendChart } from "../components/InteractiveCharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { DollarSign, TrendingUp, Calendar, Download, Target, Clock, Package, Star, Zap, CreditCard, Wallet, CheckCircle, Leaf } from "lucide-react";
import { motion } from "motion/react";

export function EarningsPage() {
  // Updated earnings data with 75kr standard delivery fee
  const earningsData = {
    today: { amount: 600.0, trips: 8, hours: 7.2, bonus: 150.0, deliveryFee: 75 },
    week: { amount: 2625.0, trips: 35, hours: 42.5, bonus: 875.0, deliveryFee: 75 },
    month: { amount: 10875.0, trips: 145, hours: 168.0, bonus: 2175.0, deliveryFee: 75 },
    lastPayout: { amount: 8250.0, date: "Dec 15, 2023" }
  };

  const weeklyBreakdown = [
    { day: "Monday", amount: 450.0, trips: 6, hours: 6.5, baseEarnings: 450.0, bonus: 120.0 },
    { day: "Tuesday", amount: 525.0, trips: 7, hours: 7.8, baseEarnings: 525.0, bonus: 185.0 },
    { day: "Wednesday", amount: 375.0, trips: 5, hours: 7.2, baseEarnings: 375.0, bonus: 152.0 },
    { day: "Thursday", amount: 450.0, trips: 6, hours: 8.1, baseEarnings: 450.0, bonus: 223.0 },
    { day: "Friday", amount: 675.0, trips: 9, hours: 8.5, baseEarnings: 675.0, bonus: 254.0 },
    { day: "Saturday", amount: 150.0, trips: 2, hours: 5.4, baseEarnings: 150.0, bonus: 89.0 },
    { day: "Today", amount: 600.0, trips: 8, hours: 7.2, baseEarnings: 600.0, bonus: 150.0 }
  ];

  const bonuses = [
    { 
      type: "Eco-Delivery Bonus", 
      amount: 450.0, 
      description: "Green vehicle deliveries this week",
      icon: Leaf,
      color: "bg-green-50 text-green-600",
      active: true
    },
    { 
      type: "Peak Hours Bonus", 
      amount: 350.0, 
      description: "Friday evening rush (6-9 PM)",
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
      active: true
    },
    { 
      type: "High Rating Bonus", 
      amount: 250.0, 
      description: "Maintaining 4.9+ customer rating",
      icon: Star,
      color: "bg-yellow-50 text-yellow-600",
      active: true
    },
    { 
      type: "Completion Bonus", 
      amount: 300.0, 
      description: "Complete 40+ deliveries per week",
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      active: false,
      progress: 87
    }
  ];

  const paymentMethods = [
    { 
      type: "Bank Transfer", 
      account: "DNB Bank ****2847", 
      status: "Active", 
      primary: true,
      icon: Wallet,
      processingTime: "1-2 business days"
    },
    { 
      type: "Digital Wallet", 
      account: "Vipps - john.doe@email.com", 
      status: "Active", 
      primary: false,
      icon: CreditCard,
      processingTime: "Instant"
    }
  ];

  const earningsGoals = [
    { period: "Daily", target: 675, current: 600.0, label: "675 kr/day (9 deliveries)" },
    { period: "Weekly", target: 3375, current: 2625.0, label: "3,375 kr/week (45 deliveries)" },
    { period: "Monthly", target: 14625, current: 10875.0, label: "14,625 kr/month (195 deliveries)" }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('NOK', 'kr');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-green-700 to-green-800 p-6 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">💰 SamBring Earnings</h1>
            <p className="text-green-100 text-sm md:text-base">
              Track your eco-delivery income • 75 kr standard delivery fee
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="text-sm">
                <span className="opacity-75">This week: </span>
                <span className="font-semibold text-lg">{formatCurrency(earningsData.week.amount)}</span>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                <Package className="h-3 w-3 mr-1" />
                {earningsData.week.trips} deliveries
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                <Leaf className="h-3 w-3 mr-1" />
                +33% eco bonus
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-white text-green-700 hover:bg-green-50">
              <DollarSign className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Earnings Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover-lift relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{formatCurrency(earningsData.today.amount)}</div>
                  <div className="text-xs text-muted-foreground">Today • {earningsData.today.trips} deliveries</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{formatCurrency(earningsData.week.amount)}</div>
                  <div className="text-xs text-muted-foreground">This Week • {earningsData.week.trips} deliveries</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{formatCurrency(earningsData.month.amount)}</div>
                  <div className="text-xs text-muted-foreground">This Month • {earningsData.month.trips} deliveries</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm">
                  <Package className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{earningsData.deliveryFee} kr</div>
                  <div className="text-xs text-muted-foreground">Standard Fee • Per delivery</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Earnings Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Earnings Goals
            </CardTitle>
            <CardDescription>Track your progress towards income targets • Based on 75 kr per delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {earningsGoals.map((goal, index) => (
                <div key={goal.period} className="p-4 border rounded-lg bg-gradient-to-br from-muted/30 to-muted/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{goal.period}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round((goal.current / goal.target) * 100)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">{goal.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <WeeklyEarningsChart />
          
          {/* Enhanced Weekly Breakdown */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Detailed Weekly Breakdown
              </CardTitle>
              <CardDescription>Complete earnings breakdown by day • 75 kr per delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weeklyBreakdown.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                      day.day === 'Today' 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 font-medium text-sm">{day.day}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {day.trips} deliveries
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {day.hours}h
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold">{formatCurrency(day.amount)}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2 bg-white/60 rounded border">
                        <div className="text-sm font-medium text-green-600">{formatCurrency(day.baseEarnings)}</div>
                        <div className="text-xs text-muted-foreground">Base ({day.trips} × 75 kr)</div>
                      </div>
                      <div className="p-2 bg-white/60 rounded border">
                        <div className="text-sm font-medium text-blue-600">{formatCurrency(day.bonus)}</div>
                        <div className="text-xs text-muted-foreground">Eco Bonus</div>
                      </div>
                      <div className="p-2 bg-white/60 rounded border">
                        <div className="text-sm font-medium text-purple-600">{Math.round((day.amount / day.hours) * 10) / 10} kr/h</div>
                        <div className="text-xs text-muted-foreground">Hourly Rate</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enhanced Bonuses */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-500" />
                Eco-Bonuses & Rewards
              </CardTitle>
              <CardDescription>Earn extra on top of the 75 kr base fee</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bonuses.map((bonus, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
                    bonus.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${bonus.color}`}>
                      <bonus.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{bonus.type}</div>
                      <div className="text-xs text-muted-foreground">{bonus.description}</div>
                    </div>
                    <div className={`font-bold text-sm ${bonus.active ? 'text-green-600' : 'text-gray-500'}`}>
                      {bonus.active ? `+${formatCurrency(bonus.amount)}` : formatCurrency(bonus.amount)}
                    </div>
                  </div>
                  
                  {!bonus.active && bonus.progress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{bonus.progress}%</span>
                      </div>
                      <Progress value={bonus.progress} className="h-1" />
                    </div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Enhanced Payment Methods */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-500" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage how you receive payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                  method.primary ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-white/80 shadow-sm">
                      <method.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{method.type}</div>
                      <div className="text-xs text-muted-foreground">{method.account}</div>
                    </div>
                    {method.primary && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Primary</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-green-600">{method.status}</span>
                    <span className="text-muted-foreground">{method.processingTime}</span>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          {/* Recent Payout */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Recent Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(earningsData.lastPayout.amount)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Processed on {earningsData.lastPayout.date}
                </div>
                <div className="text-xs text-muted-foreground">
                  110 deliveries × 75 kr base fee
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
                <Button variant="outline" size="sm" className="w-full">
                  View Transaction Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}