import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, X, Check, Clock, AlertTriangle, Package, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Notification {
  id: string;
  type: "new_delivery" | "delivery_update" | "route_change" | "urgent" | "payment";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: "high" | "medium" | "low";
  actionRequired?: boolean;
  deliveryId?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "new_delivery",
      title: "New Delivery Assignment",
      message: "PKG-105: Express delivery to Downtown. Pick up from Tech Store in 15 minutes.",
      timestamp: "2 min ago",
      isRead: false,
      priority: "high",
      actionRequired: true,
      deliveryId: "PKG-105"
    },
    {
      id: "2",
      type: "delivery_update",
      title: "Customer Update",
      message: "PKG-089: Customer requested contactless delivery. Leave at door.",
      timestamp: "5 min ago",
      isRead: false,
      priority: "medium",
      deliveryId: "PKG-089"
    },
    {
      id: "3",
      type: "route_change",
      title: "Route Optimized",
      message: "Your route has been updated to save 12 minutes. Check the new sequence.",
      timestamp: "8 min ago",
      isRead: false,
      priority: "medium"
    },
    {
      id: "4",
      type: "payment",
      title: "Daily Earnings Update",
      message: "You've earned $247.80 today. Great work!",
      timestamp: "1 hour ago",
      isRead: true,
      priority: "low"
    },
    {
      id: "5",
      type: "urgent",
      title: "Urgent: Package Damaged",
      message: "PKG-087: Customer reported damaged package. Please contact support.",
      timestamp: "2 hours ago",
      isRead: true,
      priority: "high",
      actionRequired: true
    }
  ]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_delivery":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "delivery_update":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "route_change":
        return <MapPin className="h-4 w-4 text-green-500" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "payment":
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50/50";
      case "medium":
        return "border-l-orange-500 bg-orange-50/50";
      case "low":
        return "border-l-green-500 bg-green-50/50";
      default:
        return "border-l-gray-500 bg-gray-50/50";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: isMobile ? '100%' : -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isMobile ? '100%' : -10 }}
        className={`
          ${isMobile 
            ? 'fixed bottom-0 left-0 right-0 z-50 max-h-[80vh]' 
            : 'absolute top-16 right-2 md:right-6 w-80 md:w-96 z-50'
          }
        `}
      >
        <Card className={`shadow-lg border-2 ${isMobile ? 'rounded-t-xl rounded-b-none' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={`p-0 overflow-y-auto ${isMobile ? 'max-h-[60vh]' : 'max-h-96'}`}>
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`
                    border-l-4 p-4 border-b hover:bg-muted/50 transition-colors 
                    ${getPriorityColor(notification.priority)} 
                    ${!notification.isRead ? "bg-blue-50/30" : ""}
                  `}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium leading-tight">{notification.title}</h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {notification.actionRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-tight">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                        {notification.deliveryId && (
                          <Button variant="outline" size="sm" className="h-6 text-xs">
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {notifications.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}