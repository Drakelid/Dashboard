import { CustomerCommunication } from "../components/CustomerCommunication";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { MessageSquare, Phone, Search, Clock, Send, Users } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

export function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const messageStats = {
    activeChats: 3,
    pendingReplies: 2,
    totalToday: 14,
    avgResponseTime: "2m"
  };

  const activeChats = [
    {
      id: "PKG-002",
      customerName: "Michael Chen",
      customerPhone: "+1 (555) 987-6543",
      lastMessage: "Thanks! I'll be home in 10 minutes.",
      timestamp: "2 min ago",
      unread: 0,
      status: "online"
    },
    {
      id: "PKG-003",
      customerName: "Emma Thompson", 
      customerPhone: "+1 (555) 456-7890",
      lastMessage: "Can you leave it with the neighbor?",
      timestamp: "5 min ago",
      unread: 1,
      status: "away"
    },
    {
      id: "PKG-005",
      customerName: "Sarah Wilson",
      customerPhone: "+1 (555) 234-5678",
      lastMessage: "Running late, please wait 5 minutes",
      timestamp: "12 min ago",
      unread: 2,
      status: "offline"
    }
  ];

  const recentChats = [
    {
      id: "PKG-001",
      customerName: "David Rodriguez",
      lastMessage: "Package delivered successfully",
      timestamp: "1 hour ago",
      status: "delivered"
    },
    {
      id: "PKG-004",
      customerName: "Lisa Johnson",
      lastMessage: "Thank you for the quick delivery!",
      timestamp: "2 hours ago", 
      status: "delivered"
    },
    {
      id: "PKG-006",
      customerName: "Mark Williams",
      lastMessage: "Package received at reception",
      timestamp: "3 hours ago",
      status: "delivered"
    }
  ];

  const quickReplies = [
    "I'm on my way to your location",
    "Running 5 minutes late due to traffic",
    "Package delivered successfully",
    "Unable to deliver - please contact me",
    "I'm at your door",
    "Package left in secure location"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away": 
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      case "delivered":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
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
        <h1 className="text-xl md:text-2xl font-semibold">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with customers about their deliveries
        </p>
      </motion.div>

      {/* Message Stats */}
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
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{messageStats.activeChats}</div>
                  <div className="text-xs text-muted-foreground">Active Chats</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{messageStats.pendingReplies}</div>
                  <div className="text-xs text-muted-foreground">Pending Replies</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{messageStats.totalToday}</div>
                  <div className="text-xs text-muted-foreground">Messages Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <Send className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{messageStats.avgResponseTime}</div>
                  <div className="text-xs text-muted-foreground">Avg Response</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Chat List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations
              </CardTitle>
              <CardDescription>Customer communication threads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-3 mt-4">
                  {activeChats.map((chat) => (
                    <div key={chat.id} className="border rounded-lg p-3 hover:bg-muted/20 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">{chat.customerName.charAt(0)}</span>
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(chat.status)}`}></div>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{chat.customerName}</div>
                            <div className="text-xs text-muted-foreground">{chat.id}</div>
                          </div>
                        </div>
                        {chat.unread > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mb-1">
                        {chat.lastMessage}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {chat.timestamp}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="recent" className="space-y-3 mt-4">
                  {recentChats.map((chat) => (
                    <div key={chat.id} className="border rounded-lg p-3 hover:bg-muted/20 transition-colors cursor-pointer opacity-75">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">{chat.customerName.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{chat.customerName}</div>
                          <div className="text-xs text-muted-foreground">{chat.id}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mb-1">
                        {chat.lastMessage}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {chat.timestamp}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 space-y-6">
          <CustomerCommunication
            deliveryId="PKG-002"
            customerName="Michael Chen"
            customerPhone="+1 (555) 987-6543"
          />

          {/* Quick Replies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Quick Replies
              </CardTitle>
              <CardDescription>Common messages for faster communication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {quickReplies.map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto py-2 text-xs text-left"
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}