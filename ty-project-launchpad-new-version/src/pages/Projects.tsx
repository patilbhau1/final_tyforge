import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle, X } from "lucide-react";
import { 
  Search,
  Globe,
  Cpu,
  Smartphone,
  Database,
  Wifi,
  Camera,
  Download,
  Bot,
  Heart,
  Leaf,
  Home,
  Keyboard
} from "lucide-react";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [postSubmitBanner, setPostSubmitBanner] = useState<string | null>(null);
  const location = useLocation();

  // One-time banner shown after idea submission redirects
  useEffect(() => {
    const msg = sessionStorage.getItem('post_submit_banner');
    if (msg) {
      setPostSubmitBanner(msg);
      sessionStorage.removeItem('post_submit_banner');
    }
  }, []);

  // Handle search from featured projects
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchFromParams = searchParams.get('search');
    if (searchFromParams) {
      setSearchQuery(searchFromParams);
    }
  }, [location.search]);

  const categories = [
    "All",
    "Web / AI Projects",
    "IoT Projects",
    "Hardware / Embedded Projects",
    "Cyber / System Projects",
  ];

  const projects = [
    {
      id: 1,
      title: "Guardian: AI Chatbot for DSA Problem Solving",
      description: "A sleek AI chatbot built to assist students with DSA problems. Includes login/signup, chat renaming, and deletion. Ready for production use.",
      category: "Web / AI Projects",
      icon: <Bot className="w-6 h-6" />,
      tags: ["React", "Firebase", "GPT", "Chatbot"],
      difficulty: "Advanced",
      price: "₹6000",
      url: "#"
    },
    {
      id: 2,
      title: "MindMate: Mental Health Support Chatbot",
      description: "A minimalist chatbot app for mental health support. Includes login/signup, chat interface, and delete function.",
      category: "Web / AI Projects",
      icon: <Heart className="w-6 h-6" />,
      tags: ["Flask", "Python", "Mental Health"],
      difficulty: "Beginner",
      price: "₹3999",
      url: "#"
    },
    {
      id: 3,
      title: "Plant Monitoring System",
      description: "Automatically waters plants when soil is dry using a moisture sensor and ESP32. Real-time control and monitoring via Blynk web app.",
      category: "IoT Projects",
      icon: <Leaf className="w-6 h-6" />,
      tags: ["ESP32", "Blynk", "IoT", "Soil Sensor"],
      difficulty: "Intermediate",
      price: "₹4500",
      url: "#"
    },
    {
      id: 4,
      title: "Home Automation System",
      description: "Control home appliances like fans, lights, and TVs using Arduino and a Python app. Simple and effective home automation system.",
      category: "Hardware / Embedded Projects",
      icon: <Home className="w-6 h-6" />,
      tags: ["Arduino", "Python", "Relay"],
      difficulty: "Beginner",
      price: "₹4999",
      url: "#"
    },
    {
      id: 5,
      title: "MacroPad: ESP32 Bluetooth Macro Controller",
      description: "A high-end macro keypad with OLED display, rotary encoder, and 9 programmable buttons. Connects via Bluetooth with customizable profiles.",
      category: "Hardware / Embedded Projects",
      icon: <Keyboard className="w-6 h-6" />,
      tags: ["ESP32", "Bluetooth", "MacroPad", "OLED"],
      difficulty: "Expert",
      price: "₹5500",
      url: "#"
    },

    // --- Added projects ---
    {
      id: 6,
      title: "Smart Attendance System (Face + QR)",
      description: "Face recognition attendance with QR fallback. Includes admin dashboard, reports and CSV export.",
      category: "Web / AI Projects",
      icon: <Camera className="w-6 h-6" />,
      tags: ["React", "Python", "OpenCV", "Firebase"],
      difficulty: "Intermediate",
      price: "₹4500",
      url: "#"
    },
    {
      id: 7,
      title: "AI Resume Analyzer & Job Matcher",
      description: "Upload resume, skill gap analysis, and job role matching.",
      category: "Web / AI Projects",
      icon: <Cpu className="w-6 h-6" />,
      tags: ["React", "FastAPI", "NLP", "Gemini"],
      difficulty: "Advanced",
      price: "₹4999",
      url: "#"
    },
    {
      id: 8,
      title: "Online Exam System with Proctoring",
      description: "Webcam monitoring, tab-switch detection, and auto result generation.",
      category: "Web / AI Projects",
      icon: <Globe className="w-6 h-6" />,
      tags: ["React", "Flask", "WebRTC", "Proctoring"],
      difficulty: "Advanced",
      price: "₹5500",
      url: "#"
    },
    {
      id: 9,
      title: "Fake News Detection Web App",
      description: "Analyze Instagram/YouTube links, extract transcript, and verify with NLP/LLM.",
      category: "Web / AI Projects",
      icon: <Wifi className="w-6 h-6" />,
      tags: ["FastAPI", "Whisper", "LLM", "NLP"],
      difficulty: "Advanced",
      price: "₹5500",
      url: "#"
    },

    {
      id: 10,
      title: "Smart Energy Meter with Mobile App",
      description: "Real-time unit tracking and monthly cost estimation with a mobile dashboard.",
      category: "IoT Projects",
      icon: <Database className="w-6 h-6" />,
      tags: ["ESP32", "Firebase", "Flutter", "IoT"],
      difficulty: "Intermediate",
      price: "₹3999",
      url: "#"
    },
    {
      id: 11,
      title: "Smart Parking System",
      description: "IR-sensor based slot detection with live availability dashboard.",
      category: "IoT Projects",
      icon: <Wifi className="w-6 h-6" />,
      tags: ["ESP32", "Sensors", "Dashboard", "IoT"],
      difficulty: "Intermediate",
      price: "₹4500",
      url: "#"
    },
    {
      id: 12,
      title: "Industrial Gas Leakage Alert System",
      description: "Gas + temperature monitoring with SMS/app alerts.",
      category: "IoT Projects",
      icon: <Wifi className="w-6 h-6" />,
      tags: ["ESP32", "MQ Sensors", "Blynk", "Alerts"],
      difficulty: "Intermediate",
      price: "₹3999",
      url: "#"
    },

    {
      id: 13,
      title: "Smart Blind Stick for Visually Impaired",
      description: "Obstacle + water detection with voice alerts.",
      category: "Hardware / Embedded Projects",
      icon: <Smartphone className="w-6 h-6" />,
      tags: ["Arduino", "Ultrasonic", "Buzzer", "Assistive"],
      difficulty: "Intermediate",
      price: "₹2500",
      url: "#"
    },
    {
      id: 14,
      title: "Gesture Controlled Home Appliances",
      description: "Control lights/fans using hand gestures.",
      category: "Hardware / Embedded Projects",
      icon: <Home className="w-6 h-6" />,
      tags: ["MPU6050", "Arduino", "Relay", "Automation"],
      difficulty: "Intermediate",
      price: "₹3000",
      url: "#"
    },
    {
      id: 15,
      title: "ESP32-Based Voice Controlled Assistant",
      description: "Offline voice commands to control devices and answer queries.",
      category: "Hardware / Embedded Projects",
      icon: <Smartphone className="w-6 h-6" />,
      tags: ["ESP32", "Python", "Whisper", "Voice"],
      difficulty: "Advanced",
      price: "₹4999",
      url: "#"
    },

    {
      id: 16,
      title: "Keylogger Detection System",
      description: "Detect suspicious background processes and keylogger-like behavior.",
      category: "Cyber / System Projects",
      icon: <Database className="w-6 h-6" />,
      tags: ["Python", "OS", "Security", "Detection"],
      difficulty: "Advanced",
      price: "₹4500",
      url: "#"
    },
    {
      id: 17,
      title: "Secure File Sharing System",
      description: "Encrypted file sharing with access expiry and authentication.",
      category: "Cyber / System Projects",
      icon: <Globe className="w-6 h-6" />,
      tags: ["Flask", "AES", "JWT", "Security"],
      difficulty: "Intermediate",
      price: "₹3500",
      url: "#"
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-orange-100 text-orange-800";
      case "Expert": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleGetProject = (project: any) => {
    const hardwareNumber = "917506750982";
    const softwareNumber = "918828016278";
    const message = "Hi! I need help with TY projects";
    let url = "";

    if (project.category === "Hardware Projects" || project.category === "IoT Projects") {
      url = `https://wa.me/${hardwareNumber}?text=${encodeURIComponent(message)}`;
    } else {
      url = `https://wa.me/${softwareNumber}?text=${encodeURIComponent(message)}`;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-white m-0 p-0">
      <Header />
      
      {/* Post-submit banner */}
      {postSubmitBanner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-start justify-between gap-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 text-green-700" />
              <div>
                <p className="font-semibold">Idea submitted</p>
                <p className="text-sm text-green-800">{postSubmitBanner}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md p-1 hover:bg-green-100"
              aria-label="Dismiss message"
              onClick={() => setPostSubmitBanner(null)}
            >
              <X className="w-5 h-5 text-green-700" />
            </button>
          </div>
        </div>
      )}

      {/* Compact Header with Search */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Available Projects
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Browse final year projects with complete documentation
            </p>
          </div>
          
          {/* Integrated Search and Filter */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500"
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="h-11 px-4 text-xs sm:text-sm"
                  >
                    {category === "All" ? "All" : category.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pt-8 sm:pt-12 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {project.icon}
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-1">
                          {project.category}
                        </Badge>
                        <CardTitle className="text-lg leading-tight">
                          {project.title}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm line-clamp-3">
                    {project.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                      {project.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-2xl font-bold text-blue-600">{project.price}</span>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleGetProject(project)} size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Get Project
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No projects found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Contact to See More Section */}
      <section className="pt-12 pb-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Want to See More Projects?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            We have many more amazing projects in our portfolio. Get in touch to explore our complete work.
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Projects;