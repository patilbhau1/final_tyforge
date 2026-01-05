import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Lightbulb, Send, User, MessageSquare, AlertCircle } from "lucide-react";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Reactmarkedown from 'react-markdown';
import { getIdeaFallbackResponse, checkQuotaStatus } from '@/utils/apiFallback';
import { quotaManager } from '@/utils/quotaManager';
import { API_BASE_URL } from '@/config/api';

const IdeaGenerator = () => {
  const [formData, setFormData] = useState({ name: "", phoneNo: "", interests: "" });
  const [generatedIdea, setGeneratedIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showIdea, setShowIdea] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [limitInfo, setLimitInfo] = useState({ max: 15, count: 0 });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateProjectIdea = async (interests: string) => {
    // Fallback ideas if API fails
    const fallbackIdeas = [
      `Build a smart task management app using React and Firebase with AI-powered priority suggestions based on your ${interests} interests.`,
      `Create an IoT-based home automation system using Arduino/Raspberry Pi focusing on ${interests} with mobile app integration.`,
      `Develop a machine learning project for ${interests} using Python, TensorFlow, and Flask for web deployment.`,
      `Design a full-stack e-commerce platform for ${interests} using MERN stack with payment gateway integration.`,
      `Build a real-time chat application with ${interests} focus using Socket.io, Node.js, and React with MongoDB.`
    ];

    try {
      // Use backend API - works for both logged-in and guest users
      const token = localStorage.getItem("tyforge_token");
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token if user is logged in (optional)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/idea-generation/generate`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          field_of_interest: interests
        })
      });
      
      if (!response.ok) {
        console.warn(`Backend API failed with status ${response.status}, using fallback`);
        return getIdeaFallbackResponse(interests);
      }
      
      const data = await response.json();
      
      if (!data.idea) {
        console.warn('Backend API returned invalid data, using fallback');
        return getIdeaFallbackResponse(interests);
      }
      
      return data.idea.trim();
    } catch (error) {
      console.warn('API request failed, checking if quota issue:', error);
      
      // Check if it's specifically a quota/rate limit error
      if (quotaManager.isQuotaError(error)) {
        console.log('API quota exceeded, marking and using intelligent fallback');
        quotaManager.markQuotaExceeded();
        // Use intelligent fallback based on interests
        return getIdeaFallbackResponse(interests);
      } else {
        // Other API errors - use basic fallback
        console.log('General API error, using basic fallback');
        return fallbackIdeas[Math.floor(Math.random() * fallbackIdeas.length)];
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check generation limit first
    try {
      const response = await fetch(`${API_BASE_URL}/api/idea-generation/count?phone=${formData.phoneNo}`);
      const data = await response.json();
      
      if (!data.can_generate) {
        setLimitInfo({ max: data.max, count: data.count });
        setShowLimitDialog(true);
        return;
      }
    } catch (error) {
      console.error("Error checking limit:", error);
    }
    
    setIsLoading(true);
    setShowIdea(false);

    const idea = await generateProjectIdea(formData.interests);
    setGeneratedIdea(idea);
    setShowIdea(true);
    setIsLoading(false);
  };


  const handleSubmitIdea = async () => {
    const { name, phoneNo, interests } = formData;
    const idea = generatedIdea;
    
    try {
      // Submit to our backend
      const response = await fetch(`${API_BASE_URL}/api/idea-generation/submit-idea`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone: phoneNo,
          interests,
          generated_idea: idea
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Backend returns { message: "Idea submitted successfully!" }
        // Success!
        // Set one-time banner for /projects
        sessionStorage.setItem(
          'post_submit_banner',
          "Your idea is submitted. We will reach you soon. You can explore our projects."
        );

        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setFormData({ name: "", phoneNo: "", interests: "" });
          setGeneratedIdea("");
          setShowIdea(false);
          navigate('/projects');
        }, 1000);
      } else {
        // Error response
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        alert(errorData.detail || errorData.message || "Failed to submit your idea. Please try again.");
      }
      
    } catch (error) {
      console.error("Error submitting idea:", error);
      alert("Failed to submit your idea. Please try again.");
    }
  };


  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <Lightbulb className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">TY Project Idea Generator</h1>
          <p className="text-lg text-gray-600">Tell us your interests and get a personalized project idea.</p>
        </div>
      </section>

      <section className="mobile-py max-w-4xl mx-auto mobile-px">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><User className="w-5 h-5 mr-2" />Your Details</CardTitle>
              <CardDescription>Enter name, email, and interests</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="phoneno">Phone Number</Label>
                  <Input
                    id="phoneNo"
                    name="phoneNo"
                    type="tel"
                    maxLength={10}
                    value={formData.phoneNo}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    required
                  />
                  </div>
                <div>
                  <Label htmlFor="interests">Interests</Label>
                  <Textarea id="interests" name="interests" value={formData.interests} onChange={handleInputChange} required rows={4} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Generating...' : 'Generate Ideas'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><MessageSquare className="w-5 h-5 mr-2" />Project Idea</CardTitle>
              <CardDescription>{showIdea ? 'Here is your idea' : 'Awaiting your input...'}</CardDescription>
            </CardHeader>
            <CardContent>
              {showIdea ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded">
                    <p>{
                      <Reactmarkedown>
                        {generatedIdea}
                      </Reactmarkedown>
                    }</p>
                  </div>
                  <Button onClick={handleSubmitIdea} className="mr-2">Submit Idea</Button>
                  <Button variant="outline" onClick={handleSubmit}>New Idea</Button>
                </div>
              ) : (
                <p className="text-gray-500">Fill out the form to see ideas</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Floating Animated Button */}
      <motion.div 
        className="fixed bottom-24 right-4 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.button
          onClick={() => navigate('/approved-idea')}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm flex items-center space-x-2"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(124, 58, 237, 0.7)',
              '0 0 0 15px rgba(124, 58, 237, 0)',
              '0 0 0 0 rgba(124, 58, 237, 0)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop'
          }}
        >
          <span>Got Approved Idea?</span>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="text-lg"
          >
            💡
          </motion.span>
        </motion.button>
      </motion.div>
      
      {/* Bottom spacing for better UX */}
      <div className="h-16 sm:h-20"></div>
      
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-md mx-4"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Idea Submitted!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Your idea is submitted. We will reach you soon.
            </p>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl"
            >
              💡✨
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Limit Reached Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="w-5 h-5" />
              Generation Limit Reached
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              You've reached the maximum limit of <strong className="text-orange-600">{limitInfo.max}</strong> idea generations 
              using this phone number.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Need more ideas?</strong> Our team is here to help! Contact us to discuss your project 
              requirements and get personalized guidance.
            </p>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>✅ Get unlimited project consultations</p>
            <p>✅ Discuss your ideas with experts</p>
            <p>✅ Receive personalized recommendations</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLimitDialog(false)}
            >
              Close
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setShowLimitDialog(false);
                navigate('/contact');
              }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default IdeaGenerator;
