import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Phone, MessageSquare, Send, Clock, Check, CheckCheck } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  sender: "driver" | "customer" | "system";
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

interface CustomerCommunicationProps {
  deliveryId: string;
  customerName: string;
  customerPhone: string;
}

export function CustomerCommunication({ 
  deliveryId, 
  customerName, 
  customerPhone 
}: CustomerCommunicationProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "call" | "sms">("chat");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "system",
      content: "Delivery has been assigned to your driver. ETA: 25 minutes",
      timestamp: "10:30 AM",
      status: "delivered"
    },
    {
      id: "2",
      sender: "customer",
      content: "Hi! I'm not home right now. Can you leave the package with my neighbor at apartment 2A?",
      timestamp: "10:45 AM",
      status: "read"
    },
    {
      id: "3",
      sender: "driver",
      content: "Hi Michael! I can definitely leave it with your neighbor. I'll need their name for the delivery confirmation.",
      timestamp: "10:47 AM",
      status: "read"
    },
    {
      id: "4",
      sender: "customer",
      content: "Great! Her name is Sarah Johnson. Thanks!",
      timestamp: "10:48 AM",
      status: "read"
    }
  ]);

  const quickReplies = [
    "I'm on my way to your location",
    "Running 5 minutes late due to traffic",
    "Package delivered successfully",
    "Unable to deliver - please contact me",
    "Package requires signature"
  ];

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      sender: "driver",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const sendQuickReply = (reply: string) => {
    const message: Message = {
      id: Date.now().toString(),
      sender: "driver",
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };
    
    setMessages(prev => [...prev, message]);
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Customer Communication
        </CardTitle>
        <CardDescription>
          {deliveryId} - {customerName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "chat" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("chat")}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Chat
          </Button>
          <Button
            variant={activeTab === "call" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("call")}
          >
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
          <Button
            variant={activeTab === "sms" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("sms")}
          >
            <Send className="h-4 w-4 mr-1" />
            SMS
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="h-64 overflow-y-auto border rounded-lg p-3 space-y-3 bg-muted/20">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "driver" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-2 text-sm ${
                        message.sender === "driver"
                          ? "bg-primary text-primary-foreground"
                          : message.sender === "customer"
                          ? "bg-white border"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div>{message.content}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">{message.timestamp}</span>
                        {message.sender === "driver" && (
                          <div className="ml-2">
                            {getMessageStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground mb-2">Quick Replies:</div>
                <div className="grid grid-cols-1 gap-2">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto py-2 text-xs"
                      onClick={() => sendQuickReply(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === "call" && (
            <motion.div
              key="call"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center p-6 border rounded-lg bg-muted/20">
                <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-medium mb-2">{customerName}</h4>
                <p className="text-sm text-muted-foreground mb-4">{customerPhone}</p>
                <Button className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Customer
                </Button>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Call History</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 border rounded text-sm">
                    <span>Outgoing call</span>
                    <div className="text-muted-foreground">
                      <span>10:35 AM • 1m 23s</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded text-sm">
                    <span>Incoming call</span>
                    <div className="text-muted-foreground">
                      <span>9:45 AM • 2m 45s</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "sms" && (
            <motion.div
              key="sms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Send SMS Update</h5>
                <Textarea
                  placeholder="Type your SMS message..."
                  className="min-h-[100px]"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    To: {customerPhone}
                  </span>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Send SMS
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium">SMS Templates</h5>
                <div className="space-y-2">
                  {[
                    "Your package is out for delivery. ETA: [TIME]",
                    "Delivery attempted - please contact for redelivery",
                    "Package delivered successfully to [LOCATION]",
                    "Unable to access delivery location - please advise"
                  ].map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto py-2 text-xs"
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}