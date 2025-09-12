import { RouteTracker } from "../components/RouteTracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Route, Navigation, MapPin, Clock, AlertTriangle, TrendingUp, Package } from "lucide-react";
import { motion } from "motion/react";

export function RoutePlanningPage() {
  const routeStats = {
    totalDistance: "24.7 km",
    estimatedTime: "1h 32m",
    completedStops: 3,
    totalStops: 8,
    timeOptimization: 15,
    deliveriesRemaining: 5
  };

  const nearbyDeliveries = [
    {
      id: "SB-010",
      address: "234 Rose Garden St",
      distance: "0.3 km",
      priority: "standard",
      earnings: "75 kr"
    },
    {
      id: "SB-011", 
      address: "567 Sunset Blvd",
      distance: "0.7 km",
      priority: "urgent",
      earnings: "75 kr"
    },
    {
      id: "SB-012",
      address: "890 Ocean View Dr",
      distance: "1.1 km", 
      priority: "express",
      earnings: "75 kr"
    }
  ];

  const routeAlerts = [
    {
      type: "traffic",
      message: "Heavy traffic on Main Street - 8 min delay expected",
      severity: "medium"
    },
    {
      type: "construction",
      message: "Road construction on 5th Avenue - alternate route suggested",
      severity: "high"
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "traffic":
        return <Clock className="h-4 w-4" />;
      case "construction":
        return <AlertTriangle className="h-4 w-4" />;
      case "weather":
        return <MapPin className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-200 bg-red-50 text-red-700";
      case "medium":
        return "border-orange-200 bg-orange-50 text-orange-700";
      case "low":
        return "border-blue-200 bg-blue-50 text-blue-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1>Route Planning</h1>
        <p className="text-muted-foreground">
          Optimize your delivery route for maximum efficiency • 75 kr per delivery
        </p>
      </motion.div>

      {/* Route Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Route Progress
            </CardTitle>
            <CardDescription>
              {routeStats.completedStops} of {routeStats.totalStops} deliveries completed • {routeStats.deliveriesRemaining} remaining
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress 
              value={(routeStats.completedStops / routeStats.totalStops) * 100} 
              className="w-full h-3"
            />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="font-bold text-lg text-blue-700">{routeStats.totalDistance}</div>
                <div className="text-xs text-blue-600 mt-1">Total Distance</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                <div className="font-bold text-lg text-orange-700">{routeStats.estimatedTime}</div>
                <div className="text-xs text-orange-600 mt-1">Est. Time</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="font-bold text-lg text-purple-700">-{routeStats.timeOptimization}min</div>
                <div className="text-xs text-purple-600 mt-1">Time Saved</div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700" size="lg">
                <Navigation className="h-4 w-4 mr-2" />
                Start Optimized Route
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Route Alerts */}
      {routeAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Route Alerts
              </CardTitle>
              <CardDescription>Real-time updates affecting your route</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {routeAlerts.map((alert, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-4 rounded-xl border ${getAlertColor(alert.severity)} hover:shadow-sm transition-all`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">{alert.message}</div>
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Route Map */}
        <div className="lg:col-span-2">
          <RouteTracker />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Nearby Deliveries */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Available Deliveries
              </CardTitle>
              <CardDescription>Add nearby deliveries to optimize your route</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {nearbyDeliveries.map((delivery, index) => (
                <motion.div 
                  key={delivery.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="border rounded-xl p-4 hover:bg-muted/30 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm">{delivery.id}</span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`text-xs ${
                          delivery.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          delivery.priority === 'express' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {delivery.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3 line-clamp-2">{delivery.address}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {delivery.distance}
                      </span>
                      <span className="font-medium text-green-600">{delivery.earnings}</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs hover:bg-blue-50 hover:border-blue-300">
                      Add to Route
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5 text-purple-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-11" size="sm">
                <Clock className="h-4 w-4 mr-3" />
                Optimize Current Route
              </Button>
              <Button variant="outline" className="w-full justify-start h-11" size="sm">
                <MapPin className="h-4 w-4 mr-3" />
                Find Nearby Deliveries
              </Button>
              <Button variant="outline" className="w-full justify-start h-11" size="sm">
                <TrendingUp className="h-4 w-4 mr-3" />
                View Route Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}