import { OverviewCards, EnhancedOverviewCards } from "../components/OverviewCards";
import { ActiveDeliveries } from "../components/ActiveDeliveries";
import { DeliveryHistory } from "../components/DeliveryHistory";
import { WeeklyEarningsChart, PerformanceTrendChart, DeliveryTypesChart, HourlyActivityChart } from "../components/InteractiveCharts";
import { OverviewCardsSkeleton, ChartSkeleton } from "../components/LoadingSkeletons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { TrendingUp, Clock, MapPin, DollarSign, Package, Star, Zap, Target, AlertTriangle, CheckCircle, Users, Leaf } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearInterval(timer);
  }, []);

  const quickStats = {
    todayEarnings: "600 kr", // 8 deliveries x 75kr
    activeDeliveries: 5,
    completedToday: 8,
    rating: 4.9,
    hoursWorked: "7.2h",
    nextDelivery: "12 min",
    weeklyGoal: 87,
    bonusEarned: 150.00, // Eco bonuses
    ecoScore: 92, // Added eco-friendly metric
    deliveryFee: "75 kr" // Standard delivery fee
  };

  const upcomingTasks = [
    {
      id: "SB-002",
      type: "pickup",
      location: "Eco-Mart Warehouse",
      address: "1234 Green Avenue",
      time: "2:30 PM",
      priority: "urgent",
      distance: "0.8 km",
      ecoFriendly: true,
      earnings: "75 kr"
    },
    {
      id: "SB-003",
      type: "delivery",
      location: "Emma Thompson",
      address: "888 Pine Road, Suburbs",
      time: "3:15 PM",
      priority: "standard",
      distance: "4.7 km",
      ecoFriendly: false,
      earnings: "75 kr"
    },
    {
      id: "SB-004",
      type: "pickup",
      location: "Sustainable Store",
      address: "333 Earth Street",
      time: "4:00 PM",
      priority: "express",
      distance: "2.1 km",
      ecoFriendly: true,
      earnings: "75 kr"
    }
  ];

  const achievements = [
    { title: "Eco Champion", description: "100% green deliveries this week", icon: Leaf, earned: true },
    { title: "Speed Demon", description: "Under 15min avg delivery", icon: Zap, earned: true },
    { title: "Customer Favorite", description: "50+ positive reviews", icon: Users, earned: false, progress: 78 },
    { title: "Route Master", description: "95% on-time rate", icon: Target, earned: false, progress: 94 }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "border-red-200 bg-red-50";
      case "express": return "border-orange-200 bg-orange-50";
      default: return "border-blue-200 bg-blue-50";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "express": return "bg-orange-100 text-orange-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        </div>
        <OverviewCardsSkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Enhanced Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-green-700 to-green-800 p-6 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Good afternoon, John! 🌱</h1>
            <p className="text-green-100 text-sm md:text-base">
              You have {quickStats.activeDeliveries} eco-deliveries active. Next pickup in {quickStats.nextDelivery}.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge className="bg-white/20 text-white border-white/30">
                <Leaf className="h-3 w-3 mr-1" />
                Eco Score: {quickStats.ecoScore}%
              </Badge>
              <div className="text-sm">
                <span className="opacity-75">Standard fee: </span>
                <span className="font-semibold">{quickStats.deliveryFee}</span>
              </div>
              <div className="text-sm">
                <span className="opacity-75">Today: </span>
                <span className="font-semibold">{quickStats.todayEarnings}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <MapPin className="h-4 w-4 mr-2" />
              View Route
            </Button>
            <Button size="sm" className="bg-white text-green-700 hover:bg-green-50">
              <Package className="h-4 w-4 mr-2" />
              Start Next
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <OverviewCards />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <EnhancedOverviewCards />
      </motion.div>

      {/* Main Dashboard Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Active Deliveries */}
              <div className="lg:col-span-2">
                <ActiveDeliveries />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <DeliveryHistory />
                
                {/* Performance Summary */}
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Today's Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">{quickStats.completedToday}</div>
                        <div className="text-xs text-green-600">Completed</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-700">{quickStats.rating}</div>
                        <div className="text-xs text-blue-600">Rating</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Weekly Goal</span>
                          <span className="font-medium">{quickStats.weeklyGoal}%</span>
                        </div>
                        <Progress value={quickStats.weeklyGoal} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-1">
                            <Leaf className="h-3 w-3 text-green-500" />
                            Eco Score
                          </span>
                          <span className="font-medium">{quickStats.ecoScore}%</span>
                        </div>
                        <Progress value={quickStats.ecoScore} className="h-2" />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hours worked</span>
                          <span className="font-medium">{quickStats.hoursWorked}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Standard delivery fee</span>
                          <span className="font-medium text-green-600">{quickStats.deliveryFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Eco bonus earned</span>
                          <span className="font-medium text-green-600">+{quickStats.bonusEarned} kr</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <WeeklyEarningsChart />
              <PerformanceTrendChart />
              <DeliveryTypesChart />
              <HourlyActivityChart />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Upcoming Tasks
                </CardTitle>
                <CardDescription>Your scheduled pickups and eco-deliveries • {quickStats.deliveryFee} per delivery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${getPriorityColor(task.priority)} hover:shadow-sm transition-shadow`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityBadge(task.priority)}>
                          {task.priority}
                        </Badge>
                        <span className="font-medium text-sm">{task.id}</span>
                        <span className="text-xs text-muted-foreground">{task.type}</span>
                        {task.ecoFriendly && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <Leaf className="h-2 w-2 mr-1" />
                            Eco
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">{task.earnings}</span>
                        <span className="text-sm font-medium">{task.time}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{task.location}</div>
                      <div className="text-xs text-muted-foreground">{task.address}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">{task.distance}</div>
                        <Button variant="outline" size="sm" className="h-6 text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          Navigate
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Achievements & Eco-Milestones
                </CardTitle>
                <CardDescription>Track your progress and unlock sustainable rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                        achievement.earned 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          achievement.earned 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <achievement.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{achievement.title}</div>
                          <div className="text-xs text-muted-foreground">{achievement.description}</div>
                        </div>
                        {achievement.earned ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="text-xs font-medium text-muted-foreground">
                            {achievement.progress}%
                          </div>
                        )}
                      </div>
                      
                      {!achievement.earned && achievement.progress && (
                        <Progress value={achievement.progress} className="h-1 mt-2" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}