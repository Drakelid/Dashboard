import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { DeliveryMap } from "../components/DeliveryMap";
import { DeliveryStatusTracker } from "../components/DeliveryStatusTracker";
import { IsometricPackageBox } from "../components/IsometricPackageBox";
import exampleImage from 'figma:asset/6341913202a76e31fc0bab35488b381709e70cad.png';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  Clock, 
  Package, 
  User, 
  Leaf, 
  CheckCircle, 
  AlertCircle,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Zap,
  Star,
  Camera,
  Home,
  Building,
  Car,
  Route,
  List,
  Map as MapIcon,
  Menu,
  Filter,
  SortDesc,
  Play,
  Pause,
  RefreshCw,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Settings,
  Eye,
  EyeOff,
  Compass,
  Layers,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  X,
  Check,
  Timer,
  DollarSign,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Minus,
  Target,
  TrendingUp,
  Vibrate,
  ArrowRight,
  Store,
  Users,
  Scale
} from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import { toast } from "sonner@2.0.3";

type DeliveryStatus = 'heading_to_pickup' | 'at_pickup' | 'heading_to_delivery' | 'at_delivery' | 'delivered';
type ViewMode = 'map' | 'pickups' | 'queue';

interface DeliveryItem {
  name: string;
  quantity: number;
  weight: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  special?: string | null;
}

interface Location {
  name?: string;
  address: string;
  time: string;
  coordinates: { lat: number; lng: number };
  instructions?: string;
  contact?: string;
  buzzerCode?: string;
}

interface Customer {
  name: string;
  phone: string;
}

interface Delivery {
  id: string;
  customer: Customer;
  pickup: Location;
  delivery: Location;
  items: DeliveryItem[];
  status: string;
  priority: 'standard' | 'express' | 'urgent';
  distance: string;
  earnings: string;
  ecoFriendly: boolean;
  totalWeight: string;
  estimatedDuration: string;
  deliveryInstructions?: string;
}

interface PickupRequest {
  id: string;
  pickupLocation: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  customer: Customer;
  deliveryAddress: {
    name?: string;
    address: string;
    instructions?: string;
  };
  items: DeliveryItem[];
  distance: string;
  estimatedTime: string;
  earnings: string;
  priority: 'standard' | 'express' | 'urgent';
  expiresIn: number; // seconds
  ecoFriendly: boolean;
}

interface ActiveDeliveriesPageProps {
  onSelectedPickupsChange?: (count: number, earnings: string, weight: string) => void;
  onActivePickupChange?: (pickup: PickupRequest | null) => void;
}

