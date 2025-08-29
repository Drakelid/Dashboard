import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Navigation, MapPin, Clock, Route, Zap, Phone, MessageCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

export function RouteTracker() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const currentRoute = {
    totalDistance: "24.7 km",
    estimatedTime: "1h 32m",
    deliveriesRemaining: 5,
    nextStop: {
      id: "SB-002",
      customerName: "Michael Chen",
      address: "321 Oak Drive, Riverside",
      distance: "2.1 km",
      eta: "12 min",
      phone: "+47 123 45 678"
    },
    trafficCondition: "moderate",
    totalEarnings: "375 kr"
  };

  const routeStops = [
    {
      id: "SB-002",
      customerName: "Michael Chen",
      address: "321 Oak Drive, Riverside",
      status: "next",
      distance: "2.1 km",
      eta: "12 min",
      packageType: "Medical",
      earnings: "75 kr",
      priority: "high"
    },
    {
      id: "SB-003",
      customerName: "Emma Thompson",
      address: "888 Pine Road, Suburbs",
      status: "upcoming",
      distance: "4.7 km",
      eta: "25 min",
      packageType: "Clothing",
      earnings: "75 kr",
      priority: "normal"
    },
    {
      id: "SB-004",
      customerName: "David Rodriguez",
      address: "777 Cedar Lane, Northside",
      status: "upcoming",
      distance: "6.2 km",
      eta: "35 min",
      packageType: "Electronics",
      earnings: "75 kr",
      priority: "normal"
    },
    {
      id: "SB-005",
      customerName: "Sarah Wilson",
      address: "555 Elm Street, Downtown",
      status: "upcoming",
      distance: "8.9 km",
      eta: "48 min",
      packageType: "Books",
      earnings: "75 kr",
      priority: "normal"
    },
    {
      id: "SB-006",
      customerName: "James Park",
      address: "999 Maple Ave, Eastside",
      status: "upcoming",
      distance: "12.3 km",
      eta: "65 min",
      packageType: "Electronics",
      earnings: "75 kr",
      priority: "low"
    }
  ];

  const optimizeRoute = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
    }, 3000);
  };

  const startNavigation = () => {
    setIsNavigating(true);
    // In a real app, this would start turn-by-turn navigation
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "next":
        return "bg-green-100 text-green-800 border-green-200";
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrafficColor = (condition: string) => {
    switch (condition) {
      case "light":
        return "text-green-600";
      case "moderate":
        return "text-orange-600";
      case "heavy":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Next Delivery Card - Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 via-blue-50 to-white shadow-lg hover-lift">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Next Delivery</CardTitle>
                  <CardDescription className="text-base">Your immediate priority</CardDescription>
                </div>
              </div>
              <Badge className="bg-green-600 text-white text-base px-3 py-1 hover:bg-green-700">
                75 kr
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ETA Highlight */}
            <div className="text-center p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl border-2 border-green-200">
              <div className="text-3xl md:text-4xl font-bold text-green-700 mb-1">
                {currentRoute.nextStop.eta}
              </div>
              <div className="text-green-600 font-medium">Estimated arrival</div>
            </div>
            
            {/* Customer Info & Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold">{currentRoute.nextStop.customerName}</h3>
                  <p className="text-muted-foreground">{currentRoute.nextStop.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Distance: {currentRoute.nextStop.distance}</span>
                    <Badge variant="outline" className="text-xs">Medical</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md h-12"
                  size="lg"
                  onClick={startNavigation}
                  disabled={isNavigating}
                >
                  <Navigation className="h-5 w-5 mr-2" />
                  {isNavigating ? "Navigating..." : "Start Navigation"}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs h-9">
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-9">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:gap-6 xl:grid-cols-3">
        {/* Route Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-1"
        >
          <Card className="hover-lift h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5 text-blue-500" />
                Route Summary
              </CardTitle>
              <CardDescription>Today's delivery overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{currentRoute.totalDistance}</div>
                  <div className="text-xs text-blue-600 font-medium">Total Distance</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">{currentRoute.estimatedTime}</div>
                  <div className="text-xs text-orange-600 font-medium">Est. Time</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">{currentRoute.deliveriesRemaining}</div>
                  <div className="text-xs text-purple-600 font-medium">Remaining</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{currentRoute.totalEarnings}</div>
                  <div className="text-xs text-green-600 font-medium">Total Earnings</div>
                </div>
              </div>

              {/* Traffic Status */}
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Traffic Condition</span>
                  <span className={`text-sm font-bold capitalize ${getTrafficColor(currentRoute.trafficCondition)}`}>
                    {currentRoute.trafficCondition}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${
                    currentRoute.trafficCondition === 'light' ? 'bg-green-500 w-1/3' :
                    currentRoute.trafficCondition === 'moderate' ? 'bg-orange-500 w-2/3' :
                    'bg-red-500 w-full'
                  }`}></div>
                </div>
              </div>

              {/* Optimize Route Button */}
              <Button 
                variant="outline" 
                onClick={optimizeRoute} 
                disabled={isOptimizing} 
                className="w-full h-12 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                size="lg"
              >
                <Zap className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">
                  {isOptimizing ? "Optimizing Route..." : "Optimize Route"}
                </span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Delivery Sequence */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2"
        >
          <Card className="hover-lift h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    Delivery Sequence
                  </CardTitle>
                  <CardDescription>Optimized delivery order</CardDescription>
                </div>
                <Badge variant="outline" className="text-sm">
                  {routeStops.length} stops
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {routeStops.map((stop, index) => (
                  <motion.div
                    key={stop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`group border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                      stop.status === "next" 
                        ? "border-green-300 bg-green-50/80 hover:bg-green-50" 
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all ${
                          stop.status === "next" 
                            ? "bg-green-600 text-white" 
                            : "bg-primary text-primary-foreground"
                        }`}>
                          {stop.status === "next" ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{stop.id}</span>
                          <Badge className={`text-xs ${getStatusColor(stop.status)}`}>
                            {stop.status === "next" ? "Next Stop" : "Upcoming"}
                          </Badge>
                          {stop.priority === "high" && (
                            <Badge className={`text-xs ${getPriorityColor(stop.priority)}`}>
                              Priority
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">{stop.earnings}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 pl-11">
                      <div className="font-medium">{stop.customerName}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2 leading-tight">
                        {stop.address}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-medium">{stop.distance}</span>
                          <span>ETA: {stop.eta}</span>
                          <Badge variant="outline" className="text-xs">
                            {stop.packageType}
                          </Badge>
                        </div>
                        {stop.status === "next" && (
                          <Button size="sm" variant="ghost" className="text-xs h-6 px-2">
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}