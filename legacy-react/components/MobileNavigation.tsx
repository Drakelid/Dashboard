import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { 
  Home, Clock, Route, MessageSquare, DollarSign, History, 
  User, HelpCircle, Settings, Menu, X, ChevronRight,
  Navigation, MapPin, Bell, Zap, Plus
} from "lucide-react";
import { useState } from "react";

interface MobileNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  activeDeliveries: number;
  unreadMessages: number;
  isOnline: boolean;
}

export function MobileNavigation({ 
  currentPage, 
  onPageChange, 
  activeDeliveries, 
  unreadMessages,
  isOnline 
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const navigationItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: Home,
      badge: null,
      description: "Overview & stats"
    },
    {
      id: "active",
      title: "Active Deliveries",
      icon: Clock,
      badge: activeDeliveries,
      description: `${activeDeliveries} deliveries in progress`,
      badgeColor: "bg-green-500 text-white"
    },
    {
      id: "route",
      title: "Route Planning",
      icon: Route,
      badge: null,
      description: "Optimize your routes"
    },
    {
      id: "messages",
      title: "Messages",
      icon: MessageSquare,
      badge: unreadMessages,
      description: `${unreadMessages} unread messages`,
      badgeColor: "bg-blue-500 text-white"
    },
    {
      id: "history",
      title: "Delivery History",
      icon: History,
      badge: null,
      description: "Past deliveries"
    },
    {
      id: "earnings",
      title: "Earnings",
      icon: DollarSign,
      badge: null,
      description: "Track your income"
    },
    {
      id: "profile",
      title: "Profile",
      icon: User,
      badge: null,
      description: "Your driver profile"
    },
    {
      id: "support",
      title: "Support",
      icon: HelpCircle,
      badge: null,
      description: "Help & assistance"
    }
  ];

  const quickActions = [
    { icon: Navigation, label: "Start Navigation", color: "bg-green-500" },
    { icon: MapPin, label: "Current Location", color: "bg-blue-500" },
    { icon: Bell, label: "Notifications", color: "bg-purple-500" },
    { icon: Zap, label: "Optimize Route", color: "bg-orange-500" }
  ];

  const handleNavigation = (pageId: string) => {
    onPageChange(pageId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-gray-200/60"
      >
        <div className="flex items-center justify-around py-2 px-2 mobile-safe-bottom">
          {/* Main navigation items */}
          {[
            { id: 'dashboard', icon: Home, label: 'Home' },
            { id: 'active', icon: Clock, label: 'Active', badge: activeDeliveries },
            { id: 'route', icon: Route, label: 'Route' },
            { id: 'messages', icon: MessageSquare, label: 'Messages', badge: unreadMessages }
          ].map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all tap-target min-w-[60px] ${
                currentPage === item.id 
                  ? 'text-blue-600 bg-blue-100/80' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                animate={currentPage === item.id ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <item.icon className="h-5 w-5" />
              </motion.div>
              <span className="text-xs font-medium truncate">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md"
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </motion.div>
              )}
            </motion.button>
          ))}

          {/* Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <motion.button
                className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 tap-target"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                <Menu className="h-5 w-5" />
                <span className="text-xs font-medium">More</span>
              </motion.button>
            </SheetTrigger>
          </Sheet>
        </div>
      </motion.div>

      {/* Full Navigation Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 shadow-2xl">
          <SheetHeader className="pb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Navigation</SheetTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isOnline ? 'Online and ready for deliveries' : 'Offline'}
              </span>
            </div>
          </SheetHeader>

          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors tap-target"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-left">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Navigation Menu */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">All Pages</h3>
              <div className="space-y-2">
                {navigationItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all tap-target ${
                      currentPage === item.id
                        ? 'bg-blue-50 border-2 border-blue-200 text-blue-700'
                        : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-2 rounded-lg ${
                      currentPage === item.id 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        {item.badge && item.badge > 0 && (
                          <Badge className={`text-xs px-2 py-0.5 ${
                            item.badgeColor || 'bg-gray-500 text-white'
                          }`}>
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                    
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}