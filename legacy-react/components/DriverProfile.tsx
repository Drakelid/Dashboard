import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Star, Award, Clock, TrendingUp, Package, Shield, Truck, MapPin } from "lucide-react";

export function DriverProfile() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader className="text-center">
          <Avatar className="h-24 w-24 mx-auto">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <CardTitle>John Doe</CardTitle>
          <CardDescription>Driver ID: PKG-DRV-2024-001</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge className="bg-green-100 text-green-800">Active • Online</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">January 2024</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vehicle Type</span>
              <span className="font-medium">Cargo Van</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">License Plate</span>
              <span className="font-medium">PKG-123</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Coverage Zone</span>
              <span className="font-medium">Downtown & Suburbs</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button className="flex-1">Update Profile</Button>
            <Button variant="outline" size="icon">
              <Truck className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Customer Rating</span>
                <span className="font-medium">4.9/5.0</span>
              </div>
              <Progress value={98} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Based on 156 reviews this month</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Delivery Success Rate</span>
                <span className="font-medium">99.2%</span>
              </div>
              <Progress value={99.2} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">On-Time Delivery</span>
                <span className="font-medium">96.8%</span>
              </div>
              <Progress value={96.8} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Package Handling Score</span>
                <span className="font-medium">98.5%</span>
              </div>
              <Progress value={98.5} className="h-2" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            <div className="text-center">
              <div className="font-bold text-lg">847</div>
              <div className="text-xs text-muted-foreground">Total Packages</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">18.3</div>
              <div className="text-xs text-muted-foreground">Daily Average</div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <Badge variant="outline" className="text-xs">Verified Driver</Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Earnings Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-bold text-2xl text-green-600">$247.80</div>
              <div className="text-xs text-muted-foreground">Today</div>
            </div>
            <div>
              <div className="font-bold text-2xl">$1,523.40</div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </div>
          </div>
          
          <div className="space-y-2 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Earnings</span>
              <span className="font-medium">$195.40</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tips Received</span>
              <span className="font-medium text-green-600">$52.40</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bonus (Express)</span>
              <span className="font-medium text-blue-600">$12.00</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-medium">Total Today</span>
              <span className="font-medium">$247.80</span>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <Badge variant="outline" className="text-xs">Top 10% Performer</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              <Badge variant="outline" className="text-xs">Express Certified</Badge>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            <Clock className="h-4 w-4 mr-2" />
            View Detailed Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}