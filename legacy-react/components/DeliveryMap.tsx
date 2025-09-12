import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  MapPin, 
  Navigation, 
  Route, 
  RotateCcw, 
  Maximize2,
  Car,
  Package,
  Home,
  Clock,
  Compass,
  Layers,
  Settings,
  AlertTriangle,
  CheckCircle,
  Leaf,
  Target,
  Plus,
  Minus,
  Locate,
  CloudRain,
  Sun,
  MapIcon,
  Satellite,
  TrafficCone,
  Users,
  Building,
  TreePine,
  Fuel,
  Coffee,
  Phone,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";

// Updated interface to match the actual data structure
interface DeliveryData {
  id: string;
  customer: {
    name: string;
    phone?: string;
  };
  pickup: {
    name?: string;
    address: string;
    coordinates: { lat: number; lng: number };
    time?: string;
    instructions?: string;
    contact?: string;
  };
  delivery: {
    address: string;
    coordinates: { lat: number; lng: number };
    instructions?: string;
    buzzerCode?: string;
  };
  status: string;
  priority: string;
  distance?: string;
  earnings: string;
  ecoFriendly: boolean;
}

interface DeliveryMapProps {
  currentDelivery: DeliveryData;
  deliveryStep: 'pickup' | 'delivery';
  driverLocation: { lat: number; lng: number };
  estimatedTime: number;
  onNavigate: () => void;
  onRecenter: () => void;
}

type MapMode = 'standard' | 'satellite' | 'traffic';
type TrafficLevel = 'low' | 'medium' | 'high';
type WeatherCondition = 'sunny' | 'cloudy' | 'rainy';

