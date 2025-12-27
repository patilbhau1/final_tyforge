import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Lightbulb, FileText, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useDropzone } from "react-dropzone";
import { handleApiError, handleApiSuccess } from "@/utils/errorHandler";
import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders, getAuthHeadersForUpload } from "@/config/api";

const API_BASE = `${API_BASE_URL}/api`;
const getToken = () => localStorage.getItem("tyforge_token");

const ProjectSetup = () => {
  const [activeTab, setActiveTab] = useState<"upload" | "generate">("upload");
  const [projectTitle, setProjectTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [projectDescription, setProjectDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldOfInterest, setFieldOfInterest] = useState("");
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [showIdeas, setShowIdeas] = useState(false);
  const navigate = useNavigate();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      toast({
        title: "File uploaded",
        description: `${file.name} uploaded successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const handleSynopsisUpload = async () => {
    if (!uploadedFile) {
      toast({
        title: "Error",
        description: "Please upload your synopsis PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const token = localStorage.getItem("tyforge_token");

      // First create a project entry - update no need for entry in case of synopsis upload

      // Upload the synopsis file
      const formData = new FormData();
      formData.append("file", uploadedFile);
      try {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        const res = await fetch(`${API_BASE}/synopsis/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        handleApiSuccess("Synopsis uploaded successfully");
        setUploadedFile(null);
        // Refresh
        const newRes = await fetch(`${API_BASE}/synopsis`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setFiles(await newRes.json());
      } catch (error) {
        handleApiError(error, "Upload failed");
      } finally {
        setIsProcessing(false);
      }

      toast({
        title: "Success",
        description: "Synopsis uploaded successfully! Redirecting to dashboard...",
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
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

  const generateAIIdea = async (interests: string) => {
    try {
      const token = localStorage.getItem("tyforge_token");
      const response = await fetch(`${API_BASE_URL}/api/idea-generation/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          field_of_interest: interests
        }),
      });

      if (!response.ok) throw new Error("Failed to generate idea");

      const data = await response.json();
      return data.idea;
    } catch (error) {
      console.error("API Error:", error);
      // Fallback idea if API fails
      return `Innovative ${interests} solution with modern technology stack. This project will leverage cutting-edge tools to solve real-world problems in the ${interests} domain.`;
    }
  };

  const handleIdeaGeneration = async () => {
    if (!fieldOfInterest) {
      toast({
        title: "Error",
        description: "Please enter your field of interest",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const idea = await generateAIIdea(fieldOfInterest);
      setGeneratedIdeas([idea]); // Single idea
      setShowIdeas(true);

      toast({
        title: "Success",
        description: "Generated a unique project idea for you!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectIdea = async (idea: string) => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem("tyforge_token");

      const response = await fetch(API_ENDPOINTS.PROJECT_IDEAS.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: idea,
          description: `Project based on ${fieldOfInterest}`,
          idea_generated: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to save project idea");

      toast({
        title: "Success",
        description: "Project idea saved! Redirecting to dashboard...",
      });

      setTimeout(() => navigate("/dashboard"), 2000);
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

  const handleRequestAdminHelp = () => {
    navigate("/request-admin-help");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Set Up Your Project
            </h1>
            <p className="text-xl text-gray-600">
              You can either upload your existing project synopsis or let us help you generate a new project idea
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                className={`px-6 py-2 rounded-md font-medium transition-all ${activeTab === "upload"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
                onClick={() => setActiveTab("upload")}
              >
                <Upload className="inline-block w-4 h-4 mr-2" />
                Upload Synopsis
              </button>
              <button
                className={`px-6 py-2 rounded-md font-medium transition-all ${activeTab === "generate"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
                onClick={() => setActiveTab("generate")}
              >
                <Lightbulb className="inline-block w-4 h-4 mr-2" />
                Generate Idea
              </button>
            </div>
          </div>

          {activeTab === "upload" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Upload Your Synopsis</CardTitle>
                <CardDescription>
                  Already have a project synopsis? Upload it here and we'll review it for approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                    }`}
                >
                  <input {...getInputProps()} />
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {isDragActive ? "Drop your PDF here" : "Drag & drop your synopsis PDF here"}
                  </p>
                  <p className="text-gray-600">
                    or click to browse and select your file
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Only PDF files are accepted (max 10MB)
                  </p>
                </div>

                {uploadedFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">{uploadedFile.name}</span>
                      <span className="text-green-600 ml-2">({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/select-plan")}
                    disabled={isProcessing}
                  >
                    Back to Plans
                  </Button>
                  <Button
                    onClick={handleSynopsisUpload}
                    disabled={isProcessing || !uploadedFile}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        Upload Synopsis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">AI-Powered Idea Generation</CardTitle>
                <CardDescription>
                  Tell us your field of interest and we'll generate unique project ideas for you!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!showIdeas ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="interests">Your Field of Interest *</Label>
                      <Input
                        id="interests"
                        placeholder="e.g., Web Development, IoT, Machine Learning, Blockchain, Mobile Apps..."
                        value={fieldOfInterest}
                        onChange={(e) => setFieldOfInterest(e.target.value)}
                        className="text-lg"
                      />
                      <p className="text-sm text-gray-500">
                        Enter keywords like: web, mobile, iot, ml, ai, blockchain, healthcare, education, etc.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <Lightbulb className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">How it works</h4>
                          <p className="text-blue-800 text-sm">
                            Our AI (powered by X.AI Grok) will generate a unique project idea tailored to your interests.
                            Review it and if you like it, accept to save it!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/select-plan")}
                        disabled={isProcessing}
                      >
                        Back to Plans
                      </Button>
                      <Button
                        onClick={handleIdeaGeneration}
                        disabled={isProcessing || !fieldOfInterest}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Ideas...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="mr-2 h-4 w-4" />
                            Generate Project Ideas
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Generated Ideas for "{fieldOfInterest}"
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowIdeas(false);
                            setGeneratedIdeas([]);
                          }}
                        >
                          Try Different Interest
                        </Button>
                      </div>

                      {generatedIdeas.map((idea, index) => (
                        <Card key={index} className="border-2 hover:border-blue-500 transition-all cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                                    Idea {index + 1}
                                  </span>
                                </div>
                                <p className="text-gray-900 font-medium">{idea}</p>
                              </div>
                              <Button
                                onClick={() => handleSelectIdea(idea)}
                                disabled={isProcessing}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Select This
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 text-sm">
                        ✨ Click "Select This" to save this AI-generated idea and proceed to dashboard!
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProjectSetup;