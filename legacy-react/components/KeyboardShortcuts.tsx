import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Keyboard, Command } from "lucide-react";
import { motion } from "motion/react";

interface KeyboardShortcutsProps {
  children?: React.ReactNode;
}

export function KeyboardShortcuts({ children }: KeyboardShortcutsProps) {
  const shortcuts = [
    {
      category: "Navigation",
      items: [
        { keys: ["⌘", "1"], description: "Go to Dashboard" },
        { keys: ["⌘", "2"], description: "Go to Active Deliveries" },
        { keys: ["⌘", "3"], description: "Go to Route Planning" },
        { keys: ["⌘", "4"], description: "Go to Messages" },
        { keys: ["⌘", "5"], description: "Go to History" },
        { keys: ["⌘", "6"], description: "Go to Earnings" },
        { keys: ["⌘", "7"], description: "Go to Profile" },
        { keys: ["⌘", "8"], description: "Go to Support" },
      ]
    },
    {
      category: "Search & Actions",
      items: [
        { keys: ["⌘", "K"], description: "Open search" },
        { keys: ["⌘", "N"], description: "Toggle notifications" },
        { keys: ["⌘", "/"], description: "Show keyboard shortcuts" },
        { keys: ["⌘", "R"], description: "Refresh current page" },
        { keys: ["Esc"], description: "Close dialogs/modals" },
      ]
    },
    {
      category: "Delivery Actions",
      items: [
        { keys: ["⌘", "Shift", "N"], description: "Start navigation" },
        { keys: ["⌘", "Shift", "O"], description: "Optimize route" },
        { keys: ["⌘", "Shift", "M"], description: "Send message" },
        { keys: ["⌘", "Enter"], description: "Complete delivery" },
        { keys: ["⌘", "Shift", "P"], description: "Take photo (proof)" },
      ]
    },
    {
      category: "Interface",
      items: [
        { keys: ["⌘", "B"], description: "Toggle sidebar" },
        { keys: ["⌘", "D"], description: "Toggle dark mode" },
        { keys: ["⌘", ".", ], description: "Open settings" },
        { keys: ["⌘", "Shift", "?"], description: "Open help" },
      ]
    }
  ];

  const renderKey = (key: string) => (
    <Badge 
      key={key}
      className="bg-gray-100 text-gray-800 border border-gray-300 font-mono text-xs px-2 py-1 rounded-md"
    >
      {key}
    </Badge>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Keyboard className="h-4 w-4" />
            Shortcuts
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {shortcuts.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                {category.category}
                <div className="flex-1 h-px bg-gray-200" />
              </h3>
              
              <div className="grid gap-2">
                {category.items.map((shortcut, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-700">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map(renderKey)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Command className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">Pro Tip</p>
              <p className="text-xs text-blue-700">
                Use <Badge className="bg-blue-100 text-blue-800 font-mono text-xs px-1 py-0.5">⌘</Badge> + <Badge className="bg-blue-100 text-blue-800 font-mono text-xs px-1 py-0.5">/</Badge> anytime to quickly access these shortcuts. On Windows, use <Badge className="bg-blue-100 text-blue-800 font-mono text-xs px-1 py-0.5">Ctrl</Badge> instead of <Badge className="bg-blue-100 text-blue-800 font-mono text-xs px-1 py-0.5">⌘</Badge>.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}