export function DeliveryMap({ 
  currentDelivery, 
  deliveryStep, 
  driverLocation, 
  estimatedTime,
  onNavigate,
  onRecenter 
}: DeliveryMapProps) {
  const [trafficLevel, setTrafficLevel] = useState<TrafficLevel>('medium');
  const [mapMode, setMapMode] = useState<MapMode>('standard');
  const [showMapControls, setShowMapControls] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeProgress, setRouteProgress] = useState(35);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [showPOIs, setShowPOIs] = useState(true);
  const [alternativeRoutes, setAlternativeRoutes] = useState(3);

  // Safety checks for data
  if (!currentDelivery || !currentDelivery.pickup || !currentDelivery.delivery) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Map Loading...</h3>
          <p className="text-gray-500">Please wait while we load your delivery route</p>
        </div>
      </div>
    );
  }

  const currentTarget = deliveryStep === 'pickup' 
    ? currentDelivery.pickup.coordinates 
    : currentDelivery.delivery.coordinates;

  const currentTargetName = deliveryStep === 'pickup'
    ? (currentDelivery.pickup.name || 'Pickup Location')
    : currentDelivery.customer.name;

  const currentTargetAddress = deliveryStep === 'pickup'
    ? currentDelivery.pickup.address
    : currentDelivery.delivery.address;

  // Handle navigation start
  const handleStartNavigation = useCallback(() => {
    setIsNavigating(true);
    onNavigate();
    toast.success("🧭 Turn-by-turn navigation started");
  }, [onNavigate]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(20, prev + 1));
    toast.info(`Zoom level: ${zoomLevel + 1}`);
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(8, prev - 1));
    toast.info(`Zoom level: ${zoomLevel - 1}`);
  }, [zoomLevel]);

  // Map mode cycling
  const handleMapModeToggle = useCallback(() => {
    const modes: MapMode[] = ['standard', 'satellite', 'traffic'];
    const currentIndex = modes.indexOf(mapMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setMapMode(nextMode);
    toast.info(`Map mode: ${nextMode}`);
  }, [mapMode]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate traffic changes
      const levels: TrafficLevel[] = ['low', 'medium', 'high'];
      setTrafficLevel(levels[Math.floor(Math.random() * levels.length)]);
      
      // Simulate route progress
      if (isNavigating) {
        setRouteProgress(prev => Math.min(100, prev + Math.random() * 5));
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isNavigating]);

  const getTrafficColor = (level: TrafficLevel) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden">
      {/* Simplified Map Background */}
      <div className="absolute inset-0 w-full h-full">
        {/* Base map with simple grid pattern */}
        <div 
          className="w-full h-full relative"
          style={{
            backgroundColor: mapMode === 'satellite' ? '#1a2332' : mapMode === 'traffic' ? '#f8fafb' : '#f0f8ff',
            backgroundImage: `
              linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        >
          {/* Oslo city blocks - simplified representation */}
          <div className="absolute inset-0">
            {/* Major roads */}
            <div className="absolute top-1/4 left-0 right-0 h-2 bg-white shadow-sm rounded-full opacity-80" />
            <div className="absolute top-1/2 left-0 right-0 h-3 bg-white shadow-md rounded-full opacity-90" />
            <div className="absolute top-3/4 left-0 right-0 h-2 bg-white shadow-sm rounded-full opacity-80" />
            
            <div className="absolute left-1/4 top-0 bottom-0 w-2 bg-white shadow-sm rounded-full opacity-80" />
            <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-white shadow-md rounded-full opacity-90" />
            <div className="absolute left-3/4 top-0 bottom-0 w-2 bg-white shadow-sm rounded-full opacity-80" />

            {/* Oslo Fjord */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-400/60 to-blue-300/40 rounded-t-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-transparent to-blue-400/20" />
            </div>

            {/* Landmarks */}
            {showPOIs && (
              <>
                {/* Opera House */}
                <div className="absolute bottom-28 right-1/3 w-6 h-4 bg-gray-200 rounded shadow-lg" />
                <div className="absolute bottom-20 right-1/3 text-xs text-gray-600 whitespace-nowrap">Opera House</div>
                
                {/* City Hall */}
                <div className="absolute bottom-32 left-1/3 w-4 h-8 bg-red-300 rounded shadow-lg" />
                <div className="absolute bottom-20 left-1/3 text-xs text-gray-600 whitespace-nowrap">City Hall</div>
                
                {/* Vigeland Park */}
                <div className="absolute top-1/4 left-1/5 w-12 h-12 bg-green-300 rounded-full shadow-lg opacity-80" />
                <div className="absolute top-1/4 left-1/5 mt-14 text-xs text-gray-600 whitespace-nowrap">Vigeland Park</div>
              </>
            )}
          </div>

          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={getTrafficColor(trafficLevel)} stopOpacity="0.8"/>
                <stop offset="50%" stopColor={getTrafficColor(trafficLevel)} stopOpacity="1"/>
                <stop offset="100%" stopColor={getTrafficColor(trafficLevel)} stopOpacity="0.8"/>
              </linearGradient>
            </defs>
            
            <motion.path
              d="M 15% 85% Q 30% 70% 45% 55% Q 60% 40% 75% 25%"
              stroke="url(#routeGradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ 
                pathLength: routeProgress / 100,
                opacity: isNavigating ? 1 : 0.8
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>

          {/* Driver location */}
          <div className="absolute bottom-[15%] left-[15%]">
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute -inset-6 bg-green-500/20 rounded-full animate-pulse" />
              <div className="relative w-6 h-6 bg-green-500 rounded-full shadow-lg flex items-center justify-center">
                <Car className="w-3 h-3 text-white" style={{ transform: 'rotate(45deg)' }} />
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded shadow-md">
                <span className="text-xs font-medium text-gray-800">You</span>
              </div>
            </motion.div>
          </div>

          {/* Pickup location */}
          <div className="absolute top-[45%] left-[45%]">
            <motion.div
              className="relative"
              animate={deliveryStep === 'pickup' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className={`absolute -inset-4 rounded-full animate-pulse ${
                deliveryStep === 'pickup' ? 'bg-orange-500/20' : 'bg-gray-500/10'
              }`} />
              <div className={`relative w-6 h-6 rounded-full shadow-lg flex items-center justify-center ${
                deliveryStep === 'pickup' ? 'bg-orange-500' : 'bg-gray-500'
              }`}>
                <Package className="w-3 h-3 text-white" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 px-2 py-1 rounded shadow-md max-w-24">
                <div className="text-xs font-semibold text-center truncate">
                  {currentDelivery.pickup.name || 'Pickup'}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Delivery location */}
          <div className="absolute top-[25%] right-[25%]">
            <motion.div
              className="relative"
              animate={deliveryStep === 'delivery' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className={`absolute -inset-4 rounded-full animate-pulse ${
                deliveryStep === 'delivery' ? 'bg-red-500/20' : 'bg-gray-500/10'
              }`} />
              <div className={`relative w-6 h-6 rounded-full shadow-lg flex items-center justify-center ${
                deliveryStep === 'delivery' ? 'bg-red-500' : 'bg-gray-500'
              }`}>
                <Home className="w-3 h-3 text-white" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 px-2 py-1 rounded shadow-md max-w-24">
                <div className="text-xs font-semibold text-center truncate">
                  {currentDelivery.customer.name}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Distance markers */}
          <div className="absolute top-[65%] left-[30%]">
            <div className="bg-blue-500 w-1.5 h-1.5 rounded-full" />
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 px-1 py-0.5 rounded text-xs">
              2.1 km
            </div>
          </div>

          <div className="absolute top-[35%] left-[60%]">
            <div className="bg-blue-500 w-1.5 h-1.5 rounded-full" />
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 px-1 py-0.5 rounded text-xs">
              4.8 km
            </div>
          </div>

          {/* Traffic indicators for traffic mode */}
          {mapMode === 'traffic' && (
            <>
              <div className="absolute top-[40%] left-[35%]">
                <motion.div
                  className="w-2 h-2 rounded-full bg-red-500"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-white/90 px-1 py-0.5 rounded text-xs">
                  Heavy
                </div>
              </div>
              
              <div className="absolute top-[50%] left-[55%]">
                <motion.div
                  className="w-2 h-2 rounded-full bg-yellow-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-white/90 px-1 py-0.5 rounded text-xs">
                  Medium
                </div>
              </div>
            </>
          )}

          {/* Compass */}
          <div className="absolute top-4 left-4 bg-white/90 rounded-full p-2 shadow-md">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="absolute w-0 h-0 border-l-1 border-r-1 border-b-2 border-transparent border-b-red-500 transform -translate-y-1" />
              <div className="absolute -bottom-1 text-xs font-bold text-gray-700">N</div>
            </div>
          </div>

          {/* Scale bar */}
          <div className="absolute bottom-4 left-4 bg-white/90 px-2 py-1 rounded shadow-md">
            <div className="flex items-center gap-1">
              <div className="w-12 h-0.5 bg-gray-800 relative">
                <div className="absolute left-0 -top-0.5 bottom-0 w-0.5 bg-gray-800" />
                <div className="absolute right-0 -top-0.5 bottom-0 w-0.5 bg-gray-800" />
              </div>
              <span className="text-xs text-gray-700">1 km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weather indicator */}
      <div className="absolute top-4 left-16 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
          <div className="flex items-center gap-2">
            {weather === 'sunny' ? <Sun className="h-3 w-3 text-yellow-500" /> :
             weather === 'cloudy' ? <CloudRain className="h-3 w-3 text-gray-500" /> :
             <CloudRain className="h-3 w-3 text-blue-500" />}
            <span className="text-xs font-medium text-gray-700">
              {weather === 'sunny' ? '18°C' : weather === 'cloudy' ? '14°C' : '12°C'}
            </span>
          </div>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl"
          onClick={() => setShowMapControls(!showMapControls)}
        >
          <Settings className="h-4 w-4" />
        </Button>

        <AnimatePresence>
          {showMapControls && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="space-y-2"
            >
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm shadow-lg"
                onClick={handleMapModeToggle}
              >
                {mapMode === 'satellite' ? <Satellite className="h-4 w-4" /> : 
                 mapMode === 'traffic' ? <TrafficCone className="h-4 w-4" /> : 
                 <MapIcon className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm shadow-lg"
                onClick={handleZoomIn}
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm shadow-lg"
                onClick={handleZoomOut}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm shadow-lg"
                onClick={() => {
                  onRecenter();
                  toast.info("📍 Map centered on your location");
                }}
              >
                <Locate className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm shadow-lg"
                onClick={() => {
                  setShowPOIs(!showPOIs);
                  toast.info(showPOIs ? "POIs hidden" : "POIs shown");
                }}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Start navigation button */}
      <div className="absolute bottom-4 left-4 z-10">
        <Button
          onClick={handleStartNavigation}
          className="bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isNavigating ? 'Navigating...' : 'Start Navigation'}
        </Button>
      </div>

      {/* Delivery progress overlay */}
      <div className="absolute bottom-4 right-4 z-10 max-w-sm">
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  deliveryStep === 'pickup' ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                <span className="font-medium text-sm">
                  {deliveryStep === 'pickup' ? 'Going to Pickup' : 'Going to Delivery'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                ETA: {estimatedTime} min
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {deliveryStep === 'pickup' ? (
                    <Package className="h-4 w-4 text-orange-600" />
                  ) : (
                    <Home className="h-4 w-4 text-red-600" />
                  )}
                  <span className="truncate max-w-24">{currentTargetName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">{currentDelivery.earnings}</span>
                  {currentDelivery.ecoFriendly && (
                    <Badge className="bg-green-100 text-green-800 text-xs px-1 py-0">
                      <Leaf className="h-2 w-2 mr-1" />
                      Eco
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-600 truncate">
                {currentTargetAddress}
              </div>

              <Progress 
                value={deliveryStep === 'pickup' ? 25 : 75} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick action buttons */}
      <div className="absolute bottom-20 right-4 z-10 space-y-2">
        <Button
          className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl rounded-full w-10 h-10 p-0"
          onClick={() => {
            toast.info("📞 Calling customer...");
          }}
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl rounded-full w-10 h-10 p-0"
          onClick={() => {
            toast.info("💬 Opening messages...");
          }}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}