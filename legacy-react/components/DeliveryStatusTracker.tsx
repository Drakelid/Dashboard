import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Package, 
  Car, 
  Home, 
  Star,
  Phone,
  MessageSquare,
  Camera,
  AlertCircle,
  Navigation,
  Leaf,
  MapPin,
  User,
  Zap,
  PlayCircle,
  PauseCircle,
  SkipForward,
  RefreshCw,
  FileText,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";

type DeliveryStepStatus = 'completed' | 'active' | 'pending';
type CurrentStep = 'heading_to_pickup' | 'at_pickup' | 'heading_to_delivery' | 'at_delivery' | 'delivered';

interface DeliveryStep {
  id: string;
  title: string;
  description: string;
  status: DeliveryStepStatus;
  timestamp?: string;
  icon: React.ReactNode;
  estimatedTime?: string;
  completedTime?: string;
}

interface Customer {
  name: string;
  phone: string;
  avatar: string;
  rating: number;
}

interface DeliveryStatusTrackerProps {
  currentStep: CurrentStep;
  customer: Customer;
  earnings: string;
  ecoFriendly: boolean;
  onCallCustomer: () => void;
  onMessageCustomer: () => void;
  onTakePhoto: () => void;
  onConfirmStep: () => void;
}

export function DeliveryStatusTracker({
  currentStep,
  customer,
  earnings,
  ecoFriendly,
  onCallCustomer,
  onMessageCustomer,
  onTakePhoto,
  onConfirmStep
}: DeliveryStatusTrackerProps) {
  const [showProofOfDelivery, setShowProofOfDelivery] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const steps: DeliveryStep[] = [
    {
      id: 'heading_to_pickup',
      title: 'En route to pickup',
      description: 'Navigating to store location',
      status: currentStep === 'heading_to_pickup' ? 'active' : 
             ['at_pickup', 'heading_to_delivery', 'at_delivery', 'delivered'].includes(currentStep) ? 'completed' : 'pending',
      icon: <Car className="h-4 w-4" />,
      estimatedTime: currentStep === 'heading_to_pickup' ? '8 min' : undefined,
      completedTime: ['at_pickup', 'heading_to_delivery', 'at_delivery', 'delivered'].includes(currentStep) ? '14:22' : undefined
    },
    {
      id: 'at_pickup',
      title: 'At pickup location',
      description: 'Collecting items from store',
      status: currentStep === 'at_pickup' ? 'active' : 
             ['heading_to_delivery', 'at_delivery', 'delivered'].includes(currentStep) ? 'completed' : 'pending',
      icon: <Package className="h-4 w-4" />,
      timestamp: currentStep === 'at_pickup' ? 'Now' : undefined,
      completedTime: ['heading_to_delivery', 'at_delivery', 'delivered'].includes(currentStep) ? '14:35' : undefined
    },
    {
      id: 'heading_to_delivery',
      title: 'Delivering to customer',
      description: 'On the way to delivery address',
      status: currentStep === 'heading_to_delivery' ? 'active' : 
             ['at_delivery', 'delivered'].includes(currentStep) ? 'completed' : 'pending',
      icon: <Navigation className="h-4 w-4" />,
      estimatedTime: currentStep === 'heading_to_delivery' ? '12 min' : undefined,
      completedTime: ['at_delivery', 'delivered'].includes(currentStep) ? '14:48' : undefined
    },
    {
      id: 'at_delivery',
      title: 'At customer location',
      description: 'Ready to complete delivery',
      status: currentStep === 'at_delivery' ? 'active' : 
             currentStep === 'delivered' ? 'completed' : 'pending',
      icon: <Home className="h-4 w-4" />,
      timestamp: currentStep === 'at_delivery' ? 'Now' : undefined,
      completedTime: currentStep === 'delivered' ? '15:02' : undefined
    },
    {
      id: 'delivered',
      title: 'Delivery completed',
      description: 'Order successfully delivered',
      status: currentStep === 'delivered' ? 'completed' : 'pending',
      icon: <CheckCircle className="h-4 w-4" />,
      completedTime: currentStep === 'delivered' ? new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }) : undefined
    }
  ];

  const getStepProgress = () => {
    const stepIndex = steps.findIndex(step => step.id === currentStep);
    return ((stepIndex + 1) / steps.length) * 100;
  };

  const getStepIcon = (step: DeliveryStep) => {
    if (step.status === 'completed') {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center"
        >
          <CheckCircle className="h-4 w-4" />
        </motion.div>
      );
    } else if (step.status === 'active') {
      return (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center"
        >
          {step.icon}
        </motion.div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center">
          <Circle className="h-4 w-4" />
        </div>
      );
    }
  };

  const getStepContent = (step: DeliveryStep, index: number) => {
    const isActive = step.status === 'active';
    const isCompleted = step.status === 'completed';
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-200 ${
          isActive ? 'bg-blue-50 border border-blue-200' : 
          isCompleted ? 'bg-green-50 border border-green-200' : 
          'bg-gray-50 border border-gray-200'
        }`}
      >
        <div className="flex-shrink-0 relative">
          {getStepIcon(step)}
          {index < steps.length - 1 && (
            <div className={`absolute top-8 left-4 w-0.5 h-8 ${
              isCompleted ? 'bg-green-300' : 'bg-gray-300'
            }`} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm ${
            isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-500'
          }`}>
            {step.title}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {step.description}
            {step.estimatedTime && isActive && (
              <span className="ml-2 text-blue-600 font-medium">• ETA {step.estimatedTime}</span>
            )}
          </div>
          
          {/* Additional info for active step */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 p-2 bg-white/50 rounded border border-blue-200/50"
            >
              <div className="text-xs text-blue-700">
                {step.id === 'heading_to_pickup' && '🚗 Following optimal route with current traffic conditions'}
                {step.id === 'at_pickup' && '📦 Verify all items and confirm pickup with store staff'}
                {step.id === 'heading_to_delivery' && '🧭 Navigate to customer location using eco-friendly route'}
                {step.id === 'at_delivery' && '🏠 Ring doorbell and present order to customer'}
              </div>
            </motion.div>
          )}
        </div>
        
        <div className="text-right text-xs text-muted-foreground">
          {step.timestamp && (
            <Badge className="bg-blue-100 text-blue-800">
              {step.timestamp}
            </Badge>
          )}
          {step.completedTime && (
            <div className="text-green-600 font-medium">{step.completedTime}</div>
          )}
        </div>
      </motion.div>
    );
  };

  const getCurrentActionButton = () => {
    const handleAction = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onConfirmStep();
      setIsLoading(false);
    };

    switch (currentStep) {
      case 'heading_to_pickup':
        return (
          <Button 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 rounded-xl font-semibold shadow-lg"
            onClick={handleAction}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Package className="h-5 w-5" />
              )}
              <span>{isLoading ? 'Confirming...' : 'Confirm Arrival at Pickup'}</span>
            </div>
          </Button>
        );
      case 'at_pickup':
        return (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-semibold shadow-lg"
            onClick={handleAction}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Car className="h-5 w-5" />
              )}
              <span>{isLoading ? 'Starting...' : 'Items Collected - Start Delivery'}</span>
            </div>
          </Button>
        );
      case 'heading_to_delivery':
        return (
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-xl font-semibold shadow-lg"
            onClick={handleAction}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Home className="h-5 w-5" />
              )}
              <span>{isLoading ? 'Confirming...' : 'Arrived at Customer Location'}</span>
            </div>
          </Button>
        );
      case 'at_delivery':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-12 rounded-xl font-semibold border-2"
                onClick={() => setShowProofOfDelivery(true)}
              >
                <div className="flex items-center justify-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span>Take Photo</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-12 rounded-xl font-semibold border-2"
                onClick={() => setShowNotes(true)}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Add Notes</span>
                </div>
              </Button>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl font-semibold shadow-lg"
              onClick={handleAction}
              disabled={isLoading}
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                <span>{isLoading ? 'Completing...' : 'Complete Delivery'}</span>
              </div>
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleAddNotes = useCallback(() => {
    if (deliveryNotes.trim()) {
      toast.success("📝 Notes added to delivery");
      setShowNotes(false);
      setDeliveryNotes('');
    }
  }, [deliveryNotes]);

  return (
    <div className="space-y-6">
      {/* Enhanced Customer Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 ring-4 ring-white shadow-lg">
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                  />
                </div>
                <div>
                  <div className="font-bold text-lg">{customer.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{customer.rating}</span>
                    </div>
                    {ecoFriendly && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-green-600">
                          <Leaf className="h-4 w-4" />
                          <span className="font-medium">Eco-delivery</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-2xl text-green-600">{earnings}</div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Delivery Progress
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {Math.round(getStepProgress())}% Complete
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 mb-4">
              <Progress value={getStepProgress()} className="h-3 rounded-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Started</span>
                <span>In Progress</span>
                <span>Delivered</span>
              </div>
            </div>
            
            {/* Current step highlight */}
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  {steps.find(s => s.status === 'active')?.icon}
                </div>
                <div>
                  <div className="font-semibold text-blue-700">
                    {steps.find(s => s.status === 'active')?.title}
                  </div>
                  <div className="text-sm text-blue-600">
                    {steps.find(s => s.status === 'active')?.description}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Status Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-green-500" />
              Delivery Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id}>
                  {getStepContent(step, index)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Communication Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              Customer Communication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={onCallCustomer}
                className="h-12 rounded-xl font-semibold border-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>Call Customer</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                onClick={onMessageCustomer}
                className="h-12 rounded-xl font-semibold border-2 hover:bg-green-50 hover:border-green-300"
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span>Send Message</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {getCurrentActionButton()}
      </motion.div>

      {/* Issues/Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-orange-200 bg-orange-50 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <div className="font-semibold">Need help with this delivery?</div>
                <div className="text-sm text-orange-700 mt-1">
                  Contact support or report an issue
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="ghost" size="sm" className="text-orange-700 hover:bg-orange-100">
                Report Problem
              </Button>
              <Button variant="ghost" size="sm" className="text-orange-700 hover:bg-orange-100">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Proof of Delivery Modal */}
      <AnimatePresence>
        {showProofOfDelivery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowProofOfDelivery(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-4 text-center">📸 Proof of Delivery</h3>
              
              {/* Camera placeholder */}
              <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Tap to take photo</p>
                  <p className="text-xs text-gray-500 mt-1">Photo will be sent to customer</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-semibold"
                  onClick={() => {
                    onTakePhoto();
                    setShowProofOfDelivery(false);
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl font-semibold"
                  onClick={() => setShowProofOfDelivery(false)}
                >
                  Skip Photo
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Modal */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowNotes(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-4">📝 Delivery Notes</h3>
              
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any notes about this delivery..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
              />
              
              <div className="flex gap-3 mt-4">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-semibold"
                  onClick={handleAddNotes}
                  disabled={!deliveryNotes.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Add Notes
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl font-semibold"
                  onClick={() => setShowNotes(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}