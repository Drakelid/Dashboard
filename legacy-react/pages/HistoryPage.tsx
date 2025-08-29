import { DeliveryHistory } from "../components/DeliveryHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Calendar, Download, Filter, TrendingUp, Package, Clock, Star } from "lucide-react";
import { motion } from "motion/react";

export function HistoryPage() {
  const historyStats = {
    totalDeliveries: 1247,
    thisWeek: 47,
    averageRating: 4.8,
    onTimePercentage: 94,
    thisMonth: 203,
    lastMonth: 189
  };

  const performanceData = [
    { period: "This Week", deliveries: 47, rating: 4.9, onTime: 96 },
    { period: "Last Week", deliveries: 52, rating: 4.8, onTime: 94 },
    { period: "This Month", deliveries: 203, rating: 4.8, onTime: 95 },
    { period: "Last Month", deliveries: 189, rating: 4.7, onTime: 92 }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Delivery History</h1>
          <p className="text-muted-foreground">
            Track your delivery performance and earnings over time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{historyStats.totalDeliveries}</div>
                  <div className="text-xs text-muted-foreground">Total Deliveries</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{historyStats.thisWeek}</div>
                  <div className="text-xs text-muted-foreground">This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-50">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{historyStats.averageRating}</div>
                  <div className="text-xs text-muted-foreground">Avg Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{historyStats.onTimePercentage}%</div>
                  <div className="text-xs text-muted-foreground">On Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Performance Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends
            </CardTitle>
            <CardDescription>Your delivery performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {performanceData.map((data, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="font-medium text-sm mb-3">{data.period}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deliveries</span>
                      <span className="font-medium">{data.deliveries}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-medium">{data.rating}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">On Time</span>
                      <span className="font-medium">{data.onTime}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <TabsList className="grid w-full md:w-auto grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Select defaultValue="recent">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="earnings">Highest Earnings</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </div>
          </div>

          <TabsContent value="all">
            <DeliveryHistory showFullView={true} />
          </TabsContent>

          <TabsContent value="today">
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No deliveries today yet</h3>
                <p className="text-sm text-muted-foreground">
                  Your completed deliveries for today will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="week">
            <DeliveryHistory showFullView={true} />
          </TabsContent>

          <TabsContent value="month">
            <DeliveryHistory showFullView={true} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}