import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Clock, MapPin, Package, Phone, MessageSquare, Navigation, User, Leaf } from "lucide-react";
import { motion } from "motion/react";

interface ActiveDeliveriesProps {
  showFullView?: boolean;
}

export function ActiveDeliveries({ showFullView = false }: ActiveDeliveriesProps) {
  const deliveries = [
    {
      id: "SB-002",
      customerName: "Michael Chen",
      customerPhone: "+47 987 65 432",
      pickup: {
        location: "Eco-Mart Warehouse",
        address: "1234 Green Avenue, Downtown",
        time: "2:30 PM"
      },
      dropoff: {
        location: "321 Oak Drive, Riverside",
        time: "3:15 PM"
      },
      status: "in_progress",
      priority: "urgent",
      distance: "4.7 km",
      estimatedTime: "12 min",
      earnings: "75 kr",
      progress: 65,
      ecoFriendly: true,
      items: 3,
      weight: "4.2kg"
    },
    {
      id: "SB-003",
      customerName: "Sarah Wilson",
      customerPhone: "+47 234 56 789",
      pickup: {
        location: "Green Grocers",
        address: "456 Earth Street, Midtown",
        time: "3:45 PM"
      },
      dropoff: {
        location: "789 Pine Road, Suburbs",
        time: "4:30 PM"
      },
      status: "pending",
      priority: "standard",
      distance: "6.2 km",
      estimatedTime: "18 min",
      earnings: "75 kr",
      progress: 0,
      ecoFriendly: true,
      items: 2,
      weight: "3.8kg"
    },
    {
      id: "SB-004",
      customerName: "David Rodriguez",
      customerPhone: "+47 345 67 890",
      pickup: {
        location: "Tech Store",
        address: "999 Innovation Ave",
        time: "5:00 PM"
      },
      dropoff: {
        location: "555 Maple Street, Downtown",
        time: "5:45 PM"
      },
      status: "pending",
      priority: "express",
      distance: "3.1 km",
      estimatedTime: "8 min",
      earnings: "75 kr",
      progress: 0,
      ecoFriendly: false,
      items: 1,
      weight: "2.1kg"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-200 bg-red-50";
      case "express":
        return "border-orange-200 bg-orange-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "express":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const displayDeliveries = showFullView ? deliveries : deliveries.slice(0, 2);

  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-500" />
          Active Eco-Deliveries
        </CardTitle>
        <CardDescription>
          {deliveries.length} active deliveries • 75 kr standard fee • {deliveries.filter(d => d.ecoFriendly).length} eco-friendly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayDeliveries.map((delivery, index) => (
          <motion.div
            key={delivery.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`border rounded-lg p-4 hover:shadow-md transition-all ${getPriorityColor(delivery.priority)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{delivery.id}</span>
                <Badge className={getPriorityBadge(delivery.priority)}>
                  {delivery.priority}
                </Badge>
                <Badge className={getStatusColor(delivery.status)}>
                  {getStatusText(delivery.status)}
                </Badge>
                {delivery.ecoFriendly && (
                  <Badge className="bg-green-100 text-green-800">
                    <Leaf className="h-3 w-3 mr-1" />
                    Eco
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">{delivery.earnings}</div>
                <div className="text-xs text-muted-foreground">Standard fee</div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Customer Info */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <span className="font-medium text-sm">{delivery.customerName}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {delivery.items} item{delivery.items > 1 ? 's' : ''} • {delivery.weight}
                  </span>
                </div>
              </div>

              {/* Pickup Location */}
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">Pickup: {delivery.pickup.location}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {delivery.pickup.address}
                  </div>
                  <div className="text-xs text-blue-600">{delivery.pickup.time}</div>
                </div>
              </div>

              {/* Dropoff Location */}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">Delivery</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {delivery.dropoff.location}
                  </div>
                  <div className="text-xs text-green-600">{delivery.dropoff.time}</div>
                </div>
              </div>

              {/* Progress bar for in-progress deliveries */}
              {delivery.status === "in_progress" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{delivery.progress}%</span>
                  </div>
                  <Progress value={delivery.progress} className="h-2" />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border/50 mt-3">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {delivery.distance}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {delivery.estimatedTime}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 px-2">
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Message
                </Button>
                <Button size="sm" className="h-7 px-3 bg-green-600 hover:bg-green-700">
                  <Navigation className="h-3 w-3 mr-1" />
                  Navigate
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {!showFullView && deliveries.length > 2 && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm">
              View {deliveries.length - 2} more deliveries
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}