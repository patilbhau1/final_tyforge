
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Code, 
  Cpu, 
  BookOpen, 
  CheckCircle, 
  Star, 
  ArrowRight,
  Smartphone,
  Globe,
  Wifi
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, useAnimation, useInView } from 'framer-motion';
import { useRef } from 'react';

import Chatbot from "@/components/Chatbot";

const Index = () => {
  interface Plan {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    popular?: boolean;
    highlighted?: boolean;
  }

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  
  // Ref for featured projects scroll animation
  const featuredProjectsRef = useRef(null);
  const isInView = useInView(featuredProjectsRef, { once: true, margin: "-100px" });

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsChatbotOpen(true);
  };

  const handleCloseChatbot = () => {
    setIsChatbotOpen(false);
    setSelectedPlan(null);
  };

  const handleFinalize = (messages) => {
    try {
      // Extract the conversation summary from the last system message if available
      const lastMessage = messages[messages.length - 1];
      const summary = lastMessage?.role === 'system' ? lastMessage.content : 
        messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      
      const hardwareNumber = "917506750982";
      const softwareNumber = "918828016278";
      const planType = selectedPlan?.name?.toLowerCase().includes('software') ? 'software' : 'hardware';
      const number = planType === 'software' ? softwareNumber : hardwareNumber;
      
      // Create a more structured WhatsApp message
      const projectTitle = selectedPlan?.name || 'Project';
      const whatsappMessage = `*New ${projectTitle} Inquiry*\n\n${summary}\n\n[This message was generated from the tyforge]`;
      
      const url = `https://wa.me/${number}?text=${encodeURIComponent(whatsappMessage)}`;
      
      // Open in a new tab
      window.open(url, '_blank');
      
      // Close the chatbot after a short delay
      setTimeout(() => {
        handleCloseChatbot();
      }, 500);
    } catch (error) {
      console.error('Error finalizing chat:', error);
      // Fallback in case of error
      alert('Failed to open WhatsApp. Please try again or contact support.');
      handleCloseChatbot();
    }
  };
  const features = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "Project Guidance",
      description: "Comprehensive end-to-end guidance through project planning, development, and execution with expert mentorship"
    },
    {
      icon: <img src="/person_with_laptop.svg" className="w-24 h-24 object-contain" alt="Technical Support" />,
      title: "Technical Support",
      description: "Expert support for coding, debugging, architecture design, and solving complex development challenges"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Black Books",
      description: "Professional black book creation with comprehensive documentation, project reports, and academic requirements"
    }
  ];

  const projectTypes = [
    {
      id: 1,
      icon: <Code className="w-12 h-12 text-blue-600" />,
      title: "Guardian: AI Chatbot for DSA Problem Solving",
      description: "A sleek AI chatbot built to assist students with DSA problems. Includes login/signup, chat renaming, and deletion. Ready for production use.",
      badge: "Popular",
      category: "Web Applications",
      tags: ["React", "Firebase", "GPT"],
      price: "₹6000",
      url: "https://guardianapp.vercel.app"
    },
    {
      id: 2,
      icon: <Cpu className="w-12 h-12 text-green-600" />,
      title: "Smart IoT Home Automation System",
      description: "Complete home automation with Arduino & ESP32. Control lights, temperature, security with mobile app integration and voice commands.",
      badge: "Trending",
      category: "IoT Projects",
      tags: ["Arduino", "ESP32", "Mobile App"],
      price: "₹8000",
      url: "#"
    },
    {
      id: 3,
      icon: <Smartphone className="w-12 h-12 text-purple-600" />,
      title: "EcoTrack: Environmental Monitoring App",
      description: "Track and visualize environmental data with real-time sensors. Features include data analytics, alerts, and community sharing.",
      badge: "New",
      category: "Hardware Projects",
      tags: ["React Native", "Sensors", "Analytics"],
      price: "₹7500",
      url: "#"
    }
  ];

  const softwarePlans = [
    {
      name: "Basic Plan",
      price: "₹1,499",
      period: "project",
      description: "Code review and improvement advice",
      features: [
        "Project advice and consultation",
        "Code review and improvements",
        "Technical guidance",
        "Email support"
      ]
    },
    {
      name: "Standard Plan",
      price: "₹5,000",
      period: "project",
      description: "Complete full-stack web app with up to 4 pages",
      features: [
        "Full-stack web application",
        "Maximum 4 pages",
        "Basic authentication",
        "Database integration",
        "Responsive design",
        "Technical documentation"
      ],
      popular: true
    },
    {
      name: "Premium Plan",
      price: "₹9,000",
      period: "project",
      description: "Advanced full-stack app with 8+ pages and complete documentation",
      features: [
        "Full-stack web application",
        "8+ pages included",
        "Complete login/signup system",
        "Client preferred database",
        "Advanced features",
        "Complete documentation",
        "System diagrams included",
        "Priority support"
      ]
    }
  ];

  const hardwarePlans = [
    {
      name: "Basic Plan",
      price: "₹1,500",
      period: "project",
      description: "Simple hardware project with basic sensors",
      features: [
        "Up to 4 sensors maximum",
        "Basic code for hardware",
        "No internet connectivity",
        "No cloud dashboard",
        "Components NOT included",
        "You buy components yourself"
      ]
    },
    {
      name: "Standard Plan", 
      price: "₹5,000",
      period: "project",
      description: "Advanced project with cloud connectivity",
      features: [
        "Up to 9 sensors",
        "Blynk cloud connectivity",
        "We source components at best prices",
        "Internet connectivity included",
        "Cloud dashboard setup",
        "Components NOT included"
      ],
      popular: true
    },
    {
      name: "Premium Plan",
      price: "₹9,000", 
      period: "project",
      description: "Complex IoT project with full documentation",
      features: [
        "15+ sensors supported",
        "Blynk cloud integration",
        "WiFi connectivity",
        "API data connections",
        "Complex project architecture",
        "Complete documentation",
        "Components NOT included"
      ]
    }
  ];

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hasAnimated, setHasAnimated] = useState(() => {
    return sessionStorage.getItem('heroAnimationPlayed') === 'true';
  });

  const h1Controls = useAnimation();
  const pControls = useAnimation();
  const buttonControls = useAnimation();
  const buttonInnerControls = useAnimation(); // For the inner motion.div of the button

  useEffect(() => {
    // Check if animations have already played in this session
    const animationPlayed = sessionStorage.getItem('heroAnimationPlayed');
    
    if (animationPlayed) {
      // Skip animations and show content immediately
      setHasAnimated(true);
    } else {
      // Play animations and mark as played for this session
      const sequence = async () => {
        // Animate h1 characters
        await h1Controls.start("visible");

        // Animate paragraph
        await pControls.start({ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.4 } });

        // Animate button container
        await buttonControls.start({ opacity: 1, transition: { delay: 0.6, duration: 0.4 } });

        // Animate button inner div
        await buttonInnerControls.start({ width: "100%", transition: { delay: 0.08, duration: 0.4, ease: "easeInOut" } });
        
        // Mark animations as completed for this session
        setHasAnimated(true);
        sessionStorage.setItem('heroAnimationPlayed', 'true');
      };

      sequence();
    }
  }, [h1Controls, pControls, buttonControls, buttonInnerControls]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8 md:py-12 min-h-[50vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight"
              initial={hasAnimated ? "visible" : "hidden"}
              animate={hasAnimated ? "visible" : h1Controls}
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
                hidden: {},
              }}
            >
              {"Final Year Projects? That's What We Do Best.".split("").map((char, index) => (
                <motion.span key={index} variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}>
                  {char}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-2 leading-relaxed"
              initial={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={hasAnimated ? { opacity: 1, y: 0 } : pControls}
            >
              We're here to make your final year project stress‑free. Whether you're stuck on ideas or need help bringing them to life, we'll guide you every step of the way—without breaking the bank.
            </motion.p>
            <motion.div
              initial={hasAnimated ? { opacity: 1 } : { opacity: 0 }}
              animate={hasAnimated ? { opacity: 1 } : buttonControls}
            >
              <Link to="/choose-idea-path">
                <Button
                  size="lg"
                  className="relative overflow-hidden border-2 border-blue-600 text-white bg-transparent hover:text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto max-w-sm"
                >
                  <motion.div
                    className="absolute inset-0 bg-blue-600"
                    initial={hasAnimated ? { width: "100%" } : { width: 0 }}
                    animate={hasAnimated ? { width: "100%" } : buttonInnerControls}
                  />
                  <span className="relative z-10 flex items-center justify-center font-semibold">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comprehensive Project Support */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Comprehensive Project Support
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Our platform offers a range of services to ensure your project's success
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section ref={featuredProjectsRef} className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Ready Made Projects
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">
              Real projects you can get - click to explore and get the complete project!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {projectTypes.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ 
                  opacity: 0, 
                  x: index % 2 === 0 ? -100 : 100 
                }}
                animate={isInView ? { 
                  opacity: 1, 
                  x: 0 
                } : { 
                  opacity: 0, 
                  x: index % 2 === 0 ? -100 : 100 
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  ease: "easeOut" 
                }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full group"
                  onClick={() => {
                    // Navigate to projects page and filter by this project
                    const searchParams = new URLSearchParams();
                    searchParams.set('search', project.title);
                    window.location.href = `/projects?${searchParams.toString()}`;
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {project.icon}
                        </motion.div>
                        <div>
                          <Badge variant="secondary" className="mb-2">
                            {project.badge}
                          </Badge>
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                            {project.title}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {project.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">{project.price}</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {project.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/projects">
              <Button variant="outline" size="lg">
                View All Projects
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Software Project Pricing Plans */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Software Project Plans
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">
              Choose a plan for your web development project
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20">
            {softwarePlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'ring-2 ring-blue-600 md:scale-105' : ''} h-full`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-xs sm:text-sm">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-center justify-center mt-3 sm:mt-4">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 ml-2 text-sm sm:text-base">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-sm sm:text-base px-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleSelectPlan(plan)} className={`w-full mb-6 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                    Select Plan
                  </Button>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        className="flex items-center"
                        // Features are visible by default, so no initial hidden state
                        animate={hoveredCard === index ? { x: 5 } : { x: 0 }} // Simple shake on hover
                        transition={{
                          duration: 0.2,
                          delay: hoveredCard === index ? featureIndex * 0.05 : 0 // Faster stagger
                        }}
                      >
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware Project Pricing Plans */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Hardware Project Plans
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2 mb-2">
              Choose a plan for your IoT and hardware projects
            </p>
            <p className="text-xs sm:text-sm text-red-600 font-medium px-4">
              Note: All hardware plans require you to purchase components separately
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {hardwarePlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-green-600 md:scale-105' : ''} h-full`}>
                {plan.popular && (
                  <Badge className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-xs sm:text-sm">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-center justify-center mt-3 sm:mt-4">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 ml-2 text-sm sm:text-base">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-sm sm:text-base px-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleSelectPlan(plan)} className={`w-full mb-6 ${plan.popular ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                    Select Plan
                  </Button>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-2 leading-relaxed">
            Too lazy to make your final year project? No worries — we've got your back. Let us handle the hard stuff while you chill (a little).
          </p>
          <Link to="/choose-idea-path">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto max-w-xs text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
              Get Started Now
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
      {isChatbotOpen && selectedPlan && (
        <div className="fixed inset-0 z-50">
          <Chatbot
            plan={selectedPlan}
            onClose={handleCloseChatbot}
            onFinalize={handleFinalize}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
