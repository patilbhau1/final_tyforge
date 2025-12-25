import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Phone } from "lucide-react";
const Footer = () => {
  const openWhatsApp = () => {
    window.open("https://wa.me/+917506750982?text=Hi! I need help with TY projects", "_blank");
  };
  return <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">TY</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Project Provider</h3>
                <p className="text-blue-400 text-sm">Your Success Partner</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              We provide comprehensive support for your final year projects. From web applications to IoT hardware projects, we've got you covered with expert guidance.
            </p>
            <Button 
              onClick={openWhatsApp} 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <MessageCircle className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              WhatsApp Support
            </Button>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg mb-4 border-b border-gray-700 pb-2">
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="/" 
                className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:bg-blue-400"></span>
                Home
              </a>
              <a 
                href="/projects" 
                className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:bg-blue-400"></span>
                Projects
              </a>
              <a 
                href="/past-work" 
                className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:bg-blue-400"></span>
                Past Work
              </a>
              <a 
                href="/idea-generator" 
                className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:bg-blue-400"></span>
                Idea Generator
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg mb-4 border-b border-gray-700 pb-2">
              Get In Touch
            </h3>
            <div className="space-y-4">
              <a 
                href="mailto:pravinpatil90939@gmail.com"
                className="flex items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 hover:bg-blue-500/10 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30">
                  <Mail className="w-4 h-4 text-blue-400 group-hover:animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 group-hover:text-blue-300">Email</p>
                  <p className="text-white text-sm font-medium group-hover:text-blue-100">pravinpatil90939@gmail.com</p>
                </div>
              </a>
              <a 
                href="tel:+917506750982"
                className="flex items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 hover:bg-green-500/10 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-500/30">
                  <Phone className="w-4 h-4 text-green-400 group-hover:animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 group-hover:text-green-300">Pravin</p>
                  <p className="text-white text-sm font-medium group-hover:text-green-100">+91 7506750982</p>
                </div>
              </a>
              <a 
                href="tel:+918828016278"
                className="flex items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 hover:bg-blue-500/10 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30">
                  <Phone className="w-4 h-4 text-blue-400 group-hover:animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 group-hover:text-blue-300">Akhilesh</p>
                  <p className="text-white text-sm font-medium group-hover:text-blue-100">+91 8828016278</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; 2024 TY Project Provider. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span className="text-gray-400 text-sm">Made with</span>
            <span className="text-red-400 animate-pulse">❤️</span>
            <span className="text-gray-400 text-sm">for students</span>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;