import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar,
  Settings,
  LogOut,
  Upload,
  Book,
  FolderOpen,
  ShoppingCart,
  Users,
  FileText,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Activity,
  CreditCard,
  QrCode,
  XCircle
} from "lucide-react";
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders, getAuthHeadersForUpload } from "@/config/api";
import { handleApiError, handleApiSuccess } from "@/utils/errorHandler";

const API_BASE = `${API_BASE_URL}/api`;

// Helper: Get JWT token from localStorage
const getToken = () => localStorage.getItem("tyforge_token");

// Helper: API call with auth
const apiCall = async (endpoint: string, options: any = {}) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    joinedDate: ""
  });
  const [stats, setStats] = useState({
    projects: 0,
    orders: 0,
    meetings: 0,
    synopsis: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [synopsisFile, setSynopsisFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Payment State
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showUploadProofModal, setShowUploadProofModal] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [amountPaid, setAmountPaid] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Check if user is logged in
        const token = getToken();
        if (!token) {
          window.location.href = "/login";
          return;
        }

        // Get current user
        const userData = await apiCall("/users/me");
        setUser(userData);
        setUserProfile({
          name: userData.name || "User",
          email: userData.email || "",
          phone: userData.phone || "+91 ",
          joinedDate: new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });

        // Fetch user statistics
        try {
          const [projectsData, ordersData, meetingsData, requestsData] = await Promise.all([
            apiCall("/projects/me").catch(() => []),
            apiCall("/orders/me").catch(() => []),
            apiCall("/meetings/me").catch(() => []),
            apiCall("/admin/requests/me").catch(() => [])
          ]);

          setStats({
            projects: projectsData.length || 0,
            orders: ordersData.length || 0,
            meetings: meetingsData.length || 0,
            synopsis: 0 // Will be updated when synopsis endpoint is available
          });
          
          setMyRequests(requestsData);

          // Find pending order for payment
          const pending = ordersData.find((o: any) => o.status === 'pending');
          if (pending) {
            setPaymentOrder(pending);
          }

          // Combine recent activity
          const activities = [
            ...projectsData.slice(0, 3).map((p: any) => ({
              type: 'project',
              title: p.title,
              date: p.created_at,
              status: p.status
            })),
            ...ordersData.slice(0, 2).map((o: any) => ({
              type: 'order',
              title: `Order #${o.id}`,
              date: o.created_at,
              status: o.status
            }))
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

          setRecentActivity(activities);
        } catch (statsError) {
          console.log("Stats not available yet");
        }
      } catch (error) {
        // Redirect to login if not authenticated
        localStorage.removeItem("tyforge_token");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSynopsisUpload = async () => {
    if (!synopsisFile || !user) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", synopsisFile);

      const token = getToken();
      const res = await fetch(`${API_BASE}/synopsis/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();

      handleApiSuccess('Synopsis uploaded successfully! Admin will review it soon.');
      setSynopsisFile(null);
    } catch (error) {
      handleApiError(error, 'Error uploading synopsis');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaymentProofUpload = async () => {
    if (!paymentProofFile || !paymentOrder) return;
    
    setIsSubmittingProof(true);
    try {
      const formData = new FormData();
      formData.append("file", paymentProofFile);
      // Note: Backend might not accept amount field yet, but we collect it for future
      // formData.append("amount_paid", amountPaid); 

      const token = getToken();
      // Using the specific payment proof endpoint
      const res = await fetch(`${API_BASE}/payment/orders/${paymentOrder.id}/proof`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      handleApiSuccess('Payment proof uploaded successfully! Admin will verify shortly.');
      setShowUploadProofModal(false);
      setPaymentProofFile(null);
      setAmountPaid("");
      
      // Refresh data to update UI
      window.location.reload();
      
    } catch (error) {
      handleApiError(error, 'Error uploading payment proof');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const handleBlackBookDownload = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/blackbook/download`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Download failed");
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'BlackBook.pdf';
      a.click();
    } catch (error) {
      handleApiError(error, 'Error downloading black book');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile.name}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your projects today.</p>
        </div>

        {/* Payment Pending Hero Card - High Priority */}
        {paymentOrder && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <Card className="border-2 border-orange-200 bg-orange-50/50 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-orange-800 text-xl">
                  <CreditCard className="w-6 h-6" />
                  Action Required: Payment Pending
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Your <strong>{paymentOrder.plan_name}</strong> plan is waiting for payment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 w-full">
                    <div className="bg-white p-4 rounded-lg border border-orange-100 mb-4 md:mb-0 flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Amount Due:</span>
                      <span className="text-2xl font-bold text-orange-600">₹{paymentOrder.amount?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <Button 
                      className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white"
                      size="lg"
                      onClick={() => setShowPayModal(true)}
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Pay Now
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 md:flex-none border-orange-300 text-orange-700 hover:bg-orange-100"
                      size="lg"
                      onClick={() => setShowUploadProofModal(true)}
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Proof
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {/* Projects */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-100" onClick={() => navigate('/my-projects')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.projects}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">Active Projects</p>
            </CardContent>
          </Card>


          {/* Meetings */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-blue-50" onClick={() => navigate('/meet')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CheckCircle className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{stats.meetings}</p>
              <p className="text-sm font-medium text-blue-700 mt-1">Scheduled Meetings</p>
            </CardContent>
          </Card>

          {/* Synopsis */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-indigo-100 col-span-2 md:col-span-1" onClick={() => navigate('/synopsis')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.synopsis}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">Synopsis Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Quick Actions & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Navigate to the most common features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 text-center"
                    onClick={() => navigate('/idea-generator')}
                  >
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Lightbulb className="w-6 h-6 text-yellow-600" />
                    </div>
                    <span className="font-medium text-sm">Generate<br/>Ideas</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 hover:border-purple-300 text-center"
                    onClick={() => navigate('/my-projects')}
                  >
                    <div className="p-2 bg-purple-100 rounded-full">
                      <FolderOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="font-medium text-sm">My<br/>Projects</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-green-50 hover:border-green-300 text-center"
                    onClick={() => navigate('/meet')}
                  >
                    <div className="p-2 bg-green-100 rounded-full">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="font-medium text-sm">Schedule<br/>Meeting</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-indigo-50 hover:border-indigo-300 text-center"
                    onClick={() => navigate('/contact')}
                  >
                    <div className="p-2 bg-indigo-100 rounded-full">
                      <MessageSquare className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="font-medium text-sm">Get<br/>Help</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest projects and orders</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${activity.type === 'project' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                            {activity.type === 'project' ? (
                              <FolderOpen className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ShoppingCart className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{activity.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'} className="whitespace-nowrap ml-2">
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activity yet</p>
                    <p className="text-sm">Start by creating a project!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile & Resources */}
          <div className="space-y-6">
            
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center pb-4 border-b">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-white">
                    <span className="text-2xl font-bold text-white">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{userProfile.name}</h3>
                  <p className="text-sm text-gray-600">{userProfile.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Joined {userProfile.joinedDate}</p>
                </div>

                <div className="pt-2 space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-gray-100"
                    onClick={() => navigate('/profile')}
                  >
                    <Settings className="w-4 h-4 mr-2 text-gray-500" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      localStorage.removeItem("tyforge_token");
                      window.location.href = "/login";
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Upload Synopsis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  Upload Synopsis
                </CardTitle>
                <CardDescription>Submit your project synopsis PDF</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSynopsisFile(e.target.files?.[0] || null)}
                    className="w-full text-sm border rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleSynopsisUpload}
                  disabled={!synopsisFile || isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Synopsis'}
                </Button>
              </CardContent>
            </Card>

            {/* My Requests Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    My Requests
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/request-admin-help')}
                  >
                    New Request
                  </Button>
                </CardTitle>
                <CardDescription>Track your help requests and admin responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {myRequests.length > 0 ? (
                    myRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm">{request.subject}</h4>
                              <Badge variant="outline" className="text-xs">
                                {request.request_type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {request.description}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'rejected' ? 'destructive' :
                              request.status === 'resolved' ? 'default' :
                              request.status === 'in_progress' ? 'secondary' :
                              request.status === 'closed' ? 'destructive' : 'outline'
                            }
                            className={
                              request.status === 'approved' 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : request.status === 'rejected'
                                ? 'bg-red-600 hover:bg-red-700'
                                : ''
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        
                        {request.admin_response && (
                          <div className={`border rounded p-2 mt-2 ${
                            request.status === 'approved' 
                              ? 'bg-green-50 border-green-200' 
                              : request.status === 'rejected'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-blue-50 border-blue-200'
                          }`}>
                            <p className={`text-xs font-semibold flex items-center gap-1 ${
                              request.status === 'approved' 
                                ? 'text-green-900' 
                                : request.status === 'rejected'
                                ? 'text-red-900'
                                : 'text-blue-900'
                            }`}>
                              {request.status === 'approved' ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  ✅ Approved - Admin Response:
                                </>
                              ) : request.status === 'rejected' ? (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  ❌ Rejected - Admin Response:
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Admin Response:
                                </>
                              )}
                            </p>
                            <p className={`text-xs mt-1 ${
                              request.status === 'approved' 
                                ? 'text-green-800' 
                                : request.status === 'rejected'
                                ? 'text-red-800'
                                : 'text-blue-800'
                            }`}>
                              {request.admin_response}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-400">
                          {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        
                        {/* Approve Button (No logic - just visual) */}
                        {request.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No requests yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => navigate('/request-admin-help')}
                      >
                        Submit Your First Request
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resources Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-orange-600" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleBlackBookDownload}
                  >
                    <Book className="w-4 h-4 mr-2" />
                    Download Black Book
                  </Button>
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                    <p className="text-[11px] text-orange-800 leading-relaxed">
                      🤖 <strong>AI Update:</strong> We are currently building the AI for the Black Book! You will be notified once your Black Book is ready or made by the admin. 📢
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/guidelines')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pay Now Modal */}
      <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Scan & Pay via UPI</DialogTitle>
            <DialogDescription className="text-center">
              Use any UPI app (GPay, PhonePe, Paytm)
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="bg-white p-2 border-2 border-dashed border-gray-300 rounded-lg">
              <img 
                src="/qrcode.jpeg" 
                alt="Payment QR Code" 
                className="w-64 h-64 object-contain"
              />
            </div>
            <div className="text-center space-y-1 w-full">
              <p className="text-sm text-gray-500">UPI ID</p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-gray-100 px-3 py-1 rounded text-lg font-mono font-bold text-gray-800">
                  pp3912777@oksbi
                </code>
              </div>
            </div>
            <div className="text-center bg-blue-50 p-3 rounded-lg w-full">
              <p className="text-sm text-blue-800">
                Amount to Pay: <span className="font-bold">₹{paymentOrder?.amount?.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <Button onClick={() => {
            setShowPayModal(false);
            setShowUploadProofModal(true);
          }}>
            I've Paid, Upload Proof
          </Button>
        </DialogContent>
      </Dialog>

      {/* Upload Proof Modal */}
      <Dialog open={showUploadProofModal} onOpenChange={setShowUploadProofModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Payment Proof</DialogTitle>
            <DialogDescription>
              Please upload the payment screenshot and confirm the amount.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Paid (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount paid"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof">Payment Screenshot</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  id="proof"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="proof" className="cursor-pointer block">
                  {paymentProofFile ? (
                    <div className="text-green-600 flex flex-col items-center">
                      <CheckCircle className="w-8 h-8 mb-2" />
                      <span className="font-medium truncate max-w-[200px]">{paymentProofFile.name}</span>
                      <span className="text-xs mt-1">Click to change</span>
                    </div>
                  ) : (
                    <div className="text-gray-500 flex flex-col items-center">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="font-medium">Click to upload screenshot</span>
                      <span className="text-xs mt-1">JPG, PNG allowed</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowUploadProofModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePaymentProofUpload}
              disabled={!paymentProofFile || !amountPaid || isSubmittingProof}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmittingProof ? 'Uploading...' : 'Submit Proof'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default Dashboard;