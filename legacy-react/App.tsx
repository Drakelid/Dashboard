import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger, SidebarInset } from "./components/ui/sidebar";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { NotificationCenter } from "./components/NotificationCenter";
import { IsometricPackageBox } from "./components/IsometricPackageBox";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Input } from "./components/ui/input";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./components/ui/sheet";
import { 
  Bell, Settings, Wifi, WifiOff, Menu, Search, ChevronRight, 
  Navigation, MapPin, MessageSquare, Plus, Filter, Zap, 
  User, LogOut, HelpCircle, Moon, Sun, Smartphone,
  Home, Clock, Route, History, DollarSign, Keyboard,
  ChevronDown, Star, Shield, Package, Scale,
  CheckSquare, Target
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import samBringLogo from 'figma:asset/ace35a44b7dfc2175513d8e4be9a940662a9c48a.png';

// Import pages
import { DashboardPage } from "./pages/DashboardPage";
import { ActiveDeliveriesPage } from "./pages/ActiveDeliveriesPage";
import { RoutePlanningPage } from "./pages/RoutePlanningPage";
import { MessagesPage } from "./pages/MessagesPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EarningsPage } from "./pages/EarningsPage";
import { SupportPage } from "./pages/SupportPage";

export default function App() {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [activeDeliveries] = useState(5);
  const [todayEarnings] = useState("532 kr");
  const [currentWeight] = useState("12.5 kg");
  
  // Selected pickups state (will be updated by ActiveDeliveriesPage)
  const [selectedPickupsCount, setSelectedPickupsCount] = useState(0);
  const [selectedPickupsEarnings, setSelectedPickupsEarnings] = useState("0 kr");
  const [selectedPickupsWeight, setSelectedPickupsWeight] = useState("0 kg");
  
  // Active pickup dialog state (will be updated by ActiveDeliveriesPage)
  const [activePickup, setActivePickup] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setSearchFocused(true);
            break;
          case '1':
            e.preventDefault();
            handlePageChange('dashboard');
            break;
          case '2':
            e.preventDefault();
            handlePageChange('active');
            break;
          case '3':
            e.preventDefault();
            handlePageChange('route');
            break;
          case 'n':
            e.preventDefault();
            setNotificationOpen(!notificationOpen);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notificationOpen]);

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handlePageChange = useCallback((page: string) => {
    setIsLoading(true);
    setCurrentPage(page);
    setShowMobileNav(false);
    
    // Reset selected pickups when leaving active deliveries page
    if (page !== 'active') {
      setSelectedPickupsCount(0);
      setSelectedPickupsEarnings("0 kr");
      setSelectedPickupsWeight("0 kg");
      setActivePickup(null);
    }
    
    // Simulate loading for smooth transitions
    setTimeout(() => {
      setIsLoading(false);
    }, 150);
  }, []);

  const renderCurrentPage = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading {getPageTitle()}...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "active":
        return (
          <ActiveDeliveriesPage 
            onSelectedPickupsChange={(count, earnings, weight) => {
              setSelectedPickupsCount(count);
              setSelectedPickupsEarnings(earnings);
              setSelectedPickupsWeight(weight);
            }}
            onActivePickupChange={(pickup) => {
              setActivePickup(pickup);
            }}
          />
        );
      case "route":
        return <RoutePlanningPage />;
      case "messages":
        return <MessagesPage />;
      case "history":
        return <HistoryPage />;
      case "profile":
        return <ProfilePage />;
      case "earnings":
        return <EarningsPage />;
      case "support":
        return <SupportPage />;
      default:
        return <DashboardPage />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      active: "Active Deliveries",
      route: "Route Planning",
      messages: "Messages",
      history: "Delivery History",
      profile: "Profile",
      earnings: "Earnings",
      support: "Support"
    };
    return titles[currentPage as keyof typeof titles] || "SamBring";
  };

  const getPageDescription = () => {
    const descriptions = {
      dashboard: "Overview of your delivery performance",
      active: "Manage your current deliveries",
      route: "Plan and navigate your delivery routes",
      messages: "Customer communications",
      history: "Past delivery records",
      profile: "Your driver profile and settings",
      earnings: "Track your income and performance",
      support: "Get help and assistance"
    };
    return descriptions[currentPage as keyof typeof descriptions] || "Eco-friendly package delivery platform";
  };

  const getBreadcrumbItems = () => {
    const items = [
      { label: "SamBring", href: "/" },
      { label: getPageTitle(), href: `/${currentPage}` }
    ];
    return items;
  };





  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/20">
      <SidebarProvider>
        <DashboardSidebar currentPage={currentPage} onPageChange={handlePageChange} />
        <SidebarInset>
          {/* Enhanced Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-50 glass-effect border-b border-gray-200/60 shadow-sm"
          >
            <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
              {/* Left Section */}
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-xl transition-all hover-lift">
                    <Menu className="h-5 w-5" />
                  </SidebarTrigger>
                </div>

                {/* Breadcrumb Navigation */}
                <div className="hidden sm:flex items-center gap-2 min-w-0">
                  <Breadcrumb>
                    <BreadcrumbList>
                      {getBreadcrumbItems().map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center"
                        >
                          <BreadcrumbItem>
                            {index === getBreadcrumbItems().length - 1 ? (
                              <BreadcrumbPage className="font-semibold text-gray-900 max-w-[200px] truncate">
                                {item.label}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink 
                                href={item.href}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                              >
                                {item.label}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {index < getBreadcrumbItems().length - 1 && (
                            <BreadcrumbSeparator>
                              <ChevronRight className="h-4 w-4" />
                            </BreadcrumbSeparator>
                          )}
                        </motion.div>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>
              
              {/* Center Section - Search */}
              <div className="hidden lg:flex items-center justify-center flex-1 max-w-md">
                <div className="w-full max-w-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search deliveries, customers... (⌘K)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className={`pl-10 pr-4 py-2 w-full bg-white/80 border-gray-200 rounded-xl transition-all duration-200 ${
                        searchFocused ? 'ring-2 ring-blue-500/20 bg-white shadow-md' : 'hover:bg-white'
                      }`}
                    />
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                        onClick={() => setSearchQuery("")}
                      >
                        ×
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Section */}
              <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end">

                {/* Connection Status */}
                <motion.div 
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={toggleOnlineStatus}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={{ 
                      scale: isOnline ? [1, 1.2, 1] : 1,
                      opacity: isOnline ? [1, 0.7, 1] : 0.6
                    }}
                    transition={{ 
                      repeat: isOnline ? Infinity : 0,
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  >
                    {isOnline ? (
                      <Wifi className="h-4 w-4 text-green-600" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-600" />
                    )}
                  </motion.div>
                  <Badge
                    className={`cursor-pointer transition-all duration-200 text-xs px-3 py-1 font-medium group-hover:shadow-md ${
                      isOnline 
                        ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200" 
                        : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
                </motion.div>
                

                
                {/* Notifications */}
                <div className="relative">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setNotificationOpen(!notificationOpen)}
                      className="relative h-10 w-10 p-0 hover:bg-blue-50 rounded-xl transition-colors hover-lift"
                    >
                      <Bell className="h-5 w-5 text-gray-600" />
                      <AnimatePresence>
                        {unreadNotifications > 0 && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md"
                          >
                            {unreadNotifications > 9 ? "9+" : unreadNotifications}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                  
                  <NotificationCenter 
                    isOpen={notificationOpen}
                    onClose={() => setNotificationOpen(false)}
                  />
                </div>
                
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-colors">
                        <Avatar className="h-9 w-9 md:h-10 md:w-10 ring-2 ring-blue-100 hover:ring-blue-200 transition-all">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
                          <AvatarFallback className="text-sm font-medium bg-blue-100 text-blue-700">JD</AvatarFallback>
                        </Avatar>
                        <ChevronDown className="h-4 w-4 text-gray-500 hidden lg:block" />
                      </div>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 mt-2 glass-effect border border-gray-200">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">John Doe</p>
                        <p className="text-xs leading-none text-muted-foreground">john.doe@sambring.com</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            4.9 Rating
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handlePageChange('profile')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePageChange('earnings')} className="cursor-pointer">
                      <DollarSign className="mr-2 h-4 w-4" />
                      <span>Earnings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleDarkMode} className="cursor-pointer">
                      {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                      <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <Keyboard className="mr-2 h-4 w-4" />
                      <span>Keyboard Shortcuts</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePageChange('support')} className="cursor-pointer">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help & Support</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile Search Bar */}
            {isMobile && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: searchFocused ? 1 : 0, height: searchFocused ? 'auto' : 0 }}
                className="px-4 pb-4 border-t border-gray-200/60"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search deliveries, customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-white border-gray-200 rounded-xl"
                  />
                </div>
              </motion.div>
            )}
          </motion.header>
          
          {/* Page Content with Enhanced Transitions */}
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.2, 
                  ease: "easeInOut"
                }}
                className="h-full"
              >
                {renderCurrentPage()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="fixed bottom-0 left-0 right-0 z-40 glass-effect border-t border-gray-200/60 mobile-safe-bottom"
            >
              <div className="flex items-center justify-around py-2 px-4">
                {[
                  { id: 'dashboard', icon: Home, label: 'Home' },
                  { id: 'active', icon: Clock, label: 'Active', badge: activeDeliveries },
                  { id: 'route', icon: Route, label: 'Route' },
                  { id: 'messages', icon: MessageSquare, label: 'Messages', badge: 3 },
                  { id: 'earnings', icon: DollarSign, label: 'Earnings' }
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={`relative flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all tap-target ${
                      currentPage === item.id 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                    {item.badge && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}