import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  blog_included: boolean;
  max_projects: number;
  support_level: string;
}

const PlanSelection = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // Get selected service from localStorage
  React.useEffect(() => {
    const service = localStorage.getItem('selected_service');
    if (!service) {
      // No service selected, redirect to service selection page
      navigate('/choose-service');
      return;
    }
    setSelectedService(service);
  }, [navigate]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("tyforge_token");
      const response = await fetch(API_ENDPOINTS.PLANS.LIST, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch plans");
      
      const data = await response.json();
      
      // Convert features string to array
      const plansWithArrayFeatures = data.map((plan: any) => ({
        ...plan,
        features: typeof plan.features === 'string' 
          ? plan.features.split(',').map((f: string) => f.trim())
          : plan.features
      }));
      
      setPlans(plansWithArrayFeatures);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelection = async () => {
    if (!selectedPlan) {
      toast({
        title: "Error",
        description: "Please select a plan to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const token = localStorage.getItem("tyforge_token");
      
      const response = await fetch(API_ENDPOINTS.PLANS.SELECT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: selectedPlan,
          service_type: selectedService,
        }),
      });

      if (!response.ok) throw new Error("Failed to select plan");
      
      toast({
        title: "Success",
        description: "Plan selected successfully! Let's set up your project.",
      });
      
      navigate("/project-setup");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Service Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
              <span className="text-2xl">
                {selectedService === 'web-app' ? '💻' : '🔌'}
              </span>
              <span className="text-blue-900 font-semibold">
                {selectedService === 'web-app' ? 'Web & App Development' : 'IoT Projects'}
              </span>
            </div>
            <button 
              onClick={() => navigate('/choose-service')}
              className="ml-4 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Change Service
            </button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the perfect plan for your final year project needs. All plans include 
              expert guidance and support throughout your project journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  plan.name === "Standard Plan" 
                    ? "border-blue-500 border-2" 
                    : "border-gray-200"
                } ${
                  selectedPlan === plan.id
                    ? "ring-2 ring-blue-500 shadow-lg"
                    : ""
                }`}
                onClick={() => {
                  setSelectedPlan(plan.id);
                  // On mobile, scroll to continue button after selection
                  if (window.innerWidth < 768) {
                    setTimeout(() => {
                      const continueBtn = document.getElementById('continue-button');
                      if (continueBtn) {
                        continueBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }
                }}
              >
                <CardHeader className="text-center pb-8">
                  {plan.name === "Standard Plan" && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                      ⭐ Most Popular
                    </Badge>
                  )}
                  <CardTitle className="text-2xl font-bold text-gray-900 mt-4">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature.trim()}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      selectedPlan === plan.id
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      
                      // On mobile: If already selected, proceed to next step
                      if (window.innerWidth < 768 && selectedPlan === plan.id) {
                        handlePlanSelection();
                        return;
                      }
                      
                      // Select the plan
                      setSelectedPlan(plan.id);
                      
                      // On mobile, scroll to continue button after selection
                      if (window.innerWidth < 768) {
                        setTimeout(() => {
                          const continueBtn = document.getElementById('continue-button');
                          if (continueBtn) {
                            continueBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 100);
                      }
                    }}
                  >
                    {/* Desktop: Show "Selected" */}
                    <span className="hidden md:inline">
                      {selectedPlan === plan.id ? "✓ Selected" : "Select Plan"}
                    </span>
                    
                    {/* Mobile: Show "Go Ahead" when selected with animation */}
                    <span className="md:hidden">
                      {selectedPlan === plan.id ? (
                        <span className="flex items-center justify-center gap-2 animate-pulse">
                          Go Ahead →
                        </span>
                      ) : (
                        "Select Plan"
                      )}
                    </span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              id="continue-button"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              onClick={handlePlanSelection}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Project Setup"
              )}
            </Button>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Not sure which plan to choose?{" "}
              <button
                onClick={() => navigate("/contact")}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Contact our experts
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlanSelection;