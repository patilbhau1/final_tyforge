import React from 'react';
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, MessageCircle, Clock } from "lucide-react";

const Contact = () => {
  const openWhatsApp = (number: string, message: string) => {
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const openEmail = () => {
    window.open("mailto:pravinpatil90939@gmail.com?subject=TY Project Inquiry", "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to start your final year project? Contact our team for expert guidance and support.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Pravin's Contact */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
              <CardTitle className="text-2xl text-gray-900">Pravin Patil</CardTitle>
              <CardDescription className="text-lg">Project Lead & Hardware Specialist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium">+91 7506750982</p>
                  <p className="text-sm text-gray-600">Hardware & IoT Projects</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => window.open('tel:+917506750982')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button 
                  onClick={() => openWhatsApp('+917506750982', 'Hi Pravin! I need help with my TY hardware project.')}
                  variant="outline"
                  className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Akhilesh's Contact */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <CardTitle className="text-2xl text-gray-900">Akhilesh</CardTitle>
              <CardDescription className="text-lg">Software Developer & Web Specialist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">+91 8828016278</p>
                  <p className="text-sm text-gray-600">Web & Software Projects</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => window.open('tel:+918828016278')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button 
                  onClick={() => openWhatsApp('+918828016278', 'Hi Akhilesh! I need help with my TY software project.')}
                  variant="outline"
                  className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* General Contact Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">General Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-gray-600 text-sm mb-3">For detailed project discussions</p>
                <Button onClick={openEmail} variant="outline" size="sm">
                  Send Email
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">WhatsApp Support</h3>
                <p className="text-gray-600 text-sm mb-3">Quick responses & instant help</p>
                <Button 
                  onClick={() => openWhatsApp('+917506750982', 'Hi! I need help with my TY project.')}
                  variant="outline" 
                  size="sm"
                  className="border-green-600 text-green-600"
                >
                  Chat Now
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">Response Time</h3>
                <p className="text-gray-600 text-sm mb-3">Usually within 2-4 hours</p>
                <div className="text-sm text-gray-500">
                  Mon-Sat: 9 AM - 8 PM
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">How long does project development take?</h4>
                <p className="text-gray-600">Typically 2-4 days or 1 weeks depending on project complexity and requirements.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-2">Do you provide documentation and reports?</h4>
                <p className="text-gray-600">Yes! We provide complete documentation, black books, and project reports as per your college requirements.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-2">What if I need modifications after project completion?</h4>
                <p className="text-gray-600">We offer free minor modifications within 1 day of project delivery. Major changes are charged separately.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-2">Do you help with project presentation and viva?</h4>
                <p className="text-gray-600">Absolutely! We provide presentation slides and viva preparation support to help you succeed.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom spacing for better UX */}
      <div className="h-16 sm:h-20"></div>
    </div>
  );
};

export default Contact;