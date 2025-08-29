import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Home, Clock, Route, MessageSquare, History, User, DollarSign, HelpCircle, Settings, Leaf, TrendingUp } from "lucide-react";
import samBringLogo from 'figma:asset/ace35a44b7dfc2175513d8e4be9a940662a9c48a.png';
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface DashboardSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function DashboardSidebar({ currentPage, onPageChange }: DashboardSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const primaryNavigationItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: Home,
      badge: null,
      description: "Overview & performance",
      shortcut: "⌘1"
    },
    {
      id: "active",
      title: "Active Deliveries",
      icon: Clock,
      badge: "5",
      description: "Current deliveries",
      badgeColor: "bg-green-500 text-white animate-pulse-gentle",
      shortcut: "⌘2"
    },
    {
      id: "route",
      title: "Route Planning",
      icon: Route,
      badge: null,
      description: "Optimize your routes",
      shortcut: "⌘3"
    },
    {
      id: "messages",
      title: "Messages",
      icon: MessageSquare,
      badge: "3",
      description: "Customer communications",
      badgeColor: "bg-blue-500 text-white",
      shortcut: "⌘4"
    }
  ];

  const secondaryNavigationItems = [
    {
      id: "history",
      title: "History",
      icon: History,
      badge: null,
      description: "Past deliveries",
      shortcut: "⌘5"
    },
    {
      id: "earnings",
      title: "Earnings",
      icon: DollarSign,
      badge: null,
      description: "Income & performance",
      shortcut: "⌘6"
    },
    {
      id: "profile",
      title: "Profile",
      icon: User,
      badge: null,
      description: "Your driver profile",
      shortcut: "⌘7"
    },
    {
      id: "support",
      title: "Support",
      icon: HelpCircle,
      badge: null,
      description: "Help & assistance",
      shortcut: "⌘8"
    }
  ];



  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
  };

  const renderNavigationItem = (item: any, index: number) => (
    <SidebarMenuItem key={item.id}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        onHoverStart={() => setHoveredItem(item.id)}
        onHoverEnd={() => setHoveredItem(null)}
      >
        <SidebarMenuButton
          onClick={() => handlePageChange(item.id)}
          isActive={currentPage === item.id}
          className={`group w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-sm relative overflow-hidden ${
            currentPage === item.id 
              ? "nav-active text-white shadow-md hover:shadow-lg" 
              : "nav-item text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50"
          }`}
        >
          {/* Background gradient on hover */}
          <AnimatePresence>
            {hoveredItem === item.id && currentPage !== item.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5 rounded-xl"
              />
            )}
          </AnimatePresence>

          {/* Left section with icon and text */}
          <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10 overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.1, rotate: currentPage === item.id ? 0 : 5 }}
              whileTap={{ scale: 0.9 }}
              className={`transition-transform flex-shrink-0 ${
                currentPage === item.id ? "text-white" : "text-gray-500 group-hover:text-blue-600"
              }`}
            >
              <item.icon className="h-5 w-5" />
            </motion.div>
            
            <div className="flex-1 text-left min-w-0">
              <div className={`font-medium text-sm truncate ${
                currentPage === item.id ? "text-white" : "text-gray-900"
              }`}>
                {item.title}
              </div>
              <div className={`text-xs transition-all duration-200 truncate ${
                currentPage === item.id ? "text-white/80" : "text-gray-500"
              } ${hoveredItem === item.id || currentPage === item.id ? 'block' : 'hidden lg:block'}`}>
                {item.description}
              </div>
            </div>
          </div>
          
          {/* Right section with badges and shortcuts */}
          <div className="flex items-center gap-2 flex-shrink-0 relative z-10 overflow-hidden">
            {item.badge && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="flex-shrink-0"
              >
                <Badge 
                  className={`text-xs px-2 py-1 font-bold shadow-sm border-0 ${
                    item.badgeColor || (
                      currentPage === item.id 
                        ? "bg-white text-blue-600" 
                        : "bg-blue-500 text-white"
                    )
                  }`}
                >
                  {item.badge}
                </Badge>
              </motion.div>
            )}
            
            {hoveredItem === item.id && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`text-xs px-2 py-1 rounded-md font-mono flex-shrink-0 ${
                  currentPage === item.id 
                    ? "bg-white/20 text-white/70" 
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.shortcut}
              </motion.div>
            )}
          </div>
        </SidebarMenuButton>
      </motion.div>
    </SidebarMenuItem>
  );

  return (
    <Sidebar className="border-r-0 bg-white/95 backdrop-blur-sm shadow-xl overflow-hidden">
      <SidebarHeader className="border-b border-gray-200/60 bg-gradient-to-br from-green-50 via-blue-50 to-white">
        <motion.div 
          className="flex items-center gap-3 px-4 py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="h-10 w-10 rounded-xl overflow-hidden shadow-lg ring-2 ring-green-200 hover:ring-green-300 transition-all"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src={samBringLogo} 
              alt="SamBring Logo" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">SamBring</h2>
            <motion.div 
              className="flex items-center gap-1 text-xs text-green-600 font-medium"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Leaf className="h-3 w-3" />
              <span>Eco-Delivery Dashboard</span>
            </motion.div>
          </div>
        </motion.div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4 space-y-6 overflow-y-auto overflow-x-hidden">
        {/* Primary Navigation */}
        <div>
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main Navigation
          </div>
          <SidebarMenu className="space-y-2">
            {primaryNavigationItems.map((item, index) => renderNavigationItem(item, index))}
          </SidebarMenu>
        </div>

        <Separator className="mx-4" />

        {/* Secondary Navigation */}
        <div>
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Data & Settings
          </div>
          <SidebarMenu className="space-y-2">
            {secondaryNavigationItems.map((item, index) => 
              renderNavigationItem(item, index + primaryNavigationItems.length)
            )}
          </SidebarMenu>
        </div>


      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200/60 p-4 bg-gradient-to-r from-gray-50 to-green-50/30">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >


          {/* Settings */}
          <motion.div 
            className="flex items-center gap-3 p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer transition-all hover-lift"
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="h-4 w-4" />
            <span className="font-medium">Settings</span>
          </motion.div>
          
          {/* Version Info */}
          <div className="text-xs text-gray-500 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">SamBring Driver</span>
              <Badge className="bg-green-100 text-green-700 text-xs">v2.1.0</Badge>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <TrendingUp className="h-3 w-3" />
              <span>Eco-Delivery Edition</span>
            </div>
          </div>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}