import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Camera, MapPin, Check, Clock, AlertTriangle, Upload, User } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProofOfDeliveryProps {
  deliveryId: string;
  customerName: string;
  address: string;
}

export function ProofOfDelivery({ deliveryId, customerName, address }: ProofOfDeliveryProps) {
  const [deliveryStatus, setDeliveryStatus] = useState<"in_progress" | "delivered" | "failed">("in_progress");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState("");

  const capturePhoto = () => {
    // Simulate photo capture
    const newPhoto = `https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=300&h=200&fit=crop`;
    setPhotos(prev => [...prev, newPhoto]);
  };

  const completeDelivery = () => {
    setDeliveryStatus("delivered");
  };

  const reportIssue = () => {
    setDeliveryStatus("failed");
  };

  const deliveryMethods = [
    "Hand to customer",
    "Left at front door",
    "Left with neighbor",
    "Left at reception/concierge",
    "Left in secure location",
    "Returned to depot"
  ];

  if (deliveryStatus === "delivered") {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" />
            Delivery Completed
          </CardTitle>
          <CardDescription>
            {deliveryId} delivered successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Delivered to</div>
              <div className="font-medium">{recipientName || customerName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Delivery method</div>
              <div className="font-medium">{deliveryMethod}</div>
            </div>
          </div>
          
          {photos.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Proof photos</div>
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo, index) => (
                  <ImageWithFallback
                    key={index}
                    src={photo}
                    alt={`Delivery proof ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              View Receipt
            </Button>
            <Button className="flex-1">
              Next Delivery
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (deliveryStatus === "failed") {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Delivery Issue Reported
          </CardTitle>
          <CardDescription>
            {deliveryId} - Issue reported to dispatch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 border border-red-200 rounded bg-white">
            <div className="text-sm text-red-600 mb-2">Issue Details:</div>
            <div className="text-sm">{deliveryNotes}</div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeliveryStatus("in_progress")}>
              Retry Delivery
            </Button>
            <Button>
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Proof of Delivery
        </CardTitle>
        <CardDescription>
          {deliveryId} - Complete delivery confirmation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">{customerName}</div>
              <div className="text-sm text-blue-700">{address}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Delivery Method</label>
            <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select delivery method" />
              </SelectTrigger>
              <SelectContent>
                {deliveryMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Recipient Name</label>
            <Input
              placeholder="Enter recipient name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Delivery Photos</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <ImageWithFallback
                    src={photo}
                    alt={`Delivery proof ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                  >
                    ×
                  </Button>
                </div>
              ))}
              
              <Button
                variant="outline"
                className="h-24 border-dashed border-2 flex flex-col items-center justify-center gap-1"
                onClick={capturePhoto}
              >
                <Camera className="h-6 w-6" />
                <span className="text-xs">Take Photo</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Take photos of the delivered package and delivery location
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Digital Signature</label>
            <div className="border rounded-lg p-4 bg-gray-50 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Customer signature required</p>
              <Button variant="outline" size="sm">
                Capture Signature
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Delivery Notes</label>
            <Textarea
              placeholder="Add any additional notes about the delivery..."
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={reportIssue} className="flex-1">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Issue
          </Button>
          <Button 
            onClick={completeDelivery} 
            className="flex-1"
            disabled={!deliveryMethod || photos.length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Complete Delivery
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}