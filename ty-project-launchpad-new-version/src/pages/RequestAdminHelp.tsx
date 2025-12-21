import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, MessageSquare, Lightbulb, FileText, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";

const RequestAdminHelp = () => {
  const [requestType, setRequestType] = useState("");
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const requestTypes = [
    { value: "synopsis_help", label: "Need help with synopsis writing", icon: FileText },
    { value: "idea_generation", label: "Need project idea generation", icon: Lightbulb },
    { value: "project_guidance", label: "Need project guidance", icon: MessageSquare },
    { value: "technical_support", label: "Technical support needed", icon: MessageSquare },
    { value: "other", label: "Other request", icon: MessageSquare },
  ];

  const handleSubmitRequest = async () => {
    if (!requestType || !description.trim()) {
      toast({
        title: "Error",
        description: "Please select a request type and provide a description",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const token = localStorage.getItem("tyforge_token");
      
      const response = await fetch(API_ENDPOINTS.ADMIN.REQUEST_HELP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          request_type: requestType,
          subject: requestType.replace('_', ' ').toUpperCase(),
          description: description,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit request");
      
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Your request has been submitted successfully! Our team will contact you soon.",
      });
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipToDashboard = () => {
    navigate("/dashboard");
  };

  const selectedRequestType = requestTypes.find(type => type.value === requestType);
  const IconComponent = selectedRequestType?.icon || MessageSquare;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Request Expert Help
            </h1>
            <p className="text-xl text-gray-600">
              Our experts are here to help you with your project. Tell us what you need assistance with.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">How can we help you?</CardTitle>
              <CardDescription>
                Select the type of assistance you need and provide details about your requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="request-type">Type of Request *</Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select the type of help you need" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about what you need help with..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="text-base"
                />
                <p className="text-sm text-gray-500">
                  The more details you provide, the better we can assist you.
                </p>
              </div>

              {requestType && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <IconComponent className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        {selectedRequestType?.label}
                      </h4>
                      <p className="text-blue-800 text-sm">
                        {requestType === "synopsis_help" && 
                          "Our expert writers will help you create a comprehensive synopsis based on your project idea and requirements."}
                        {requestType === "idea_generation" && 
                          "We'll help you brainstorm and generate innovative project ideas based on your interests and domain."}
                        {requestType === "project_guidance" && 
                          "Get step-by-step guidance throughout your project development journey from our experienced mentors."}
                        {requestType === "technical_support" && 
                          "Technical assistance for implementation, debugging, and optimization of your project."}
                        {requestType === "other" && 
                          "Tell us exactly what you need help with, and we'll connect you with the right expert."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigate("/project-setup")}
                  disabled={isProcessing}
                >
                  Back to Project Setup
                </Button>
                <div className="space-x-3">
                  <Button
                    variant="secondary"
                    onClick={handleSkipToDashboard}
                    disabled={isProcessing}
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={handleSubmitRequest}
                    disabled={isProcessing || !requestType || !description.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              What happens next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Expert Review</h4>
                  <p className="text-gray-600 text-sm">Our team will review your request and assign the best expert for your needs.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Initial Contact</h4>
                  <p className="text-gray-600 text-sm">You'll receive an email or call within 24 hours to discuss your requirements.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Solution Delivery</h4>
                  <p className="text-gray-600 text-sm">We'll work with you to deliver the perfect solution for your project needs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RequestAdminHelp;