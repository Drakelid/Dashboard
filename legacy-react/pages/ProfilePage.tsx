import { DriverProfile } from "../components/DriverProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { User, Settings, Bell, Shield, Smartphone, Car, LogOut } from "lucide-react";
import { motion } from "motion/react";

export function ProfilePage() {
  const notificationSettings = [
    { id: "delivery-updates", label: "Delivery Updates", description: "Get notified about new delivery assignments", enabled: true },
    { id: "route-changes", label: "Route Changes", description: "Alerts when your route is optimized", enabled: true },
    { id: "customer-messages", label: "Customer Messages", description: "Notifications for new messages", enabled: true },
    { id: "earnings-updates", label: "Earnings Updates", description: "Daily and weekly earnings summaries", enabled: false },
    { id: "maintenance-reminders", label: "Vehicle Maintenance", description: "Reminders for vehicle check-ups", enabled: true }
  ];

  const accountSettings = [
    { id: "location-sharing", label: "Location Sharing", description: "Share location with customers during delivery", enabled: true },
    { id: "auto-navigation", label: "Auto Navigation", description: "Automatically start navigation to next delivery", enabled: true },
    { id: "offline-mode", label: "Offline Mode", description: "Work without internet connection", enabled: false },
    { id: "voice-guidance", label: "Voice Guidance", description: "Audio directions and updates", enabled: true }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-xl md:text-2xl font-semibold">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* Driver Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DriverProfile />
      </motion.div>

      {/* Settings Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Customize how you receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationSettings.map((setting, index) => (
              <div key={setting.id}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={setting.id} className="text-sm font-medium">
                      {setting.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    id={setting.id}
                    defaultChecked={setting.enabled}
                  />
                </div>
                {index < notificationSettings.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              App Settings
            </CardTitle>
            <CardDescription>
              Configure app behavior and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accountSettings.map((setting, index) => (
              <div key={setting.id}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={setting.id} className="text-sm font-medium">
                      {setting.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    id={setting.id}
                    defaultChecked={setting.enabled}
                  />
                </div>
                {index < accountSettings.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
            <CardDescription>
              Your registered delivery vehicle details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Make & Model</Label>
                <p className="font-medium">Honda Civic 2022</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">License Plate</Label>
                <p className="font-medium">ABC-1234</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Insurance</Label>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Valid</Badge>
                  <span className="text-sm">Expires: Dec 2024</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Inspection</Label>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Current</Badge>
                  <span className="text-sm">Next: Mar 2024</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full" size="sm">
              Update Vehicle Info
            </Button>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your account security and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <User className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <p className="text-xs text-muted-foreground">
                You'll need to sign in again to access your account
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}