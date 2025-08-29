import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { HelpCircle, Phone, MessageSquare, Mail, Search, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export function SupportPage() {
  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageSquare,
      available: true,
      estimatedWait: "< 2 min"
    },
    {
      title: "Phone Support", 
      description: "Call us for urgent delivery issues",
      icon: Phone,
      available: true,
      estimatedWait: "< 5 min"
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: Mail,
      available: true,
      estimatedWait: "< 4 hours"
    }
  ];

  const faqItems = [
    {
      question: "How do I report a damaged package?",
      answer: "If you encounter a damaged package, immediately take photos and contact customer support. Do not attempt delivery. Use the 'Report Issue' button in the active delivery screen."
    },
    {
      question: "What should I do if a customer isn't available?",
      answer: "Try calling the customer first. If no response, follow the delivery instructions (safe location, neighbor, etc.). If no instructions, contact support for guidance."
    },
    {
      question: "How are my earnings calculated?",
      answer: "Earnings include base delivery fee, distance bonus, time bonus, tips, and any applicable surge pricing. All earnings are calculated in real-time and updated in your earnings dashboard."
    },
    {
      question: "Can I change my delivery schedule?",
      answer: "Yes, you can update your availability in the Profile section. Changes take effect immediately, but you must complete any active deliveries first."
    },
    {
      question: "What happens if my vehicle breaks down?",
      answer: "Contact support immediately. We'll help reassign your deliveries and provide guidance on next steps. Keep emergency contact information easily accessible."
    },
    {
      question: "How do I update my payment information?",
      answer: "Go to Profile > Earnings > Payment Methods to add, remove, or update your payment information. Changes may take 1-2 business days to process."
    }
  ];

  const knowledgeBaseCategories = [
    {
      title: "Getting Started",
      articles: 12,
      description: "Basic setup and first delivery guides"
    },
    {
      title: "Delivery Process",
      articles: 18,
      description: "Step-by-step delivery procedures"
    },
    {
      title: "App Features",
      articles: 24,
      description: "How to use all app features effectively"
    },
    {
      title: "Payments & Earnings",
      articles: 15,
      description: "Understanding your payments and bonuses"
    },
    {
      title: "Vehicle & Safety",
      articles: 9,
      description: "Vehicle requirements and safety guidelines"
    },
    {
      title: "Troubleshooting",
      articles: 21,
      description: "Common issues and solutions"
    }
  ];

  const recentTickets = [
    {
      id: "SUPP-001",
      subject: "GPS navigation not working",
      status: "resolved",
      date: "Dec 18, 2023",
      category: "Technical"
    },
    {
      id: "SUPP-002", 
      subject: "Missing payment for delivery PKG-789",
      status: "in-progress",
      date: "Dec 17, 2023",
      category: "Payments"
    },
    {
      id: "SUPP-003",
      subject: "Customer complaint about delivery time",
      status: "closed",
      date: "Dec 15, 2023",
      category: "Delivery"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-xl md:text-2xl font-semibold">Support Center</h1>
        <p className="text-muted-foreground">
          Get help when you need it - we're here 24/7 for our drivers
        </p>
      </motion.div>

      {/* Quick Contact Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {supportOptions.map((option, index) => (
            <Card key={index} className="hover-lift cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <option.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{option.title}</h3>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={option.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {option.available ? "Available" : "Unavailable"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{option.estimatedWait}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Main Support Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Quick answers to common driver questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search FAQ..."
                    className="pl-9"
                  />
                </div>

                {/* FAQ Accordion */}
                <Accordion type="single" collapsible className="space-y-2">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Send us a message and we'll get back to you quickly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input placeholder="Brief description of your issue" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option value="">Select a category</option>
                      <option value="technical">Technical Issue</option>
                      <option value="delivery">Delivery Problem</option>
                      <option value="payment">Payment Issue</option>
                      <option value="account">Account Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea 
                    placeholder="Please describe your issue in detail..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Knowledge Base
                </CardTitle>
                <CardDescription>
                  Comprehensive guides and documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {knowledgeBaseCategories.map((category, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors cursor-pointer">
                      <h3 className="font-medium text-sm mb-2">{category.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{category.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {category.articles} articles
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          Browse →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  My Support Tickets
                </CardTitle>
                <CardDescription>
                  Track your submitted support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{ticket.id}</span>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{ticket.date}</span>
                      </div>
                      <div className="text-sm mb-2">{ticket.subject}</div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {ticket.category}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {recentTickets.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">No open tickets</h3>
                    <p className="text-sm text-muted-foreground">
                      You don't have any support tickets at the moment
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}