export function ActiveDeliveriesPage({ onSelectedPickupsChange, onActivePickupChange }: ActiveDeliveriesPageProps = {}) {
  // State management
  const [currentDelivery, setCurrentDelivery] = useState(0);
  const [deliveryStep, setDeliveryStep] = useState<DeliveryStatus>('heading_to_pickup');
  const [activeTab, setActiveTab] = useState<ViewMode>('pickups');
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [driverLocation, setDriverLocation] = useState({ lat: 59.9139, lng: 10.7522 });
  const [estimatedTime, setEstimatedTime] = useState(8);
  const [isOnline, setIsOnline] = useState(true);
  const [autoNavigation, setAutoNavigation] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'distance'>('distance');
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [compassMode, setCompassMode] = useState(false);
  
  // Pickup management states
  const [pendingPickups, setPendingPickups] = useState<PickupRequest[]>([]);
  const [activePickupDialog, setActivePickupDialog] = useState<PickupRequest | null>(null);
  const [acceptedPickups, setAcceptedPickups] = useState<string[]>([]);
  const [declinedPickups, setDeclinedPickups] = useState<string[]>([]);
  const [processedPackages, setProcessedPackages] = useState<Set<string>>(new Set()); // Track all packages that have been processed (shown, accepted, or declined)
  const [batchMode, setBatchMode] = useState(false);
  const [selectedPickups, setSelectedPickups] = useState<string[]>([]);
  const [showPickupDetails, setShowPickupDetails] = useState<string | null>(null);
  const [isDialogClosing, setIsDialogClosing] = useState(false);

  // Sample delivery data with standard 75kr delivery fee
  const deliveries: Delivery[] = [
    {
      id: "SB-002",
      customer: {
        name: "Emma Larsen",
        phone: "+47 987 65 432"
      },
      pickup: {
        name: "Rema 1000 Grünerløkka",
        address: "Thorvald Meyers gate 45, 0555 Oslo",
        time: "14:30",
        coordinates: { lat: 59.9231, lng: 10.7506 },
        instructions: "Ring doorbell at main entrance",
        contact: "+47 22 33 44 55"
      },
      delivery: {
        address: "Trondheimsveien 151B, 0560 Oslo",
        time: "15:15",
        coordinates: { lat: 59.9345, lng: 10.7623 },
        instructions: "2nd floor, apartment 23. Ring doorbell twice",
        buzzerCode: "2345"
      },
      items: [
        { 
          name: "Organic Vegetables", 
          quantity: 1, 
          weight: "2.5kg", 
          dimensions: { length: 30, width: 20, height: 15 },
          special: "Keep refrigerated" 
        },
        { 
          name: "Eco-friendly Cleaning Products", 
          quantity: 3, 
          weight: "1.2kg", 
          dimensions: { length: 25, width: 15, height: 20 },
          special: null 
        },
        { 
          name: "Local Bread", 
          quantity: 2, 
          weight: "0.8kg", 
          dimensions: { length: 35, width: 25, height: 8 },
          special: "Handle with care" 
        }
      ],
      status: "heading_to_pickup",
      priority: "standard",
      distance: "2.4 km",
      earnings: "75 kr",
      ecoFriendly: true,
      totalWeight: "4.5kg",
      estimatedDuration: "25 min",
      deliveryInstructions: "Customer prefers contactless delivery"
    }
  ];

  // Generate stable package ID based on content to avoid duplicates
  const generatePackageId = useCallback((pickup: any, customer: any, delivery: any, item: any): string => {
    // Create stable ID based on pickup location, customer, delivery address, and item details
    const content = `${pickup.name}-${customer.name}-${delivery.address}-${item.name}`;
    // Simple hash function to create shorter, stable IDs
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `pkg-${Math.abs(hash)}`;
  }, []);

  // Generate dynamic pickup requests based on driver location
  const generatePickupRequests = useCallback((): PickupRequest[] => {
    if (!isOnline) return [];

    const pickupLocations = [
      {
        name: "Kiwi Majorstuen",
        address: "Bogstadveien 55, 0366 Oslo",
        coordinates: { lat: 59.9298, lng: 10.7164 }
      },
      {
        name: "Rema 1000 Grønland",
        address: "Grønlandsleiret 38, 0190 Oslo",
        coordinates: { lat: 59.9145, lng: 10.7599 }
      },
      {
        name: "Meny Storo",
        address: "Vitaminveien 7, 0485 Oslo",
        coordinates: { lat: 59.9471, lng: 10.7704 }
      },
      {
        name: "ICA Nær Frogner",
        address: "Bygdøy Allé 39, 0262 Oslo",
        coordinates: { lat: 59.9157, lng: 10.7063 }
      },
      {
        name: "Coop Prix Sentrum",
        address: "Karl Johans gate 41, 0162 Oslo",
        coordinates: { lat: 59.9127, lng: 10.7461 }
      },
      {
        name: "Joker Grünerløkka",
        address: "Grüners gate 1, 0552 Oslo",
        coordinates: { lat: 59.9221, lng: 10.7595 }
      }
    ];

    const customers = [
      {
        name: "Sofia Hansen",
        phone: "+47 123 45 678"
      },
      {
        name: "Ole Kristiansen",
        phone: "+47 987 65 432"
      },
      {
        name: "Anna Nordahl",
        phone: "+47 456 78 901"
      },
      {
        name: "Erik Johansen",
        phone: "+47 111 22 333"
      },
      {
        name: "Maria Olsen",
        phone: "+47 444 55 666"
      }
    ];

    const deliveryAddresses = [
      {
        address: "Storgata 28, 0184 Oslo",
        instructions: "Office building, reception on ground floor"
      },
      {
        address: "Frognerveien 42, 0266 Oslo", 
        instructions: "2nd floor, apartment 15"
      },
      {
        address: "Grenseveien 92, 0193 Oslo",
        instructions: "Leave at doorstep if no answer"
      },
      {
        address: "Pilestredet 56, 0167 Oslo",
        instructions: "Ring doorbell twice, apartment 3A"
      },
      {
        address: "Torggata 16, 0181 Oslo",
        instructions: "Business address, ask for reception"
      }
    ];

    const itemTypes = [
      { name: "Grocery Order", weight: "2.5kg" },
      { name: "Pharmacy Items", weight: "1.2kg" },
      { name: "Electronics", weight: "3.1kg" },
      { name: "Books & Documents", weight: "1.8kg" },
      { name: "Clothing Package", weight: "1.4kg" }
    ];

    // Generate all possible unique combinations and filter out processed ones
    const allPossiblePackages = [];
    
    for (let i = 0; i < pickupLocations.length && allPossiblePackages.length < 20; i++) {
      for (let j = 0; j < customers.length && allPossiblePackages.length < 20; j++) {
        for (let k = 0; k < deliveryAddresses.length && allPossiblePackages.length < 20; k++) {
          for (let l = 0; l < itemTypes.length && allPossiblePackages.length < 20; l++) {
            const location = pickupLocations[i];
            const customer = customers[j];
            const deliveryAddress = deliveryAddresses[k];
            const itemType = itemTypes[l];
            
            const item = { 
              name: itemType.name, 
              quantity: 1,
              weight: itemType.weight,
              dimensions: {
                length: 20 + Math.floor(Math.random() * 15), // 20-35cm
                width: 15 + Math.floor(Math.random() * 10),  // 15-25cm
                height: 10 + Math.floor(Math.random() * 15)  // 10-25cm
              },
              special: Math.random() > 0.7 ? ["Keep refrigerated", "Fragile - Handle with care", "Keep upright", "Time sensitive"][Math.floor(Math.random() * 4)] : null
            };

            // Generate stable ID based on package content
            const stableId = generatePackageId(location, customer, deliveryAddress, item);
            
            // Only include if not processed before
            if (!processedPackages.has(stableId)) {
              allPossiblePackages.push({
                id: stableId,
                pickupLocation: location,
                customer: customer,
                deliveryAddress: deliveryAddress,
                items: [item],
                distance: `${(0.3 + Math.random() * 2.5).toFixed(1)} km`,
                estimatedTime: `${Math.floor(5 + Math.random() * 20)} min`,
                earnings: "75 kr",
                priority: ['standard', 'standard', 'express', 'urgent'][Math.floor(Math.random() * 4)] as 'standard' | 'express' | 'urgent',
                expiresIn: 180 + Math.floor(Math.random() * 240), // 3-7 minutes
                ecoFriendly: Math.random() > 0.4
              });
            }
          }
        }
      }
    }
    
    // Shuffle and return up to 3 packages
    const shuffled = allPossiblePackages.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length));
  }, [generatePackageId, processedPackages]);

  const currentOrder = deliveries[currentDelivery];

  // Generate pickup requests when driver goes online
  useEffect(() => {
    if (isOnline && pendingPickups.length === 0) {
      const newPickups = generatePickupRequests();
      setPendingPickups(newPickups);
      
      // Show first pickup notification after a delay
      setTimeout(() => {
        if (newPickups.length > 0 && !processedPackages.has(newPickups[0].id)) {
          setActivePickupDialog(newPickups[0]);
          setProcessedPackages(prev => new Set([...prev, newPickups[0].id]));
        }
      }, 2000);
    }
  }, [isOnline, pendingPickups.length, generatePickupRequests, processedPackages]);

  // Countdown timer for pickup requests and generate new ones
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingPickups(prev => {
        const updated = prev.map(pickup => ({
          ...pickup,
          expiresIn: Math.max(0, pickup.expiresIn - 1)
        })).filter(pickup => 
          pickup.expiresIn > 0 || 
          acceptedPickups.includes(pickup.id) || 
          declinedPickups.includes(pickup.id)
        );
        
        // Generate new pickups more frequently when online and there are fewer pending
        if (updated.filter(p => !acceptedPickups.includes(p.id) && !declinedPickups.includes(p.id)).length < 3 && isOnline && Math.random() > 0.80) {
          const newPickups = generatePickupRequests();
          const unprocessedPickups = newPickups.filter(pickup => 
            !processedPackages.has(pickup.id) && 
            !acceptedPickups.includes(pickup.id) && 
            !declinedPickups.includes(pickup.id) &&
            !updated.some(existing => existing.id === pickup.id)
          );
          
          if (unprocessedPickups.length > 0) {
            const randomPickup = unprocessedPickups[0];
            updated.push({
              ...randomPickup,
              expiresIn: 180 + Math.floor(Math.random() * 180) // 3-6 minutes
            });
          }
        }
        
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [acceptedPickups, declinedPickups, isOnline, generatePickupRequests, processedPackages]);

  // Sync activePickupDialog with updated pickup data
  useEffect(() => {
    if (activePickupDialog) {
      const updatedPickup = pendingPickups.find(p => p.id === activePickupDialog.id);
      if (updatedPickup) {
        setActivePickupDialog(updatedPickup);
      } else {
        // Pickup was removed, close dialog
        setActivePickupDialog(null);
      }
    }
  }, [pendingPickups, activePickupDialog?.id]);

  // Auto-show pickup dialogs for ALL new pickup requests that need action
  useEffect(() => {
    // Show dialogs for any unprocessed pickup that hasn't been processed before
    const unprocessedPickup = pendingPickups.find(p => 
      !processedPackages.has(p.id) &&
      !acceptedPickups.includes(p.id) && 
      !declinedPickups.includes(p.id) &&
      !activePickupDialog &&
      p.expiresIn > 0
    );
    
    if (unprocessedPickup && !isDialogClosing) {
      setActivePickupDialog(unprocessedPickup);
      // Mark this package as processed (shown)
      setProcessedPackages(prev => new Set([...prev, unprocessedPickup.id]));
    }
  }, [pendingPickups, acceptedPickups, declinedPickups, activePickupDialog, isDialogClosing, processedPackages]);

  // Queue system for multiple pickup requests
  useEffect(() => {
    // If dialog is closed and there are more pending pickups, show next one
    if (!activePickupDialog && !isDialogClosing) {
      const nextPickup = pendingPickups.find(p => 
        !processedPackages.has(p.id) &&
        !acceptedPickups.includes(p.id) && 
        !declinedPickups.includes(p.id) &&
        p.expiresIn > 0
      );
      
      if (nextPickup) {
        // Small delay to prevent rapid dialog switching
        setTimeout(() => {
          setActivePickupDialog(nextPickup);
          // Mark this package as processed (shown)
          setProcessedPackages(prev => new Set([...prev, nextPickup.id]));
        }, 1500);
      }
    }
  }, [activePickupDialog, isDialogClosing, pendingPickups, acceptedPickups, declinedPickups, processedPackages]);

  const handleAcceptPickup = useCallback((pickupId: string) => {
    const pickup = pendingPickups.find(p => p.id === pickupId);
    if (!pickup) return;

    // Set closing state to prevent dialog re-opening
    setIsDialogClosing(true);
    
    // Close dialog immediately
    setActivePickupDialog(null);
    
    // Mark package as processed and accepted
    setProcessedPackages(prev => new Set([...prev, pickupId]));
    setAcceptedPickups(prev => [...prev, pickupId]);
    
    // Show success toast
    toast.success(`✅ Pickup accepted! ${pickup.earnings} - ${pickup.pickupLocation.name}`, {
      duration: 4000,
      action: {
        label: "Navigate",
        onClick: () => handleNavigateToPickup(pickupId)
      }
    });
    
    // Play sound/vibration feedback
    if (soundEnabled) {
      navigator.vibrate?.(200);
    }
    
    // Reset closing state after a short delay
    setTimeout(() => {
      setIsDialogClosing(false);
    }, 1000);
  }, [pendingPickups, soundEnabled]);

  const handleDeclinePickup = useCallback((pickupId: string) => {
    const pickup = pendingPickups.find(p => p.id === pickupId);
    if (!pickup) return;

    // Set closing state to prevent dialog re-opening
    setIsDialogClosing(true);
    
    // Close dialog immediately
    setActivePickupDialog(null);
    
    // Mark package as processed and declined
    setProcessedPackages(prev => new Set([...prev, pickupId]));
    setDeclinedPickups(prev => [...prev, pickupId]);
    
    toast.info(`Pickup declined - ${pickup.pickupLocation.name}. Looking for more opportunities...`);
    
    // Reset closing state after a short delay
    setTimeout(() => {
      setIsDialogClosing(false);
    }, 1000);
  }, [pendingPickups]);

  const handleNavigateToPickup = useCallback((pickupId: string) => {
    const pickup = pendingPickups.find(p => p.id === pickupId);
    if (pickup) {
      toast.info(`🧭 Navigating to ${pickup.pickupLocation.name}`);
    }
  }, [pendingPickups]);

  const handleBatchAccept = useCallback(() => {
    const selectedPickupItems = pendingPickups.filter(p => selectedPickups.includes(p.id));
    const totalEarnings = selectedPickupItems.length * 75;
    
    // Mark all selected packages as processed and accepted
    setProcessedPackages(prev => new Set([...prev, ...selectedPickups]));
    setAcceptedPickups(prev => [...prev, ...selectedPickups]);
    setSelectedPickups([]);
    setBatchMode(false);
    
    toast.success(`🎉 ${selectedPickupItems.length} pickups accepted! Total: ${totalEarnings} kr`, {
      duration: 5000
    });
  }, [selectedPickups, pendingPickups]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setActivePickupDialog(null);
      setIsDialogClosing(false);
    }
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'express': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'express': return '⚡';
      default: return '📦';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter out declined pickups from main list, but keep accepted ones
  const activePickups = pendingPickups.filter(pickup => !declinedPickups.includes(pickup.id));
  
  // Count only pickups that haven't been processed yet for the pending count
  const pendingRequestsCount = activePickups.filter(p => 
    !processedPackages.has(p.id) && 
    !acceptedPickups.includes(p.id)
  ).length;
  
  const sortedPickups = [...activePickups].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { urgent: 3, express: 2, standard: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'time':
        return a.expiresIn - b.expiresIn;
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      default:
        return 0;
    }
  });

  // Update header stats when selected pickups change
  useEffect(() => {
    if (onSelectedPickupsChange) {
      const selectedPickupItems = pendingPickups.filter(p => selectedPickups.includes(p.id));
      const totalEarnings = selectedPickupItems.length * 75;
      const totalWeight = selectedPickupItems.reduce((acc, p) => acc + parseFloat(p.items[0].weight), 0);
      
      onSelectedPickupsChange(
        selectedPickups.length,
        `${totalEarnings} kr`,
        `${totalWeight.toFixed(1)} kg`
      );
    }
  }, [selectedPickups, pendingPickups, onSelectedPickupsChange]);

  // Update header when active pickup dialog changes
  useEffect(() => {
    if (onActivePickupChange) {
      onActivePickupChange(activePickupDialog);
    }
  }, [activePickupDialog, onActivePickupChange]);



  return (
    <div className="flex flex-col h-full bg-background">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-sm border-b border-border/50 flex-shrink-0"
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="font-medium text-sm">
                  {isOnline ? 'Online & Ready' : 'Offline'}
                </span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="text-sm text-muted-foreground">
                {pendingRequestsCount} awaiting response • {acceptedPickups.length} accepted
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBatchMode(!batchMode)}
                className={`h-8 px-3 ${batchMode ? 'bg-blue-100 text-blue-700' : ''}`}
              >
                <Package className="h-4 w-4 mr-1" />
                Batch
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="h-8 w-8 p-0"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4 text-green-500" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOnline(!isOnline)}
                className="h-8 px-3"
              >
                {isOnline ? <Wifi className="h-4 w-4 text-green-500 mr-1" /> : <WifiOff className="h-4 w-4 text-red-500 mr-1" />}
                {isOnline ? 'Go Offline' : 'Go Online'}
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewMode)} className="mt-3">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="pickups" className="flex items-center gap-2 text-xs">
                <Target className="h-3 w-3" />
                <span className="hidden sm:inline">Pickup Requests</span>
                <span className="sm:hidden">Pickups</span>
                {pendingRequestsCount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs ml-1 h-4 w-4 p-0 flex items-center justify-center">
                    {pendingRequestsCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2 text-xs">
                <MapIcon className="h-3 w-3" />
                <span className="hidden sm:inline">Map View</span>
                <span className="sm:hidden">Map</span>
              </TabsTrigger>
              <TabsTrigger value="queue" className="flex items-center gap-2 text-xs">
                <List className="h-3 w-3" />
                <span className="hidden sm:inline">Active Queue</span>
                <span className="sm:hidden">Queue</span>
                {acceptedPickups.length > 0 && (
                  <Badge className="bg-green-500 text-white text-xs ml-1 h-4 w-4 p-0 flex items-center justify-center">
                    {acceptedPickups.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* Main Content Area with proper height */}
      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewMode)} className="h-full">
          {/* Pickup Requests Tab */}
          <TabsContent value="pickups" className="h-full m-0 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-8"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    Filter
                  </Button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="distance">Distance</option>
                    <option value="priority">Priority</option>
                    <option value="time">Time Left</option>
                  </select>
                </div>

                {batchMode && selectedPickups.length > 0 && (
                  <Button
                    onClick={handleBatchAccept}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept {selectedPickups.length} ({selectedPickups.length * 75} kr)
                  </Button>
                )}
              </div>

              {/* No Pickups State */}
              {sortedPickups.length === 0 && (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pickup Requests</h3>
                    <p className="text-gray-500 mb-4">
                      {isOnline 
                        ? "You're online and ready! New pickup requests will appear here when available."
                        : "Go online to start receiving pickup requests from customers in your area."
                      }
                    </p>
                    {!isOnline && (
                      <Button 
                        onClick={() => setIsOnline(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Wifi className="h-4 w-4 mr-2" />
                        Go Online
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Pickup Request Cards */}
              <div className="space-y-3">
                {sortedPickups.map((pickup) => (
                  <motion.div
                    key={pickup.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className={`overflow-hidden transition-all duration-200 ${
                      acceptedPickups.includes(pickup.id) 
                        ? 'border-green-300 bg-green-50' 
                        : declinedPickups.includes(pickup.id)
                        ? 'border-gray-300 bg-gray-50'
                        : selectedPickups.includes(pickup.id)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            {batchMode && !acceptedPickups.includes(pickup.id) && !declinedPickups.includes(pickup.id) && (
                              <input
                                type="checkbox"
                                checked={selectedPickups.includes(pickup.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPickups(prev => [...prev, pickup.id]);
                                  } else {
                                    setSelectedPickups(prev => prev.filter(id => id !== pickup.id));
                                  }
                                }}
                                className="mt-1"
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{getPriorityIcon(pickup.priority)}</span>
                                <Badge className={`text-xs px-2 py-1 ${getPriorityColor(pickup.priority)}`}>
                                  {pickup.priority.charAt(0).toUpperCase() + pickup.priority.slice(1)}
                                </Badge>
                                {pickup.ecoFriendly && (
                                  <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1">
                                    <Leaf className="h-3 w-3 mr-1" />
                                    Eco
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                <strong>{pickup.pickupLocation.name}</strong> → {pickup.customer.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {pickup.distance} • {pickup.estimatedTime} • {pickup.items[0].weight}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-semibold text-green-600">
                              {pickup.earnings}
                            </div>
                            <div className="text-xs text-gray-500">
                              Expires in {formatTime(pickup.expiresIn)}
                            </div>
                          </div>
                        </div>

                        {/* Progress bar for time left */}
                        <div className="mb-3">
                          <Progress 
                            value={(pickup.expiresIn / 420) * 100} 
                            className="h-1"
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowPickupDetails(showPickupDetails === pickup.id ? null : pickup.id)}
                              className="h-8 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNavigateToPickup(pickup.id)}
                              className="h-8 text-xs"
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Navigate
                            </Button>
                          </div>

                          {!acceptedPickups.includes(pickup.id) && !declinedPickups.includes(pickup.id) && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeclinePickup(pickup.id)}
                                className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptPickup(pickup.id)}
                                className="h-8 text-xs bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Accept
                              </Button>
                            </div>
                          )}

                          {acceptedPickups.includes(pickup.id) && (
                            <Badge className="bg-green-100 text-green-700 px-3 py-1">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accepted
                            </Badge>
                          )}

                          {declinedPickups.includes(pickup.id) && (
                            <Badge className="bg-gray-100 text-gray-600 px-3 py-1">
                              <X className="h-3 w-3 mr-1" />
                              Declined
                            </Badge>
                          )}
                        </div>

                        {/* Expandable details */}
                        <AnimatePresence>
                          {showPickupDetails === pickup.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-3 pt-3 border-t border-gray-200"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-1">Pickup Details</h4>
                                  <p className="text-gray-600">📍 {pickup.pickupLocation.address}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-1">Delivery Details</h4>
                                  <p className="text-gray-600">🏠 {pickup.deliveryAddress.address}</p>
                                  {pickup.deliveryAddress.instructions && (
                                    <p className="text-gray-500 mt-1">💡 {pickup.deliveryAddress.instructions}</p>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-1">Customer</h4>
                                  <p className="text-gray-600">👤 {pickup.customer.name}</p>
                                  <p className="text-gray-600">📞 {pickup.customer.phone}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-1">Package</h4>
                                  <p className="text-gray-600">📦 {pickup.items[0]?.name || 'Package'}</p>
                                  <p className="text-gray-600">⚖️ {pickup.items[0]?.weight || '2.0kg'}</p>
                                  <p className="text-gray-600">📏 {pickup.items[0]?.dimensions?.length || 20}×{pickup.items[0]?.dimensions?.width || 15}×{pickup.items[0]?.dimensions?.height || 10}cm</p>
                                  {pickup.items[0]?.special && (
                                    <p className="text-orange-600 mt-1">⚠️ {pickup.items[0].special}</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Map View Tab */}
          <TabsContent value="map" className="h-full m-0">
            <div className="h-full relative">
              <DeliveryMap
                currentLocation={driverLocation}
                destination={currentOrder.pickup.coordinates}
                isFullscreen={mapFullscreen}
                onToggleFullscreen={() => setMapFullscreen(!mapFullscreen)}
              />

              {/* Map overlay controls */}
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="flex items-center justify-between">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Live Tracking</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="text-gray-600">ETA: {estimatedTime} min</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCompassMode(!compassMode)}
                      className={`bg-white/90 backdrop-blur-sm ${compassMode ? 'bg-blue-50 border-blue-300' : ''}`}
                    >
                      <Compass className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMapFullscreen(!mapFullscreen)}
                      className="bg-white/90 backdrop-blur-sm"
                    >
                      {mapFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Speed and navigation info */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Speed</div>
                        <div className="text-lg font-semibold">45 km/h</div>
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Distance</div>
                        <div className="text-lg font-semibold">{currentOrder.distance}</div>
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div className="text-center">
                        <div className="text-xs text-gray-500">ETA</div>
                        <div className="text-lg font-semibold">{estimatedTime} min</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVoiceGuidance(!voiceGuidance)}
                        className={voiceGuidance ? 'bg-green-50 border-green-300' : ''}
                      >
                        {voiceGuidance ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Active Queue Tab */}
          <TabsContent value="queue" className="h-full m-0 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Active Delivery Queue</h3>
                <Badge className="bg-green-100 text-green-700">
                  {acceptedPickups.length} Active
                </Badge>
              </div>

              {acceptedPickups.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-8 text-center">
                    <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Deliveries</h3>
                    <p className="text-gray-500">
                      Accepted pickup requests will appear here in your delivery queue.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingPickups
                    .filter(pickup => acceptedPickups.includes(pickup.id))
                    .map((pickup, index) => (
                      <Card key={pickup.id} className="border-green-300 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <Badge className="bg-green-600 text-white px-2 py-1">
                                #{index + 1}
                              </Badge>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{getPriorityIcon(pickup.priority)}</span>
                                  <Badge className={`text-xs px-2 py-1 ${getPriorityColor(pickup.priority)}`}>
                                    {pickup.priority.charAt(0).toUpperCase() + pickup.priority.slice(1)}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-700 font-medium">
                                  {pickup.pickupLocation.name} → {pickup.customer.name}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {pickup.distance} • {pickup.estimatedTime} • {pickup.items[0].weight}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-semibold text-green-600">
                                {pickup.earnings}
                              </div>
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Accepted
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNavigateToPickup(pickup.id)}
                              className="flex-1"
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Start Navigation
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-3"
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-3"
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Pickup Request Dialog */}
      <Dialog open={!!activePickupDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-xs mx-auto p-0 overflow-hidden bg-white rounded-xl shadow-xl">
          {activePickupDialog && (
            <div className="bg-white">
              {/* Accessibility Headers - Visually Hidden */}
              <DialogHeader className="sr-only">
                <DialogTitle>New Pickup Request</DialogTitle>
                <DialogDescription>
                  A new delivery opportunity is available in your area. Review the details and accept or decline the pickup request.
                </DialogDescription>
              </DialogHeader>

              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h3 className="text-sm font-semibold text-gray-900">New Pickup Request</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-md">
                    {activePickupDialog.priority}
                  </Badge>
                  <button 
                    onClick={() => handleDialogOpenChange(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Subtitle */}
              <div className="px-4 pb-4">
                <p className="text-xs text-gray-500">A new delivery opportunity is available in your area</p>
              </div>

              {/* Pickup and Delivery Info */}
              <div className="px-4 pb-4">
                <div className="space-y-3">
                  {/* Pickup from */}
                  <div className="flex items-start gap-3">
                    <Store className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-blue-600 mb-1">Pickup from:</div>
                      <div className="text-sm font-semibold text-gray-900">{activePickupDialog.pickupLocation.name}</div>
                      <div className="text-xs text-gray-500">{activePickupDialog.pickupLocation.address}</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>

                  {/* Deliver to */}
                  <div className="flex items-start gap-3">
                    <Home className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-green-600 mb-1">Deliver to:</div>
                      <div className="text-sm font-semibold text-gray-900">{activePickupDialog.customer.name}</div>
                      <div className="text-xs text-gray-500">{activePickupDialog.deliveryAddress.address}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time and Distance */}
              <div className="flex items-center justify-center gap-12 py-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{activePickupDialog.estimatedTime}</div>
                  <div className="text-xs text-gray-500">Estimated Time</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{activePickupDialog.distance}</div>
                  <div className="text-xs text-gray-500">Distance</div>
                </div>
              </div>

              {/* Package Details */}
              <div className="px-4 pb-4">
                <div className="text-sm font-semibold text-gray-900 mb-3">Package Details</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex flex-col items-center justify-center space-y-1 text-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {activePickupDialog.items[0]?.dimensions?.length || 29} × {activePickupDialog.items[0]?.dimensions?.width || 20} × {activePickupDialog.items[0]?.dimensions?.height || 11} cm
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                      <Scale className="h-3 w-3 text-orange-500" />
                      <span>{activePickupDialog.items[0]?.weight || '2.2kg'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Volume: {(((activePickupDialog.items[0]?.dimensions?.length || 29) * (activePickupDialog.items[0]?.dimensions?.width || 20) * (activePickupDialog.items[0]?.dimensions?.height || 11)) / 1000).toFixed(1)}L
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <IsometricPackageBox 
                      dimensions={{
                        length: activePickupDialog.items[0]?.dimensions?.length || 29,
                        width: activePickupDialog.items[0]?.dimensions?.width || 20,
                        height: activePickupDialog.items[0]?.dimensions?.height || 11
                      }}
                      weight={activePickupDialog.items[0]?.weight}
                      size="small"
                      showDimensions={false}
                      className="w-20 h-16"
                    />
                  </div>
                </div>
              </div>

              {/* Expiry Timer */}
              <div className="flex justify-center py-3">
                <div className="flex items-center gap-1 text-red-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Expires in {formatTime(activePickupDialog.expiresIn)}</span>
                </div>
              </div>

              {/* Earnings */}
              <div className="bg-green-50 py-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">75 kr</div>
                  <div className="text-xs text-green-700">delivery fee</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 p-4">
                <Button
                  variant="outline"
                  onClick={() => handleDeclinePickup(activePickupDialog.id)}
                  className="flex-1 h-12 text-gray-700 border-gray-300 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button
                  onClick={() => handleAcceptPickup(activePickupDialog.id)}
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}