import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, Clock, DollarSign, Package, Star } from "lucide-react";

interface DeliveryHistoryProps {
  showFullView?: boolean;
}

export function DeliveryHistory({ showFullView = false }: DeliveryHistoryProps) {
  const recentDeliveries = [
    {
      id: "PKG-087",
      customerName: "Alex Thompson",
      sender: "Tech Store",
      deliveryTime: "3:22 PM",
      packageType: "Electronics",
      earnings: "$12.50",
      tip: "$5.00",
      rating: 5,
      distance: "2.1 km",
      duration: "16 min",
      weight: "1.8 kg"
    },
    {
      id: "PKG-086",
      customerName: "Maria Garcia",
      sender: "Fashion Hub",
      deliveryTime: "2:45 PM",
      packageType: "Clothing",
      earnings: "$8.75",
      tip: "$3.50",
      rating: 5,
      distance: "1.3 km",
      duration: "12 min",
      weight: "0.9 kg"
    },
    {
      id: "PKG-085",
      customerName: "Robert Kim",
      sender: "Pharmacy Plus",
      deliveryTime: "2:10 PM",
      packageType: "Medical",
      earnings: "$15.00",
      tip: "$8.00",
      rating: 5,
      distance: "3.2 km",
      duration: "22 min",
      weight: "0.3 kg"
    },
    {
      id: "PKG-084",
      customerName: "Jennifer Lee",
      sender: "Home Depot",
      deliveryTime: "1:35 PM",
      packageType: "Hardware",
      earnings: "$10.25",
      tip: "$4.75",
      rating: 4,
      distance: "2.8 km",
      duration: "19 min",
      weight: "5.2 kg"
    },
    {
      id: "PKG-083",
      customerName: "David Wilson",
      sender: "Book Store",
      deliveryTime: "1:05 PM",
      packageType: "Books",
      earnings: "$7.50",
      tip: "$2.50",
      rating: 5,
      distance: "1.6 km",
      duration: "14 min",
      weight: "1.1 kg"
    },
    {
      id: "PKG-082",
      customerName: "Lisa Chen",
      sender: "Grocery Market",
      deliveryTime: "12:30 PM",
      packageType: "Groceries",
      earnings: "$9.00",
      tip: "$6.00",
      rating: 5,
      distance: "2.5 km",
      duration: "18 min",
      weight: "3.4 kg"
    }
  ];

  const getRatingStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getPackageTypeColor = (type: string) => {
    const colors = {
      "Electronics": "bg-blue-100 text-blue-800",
      "Clothing": "bg-purple-100 text-purple-800",
      "Medical": "bg-red-100 text-red-800",
      "Hardware": "bg-orange-100 text-orange-800",
      "Books": "bg-green-100 text-green-800",
      "Groceries": "bg-yellow-100 text-yellow-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const displayedDeliveries = showFullView ? recentDeliveries : recentDeliveries.slice(0, 4);
  const totalEarnings = displayedDeliveries.reduce((sum, delivery) => 
    sum + parseFloat(delivery.earnings.slice(1)) + parseFloat(delivery.tip.slice(1)), 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Delivery History
        </CardTitle>
        <CardDescription>
          {showFullView ? "All completed deliveries today" : "Recent completed deliveries"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedDeliveries.map((delivery) => (
          <div key={delivery.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium text-sm">{delivery.id}</span>
                <Badge className={`text-xs ${getPackageTypeColor(delivery.packageType)}`}>
                  {delivery.packageType}
                </Badge>
              </div>
              <div className="text-sm font-medium text-green-600">
                +${(parseFloat(delivery.earnings.slice(1)) + parseFloat(delivery.tip.slice(1))).toFixed(2)}
              </div>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{delivery.sender} → {delivery.customerName}</span>
                <span className="text-muted-foreground">{delivery.deliveryTime}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {delivery.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {delivery.weight}
                  </div>
                  <div>{delivery.distance}</div>
                  <div>{getRatingStars(delivery.rating)}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span>Base: {delivery.earnings}</span>
                  <span>Tip: {delivery.tip}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {!showFullView && recentDeliveries.length > 4 && (
          <div className="text-center pt-2">
            <Badge variant="outline" className="text-xs">
              +{recentDeliveries.length - 4} more deliveries
            </Badge>
          </div>
        )}
        
        <div className="pt-3 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {showFullView ? "Today's Total" : "Shown Deliveries"}
            </span>
            <div className="flex items-center gap-3">
              <span>{displayedDeliveries.length} packages</span>
              <span className="font-medium text-green-600">${totalEarnings.toFixed(2)} earned</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}