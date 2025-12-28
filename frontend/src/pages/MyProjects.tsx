import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FolderOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Calendar,
  User,
  FileText,
  Sparkles,
  Activity,
  Lock,
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { handleApiError } from "@/utils/errorHandler";

// Helper: Get JWT token from localStorage
const getToken = () => localStorage.getItem("tyforge_token");

// Helper: API call with auth
const apiCall = async (endpoint: string, options: any = {}) => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
};

const MyProjects = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [userPlan, setUserPlan] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch user's projects
      const projectsData = await apiCall("/api/projects/me");
      setProjects(projectsData);

      // Fetch user's payment status
      const ordersData = await apiCall("/api/orders/me");
      const completedOrder = ordersData.find((o: any) => o.status === 'paid' || 'completed');
      if (completedOrder){
        setUserPlan(completedOrder);
      }

    } catch (error) {
      handleApiError(error, 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = getToken();
      const userData = await apiCall('/api/users/me');
      const user_id = userData.id ;
      const response = await fetch(`${API_BASE_URL}/api/admin/download-project/${user_id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'project.zip';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      handleApiError(error, 'Failed to download project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'pending':
      case 'idea_pending':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 100;
      case 'in_progress':
        return 60;
      case 'synopsis_pending':
        return 40;
      case 'idea_pending':
        return 20;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Projects 🚀
          </h1>
          <p className="text-gray-600">Track your project progress and download completed work</p>
        </div>

        {/* Payment Status Alert */}
        {!userPlan && (
          <Card className="mb-6 border-orange-300 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-orange-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-1">Payment Required</h3>
                  <p className="text-sm text-orange-700">
                    Complete your payment to unlock project downloads and full access to your work.
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-3 bg-orange-600 hover:bg-orange-700"
                    onClick={() => navigate('/select-plan')}
                  >
                    Choose Plan & Pay
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="hover:shadow-xl transition-shadow duration-200 border-2 hover:border-blue-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status || 'Pending'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || 'No description available'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-blue-600">
                        {getProgressPercentage(project.status)}%
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(project.status)} className="h-2" />
                  </div>

                  {/* Project Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {project.category && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>Category: {project.category}</span>
                      </div>
                    )}

                    {project.tech_stack && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Sparkles className="w-4 h-4" />
                        <span className="line-clamp-1">Tech: {project.tech_stack}</span>
                      </div>
                    )}
                  </div>

                  {/* Project Status Updates */}
                  <div className="pt-3 border-t space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Status Updates
                    </h4>
                    
                    <div className="space-y-1 text-xs">
                      {project.idea_generated && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>Idea Generated ✓</span>
                        </div>
                      )}
                      
                      {project.synopsis_submitted && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>Synopsis Submitted ✓</span>
                        </div>
                      )}
                      
                      {project.status === 'completed' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>Project Completed ✓</span>
                        </div>
                      )}
                      
                      {project.status === 'in_progress' && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Clock className="w-3 h-3" />
                          <span>Work in Progress...</span>
                        </div>
                      )}

                      {!project.idea_generated && !project.synopsis_submitted && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <AlertCircle className="w-3 h-3" />
                          <span>Waiting to start...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Download Section */}
                  <div className="pt-3 border-t">
                    {project.status === 'completed' && project.project_file_path ? (
                      <Button
                        onClick={handleDownload}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Project
                      </Button>
                    ) : (
                      <Button
                        disabled
                        variant="outline"
                        className="w-full border-gray-300 text-gray-600"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Download unavailable
                      </Button>
                    )}
                  </div>


                  {/* Admin Notes (if available) */}
                  {project.admin_notes && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                      <p className="font-semibold text-blue-900 mb-1">Admin Update:</p>
                      <p className="text-blue-700">{project.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Yet</h3>
              <p className="text-gray-500 mb-4">Start your journey by creating your first project</p>
              <Button onClick={() => navigate('/project-setup')}>
                Create New Project
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        {projects.length > 0 && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-3">
                Projects are updated by our admin team. Check back regularly for progress updates and download links.
              </p>
              <Button 
                size="sm" 
                variant="outline"
                className="border-blue-300"
                onClick={() => navigate('/request-admin-help')}
              >
                Contact Admin
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyProjects;
