import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Cpu } from "lucide-react";

const ServiceSelection = () => {
  const navigate = useNavigate();

  const handleServiceSelect = (serviceType: string) => {
    // Store selected service in localStorage
    localStorage.setItem('selected_service', serviceType);
    // Navigate to plan selection page
    navigate('/select-plan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">
            Choose Your Service Type
          </h1>
        </div>
      </div>

      {/* Service Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Web & App Development */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-gray-200 hover:border-blue-400"
            onClick={() => handleServiceSelect('web-app')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Code className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Web & App Development
              </h2>
              
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Build modern websites, web applications, mobile apps, and software solutions using latest technologies
              </p>
              
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Responsive Websites</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Web Applications (React, Angular, Vue)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Mobile Apps (Android/iOS)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Backend APIs & Databases</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">AI/ML Integration</span>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-base py-6 h-auto"
              >
                <span className="flex items-center justify-center gap-2">
                  Choose Web & App Development
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* IoT Projects */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-gray-200 hover:border-blue-400"
            onClick={() => handleServiceSelect('iot')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Cpu className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                IoT Projects
              </h2>
              
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Create Internet of Things projects with hardware integration, sensors, and embedded systems
              </p>
              
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Smart Home Automation</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Arduino & Raspberry Pi Projects</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Sensor Integration & Data Collection</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Embedded Systems Programming</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Cloud Integration (AWS IoT, Azure)</span>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-base py-6 h-auto"
              >
                <span className="flex items-center justify-center gap-2">
                  Choose IoT Projects
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg mb-4">
            Not sure which service to choose?
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/contact')}
            className="text-lg px-8 py-6"
          >
            Talk to Our Experts
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Same Pricing for Both Services
          </h3>
          <p className="text-blue-700">
            All our plans (Basic, Standard, Premium) have the same pricing regardless of whether you choose 
            Web/App Development or IoT. Select based on your project interest!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;
