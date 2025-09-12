import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, DollarSign, Package, Star, TrendingUp, TrendingDown, Users, Target, Zap } from "lucide-react";
import { MiniEarningsChart } from "./InteractiveCharts";
import { motion } from "motion/react";

export function OverviewCards() {
  const stats = [
    {
      title: "Today's Deliveries",
      value: "8",
      description: "5 pending pickup",
      icon: Package,
      change: "+3 from yesterday",
      changeType: "positive",
      color: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-500",
      progress: 75
    },
    {
      title: "Today's Earnings",
      value: "600 kr",
      description: "8 × 75 kr standard fee",
      icon: DollarSign,
      change: "+3 deliveries",
      changeType: "positive",
      color: "bg-gradient-to-br from-green-50 to-green-100",
      iconColor: "text-green-600",
      accentColor: "bg-green-500",
      progress: 82,
      showChart: true
    },
    {
      title: "Driver Rating",
      value: "4.9",
      description: "Based on 156 reviews",
      icon: Star,
      change: "+0.1 this week",
      changeType: "positive",
      color: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      iconColor: "text-yellow-600",
      accentColor: "bg-yellow-500",
      progress: 98
    },
    {
      title: "Active Hours",
      value: "7.2h",
      description: "Target: 8h today",
      icon: Clock,
      change: "90% of target",
      changeType: "neutral",
      color: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
      accentColor: "bg-purple-500",
      progress: 90
    }
  ];

  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden hover-lift group cursor-pointer transition-all duration-300 hover:shadow-lg border-0">
            {/* Background gradient */}
            <div className={`absolute inset-0 ${stat.color}`} />
            
            {/* Accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${stat.accentColor}`} />
            
            {/* Progress indicator */}
            <div 
              className={`absolute bottom-0 left-0 h-0.5 ${stat.accentColor} transition-all duration-1000`}
              style={{ width: `${stat.progress}%` }}
            />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground line-clamp-2 leading-tight">
                {stat.title}
              </CardTitle>
              <div className="relative">
                <div className={`p-1.5 md:p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.iconColor}`} />
                </div>
                {stat.changeType === "positive" && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-2 relative z-10">
              <div className="flex items-end gap-2">
                <div className="text-lg md:text-2xl font-bold leading-none">{stat.value}</div>
                {stat.showChart && (
                  <div className="flex-1 opacity-60">
                    <MiniEarningsChart className="w-full" />
                  </div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-1">
                {stat.description}
              </p>
              
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                  {stat.changeType === "positive" && <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-600" />}
                  {stat.changeType === "negative" && <TrendingDown className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-600" />}
                  {stat.changeType === "neutral" && <Target className="h-2.5 w-2.5 md:h-3 md:w-3 text-blue-600" />}
                  <span className={`text-xs font-medium ${
                    stat.changeType === "positive" ? "text-green-600" : 
                    stat.changeType === "negative" ? "text-red-600" : 
                    "text-blue-600"
                  }`}>
                    {stat.change}
                  </span>
                </div>
                
                {/* Quick action button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Zap className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export function EnhancedOverviewCards() {
  const quickActions = [
    {
      title: "Start Next Delivery",
      value: "SB-002",
      description: "Ready for pickup",
      icon: Package,
      color: "bg-gradient-to-br from-green-50 to-green-100",
      iconColor: "text-green-600",
      accentColor: "bg-green-500",
      urgent: true
    },
    {
      title: "Weekly Goal",
      value: "87%",
      description: "65/75 deliveries (4,875 kr / 5,625 kr)",
      icon: Target,
      color: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-500",
      progress: 87
    },
    {
      title: "Performance Bonus",
      value: "+150 kr",
      description: "Eco-friendly bonus this week",
      icon: Star,
      color: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      iconColor: "text-yellow-600",
      accentColor: "bg-yellow-500",
      showSpark: true
    },
    {
      title: "Standard Fee",
      value: "75 kr",
      description: "Per delivery up to 5kg",
      icon: DollarSign,
      color: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
      accentColor: "bg-purple-500"
    }
  ];

  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
      {quickActions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden hover-lift group cursor-pointer transition-all duration-300 hover:shadow-lg border-0">
            {/* Background gradient */}
            <div className={`absolute inset-0 ${action.color}`} />
            
            {/* Accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${action.accentColor}`} />
            
            {/* Urgent pulse effect */}
            {action.urgent && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
            
            {/* Progress bar */}
            {action.progress && (
              <div 
                className={`absolute bottom-0 left-0 h-0.5 ${action.accentColor} transition-all duration-1000`}
                style={{ width: `${action.progress}%` }}
              />
            )}
            
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform duration-200 relative`}>
                  <action.icon className={`h-4 w-4 ${action.iconColor}`} />
                  {action.showSpark && (
                    <div className="absolute -top-1 -right-1">
                      <Zap className="h-2 w-2 text-yellow-500 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-lg font-bold leading-none">{action.value}</div>
                <div className="text-xs font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}