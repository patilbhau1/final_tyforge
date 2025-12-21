
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink,
  Github,
  Eye,
  Smartphone,
  HelpCircle,
  Calendar,
  User,
  DollarSign,
  Wrench
} from "lucide-react";

const PastWork = () => {
  const featuredProjects = [
    {
      id: 1,
      title: "SeeBySound — AI Glasses for the Visually Impaired",
      type: "AI + Hardware Innovation",
      year: "2024",
      description: "A state-of-the-art assistive system for blind individuals. The smart glasses come with a camera that streams video to a custom AI model (VLM + YOLOv8) for real-time object detection, obstacle navigation, and GPS-based guidance.",
      features: [
        "Raspberry Pi Zero 2W (on glasses)",
        "RTX 3080 (server inference)", 
        "Google Maps + GPS integration",
        "Custom vision-language models"
      ],
      buildCost: "₹46,000",
      student: "Internal Research Project",
      tags: ["Raspberry Pi", "YOLOv8", "Navigation AI", "GPS", "VLM"],
      icon: <Eye className="w-8 h-8" />,
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      borderColor: "border-purple-200"
    },
    {
      id: 2,
      title: "InstantPrint — Smart Web App for College Students",
      type: "Web Application (Smart Utility)",
      year: "2024",
      description: "A time-saving app for students. Detects user's college location and finds nearby print shops. Allows file uploads, calculates cost (₹5.9 B&W / ₹10.3 Color), and sends it directly to the selected shop after payment.",
      features: [
        "80% less waiting time compared to manual WhatsApp file sharing",
        "Auto-location + real-time print delivery system"
      ],
      student: "Akash S., TY BTech",
      tags: ["Location API", "Payment Integration", "Utility Web App"],
      icon: <Smartphone className="w-8 h-8" />,
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-200"
    },
    {
      id: 3,
      title: "Coming Soon — Project 3",
      type: "Reveal Next Week",
      year: "2024",
      description: "We're finishing up our third featured TY project — it's almost ready! Stay tuned for another cutting-edge build dropping soon 🚀",
      student: "Coming Soon",
      tags: ["Stay Tuned"],
      icon: <HelpCircle className="w-8 h-8" />,
      bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Journey So Far
            </h1>
            <p className="text-xl mb-8">
              We're just getting started — but we've already made an impact!
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">14+</div>
              <div className="text-gray-600">✅ Projects Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">📈 Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">30+</div>
              <div className="text-gray-600">🧠 Technologies Used</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">30+</div>
              <div className="text-gray-600">👩‍🎓 Happy Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🥇 Featured Projects</h2>
            <p className="text-lg text-gray-600">
              A timeline of our proudest achievements
            </p>
          </div>

          <div className="space-y-8">
            {featuredProjects.map((project, index) => (
              <Card key={project.id} className={`${project.bgColor} ${project.borderColor} border-2 hover:shadow-xl transition-all duration-300`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-white rounded-full shadow-md">
                      {project.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-white/80">
                          {project.type}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {project.year}
                        </div>
                      </div>
                      <CardTitle className="text-xl md:text-2xl leading-tight mb-2">
                        {project.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="text-gray-700 leading-relaxed">
                    {project.description}
                  </CardDescription>

                  {project.features && (
                    <div className="bg-white/60 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {project.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs bg-white/60">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/40">
                    <div className="flex items-center text-sm text-gray-700">
                      <User className="w-4 h-4 mr-2" />
                      <span className="font-medium">Student:</span> 
                      <span className="ml-1">{project.student}</span>
                    </div>
                    {project.buildCost && (
                      <div className="flex items-center text-sm text-gray-700">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="font-medium">Build Cost:</span> 
                        <span className="ml-1 font-semibold text-green-600">{project.buildCost}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Students Say</h2>
            <p className="text-lg text-gray-600">
              Real feedback from our project collaborations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4 italic">
                  "Working on InstantPrint was amazing! The team helped me understand complex API integrations and payment systems. Now I feel confident building real-world applications."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">A</span>
                  </div>
                  <div>
                    <p className="font-semibold">Akash S.</p>
                    <p className="text-sm text-gray-500">TY BTech Student</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4 italic">
                  "The AI glasses project pushed my boundaries in hardware and AI. Even though it was challenging, the support was incredible. This is next-level project mentoring!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">R</span>
                  </div>
                  <div>
                    <p className="font-semibold">Research Team</p>
                    <p className="text-sm text-gray-500">Internal Project</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PastWork;
