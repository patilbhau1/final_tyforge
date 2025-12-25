import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Settings, 
  LogOut, 
  Edit3, 
  Save,
  X,
  Loader2,
  Lightbulb,
  FileText,
  CheckCircle,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders } from "@/config/api";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at: string;
  selected_plan?: {
    name: string;
    price: number;
    features: string[];
  };
  projects_count: number;
  synopsis_status: string;
  signup_step: string;
  onboarding_completed: boolean;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");

  // Payment proof upload
  const [orders, setOrders] = useState<any[]>([]);
  const [latestOrder, setLatestOrder] = useState<any | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("tyforge_token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch user profile
      const profileRes = await fetch(API_ENDPOINTS.USERS.ME, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      
      const userData = await profileRes.json();
      
      // Fetch user projects and synopsis status
      const projectsRes = await fetch(API_ENDPOINTS.PROJECTS.LIST, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      const synopsisRes = await fetch(API_ENDPOINTS.SYNOPSIS.LIST, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      // Fetch user orders (for payment proof)
      const ordersRes = await fetch(API_ENDPOINTS.ORDERS.ME || `${API_BASE_URL}/api/orders/me`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      const projectsData = projectsRes.ok ? await projectsRes.json() : [];
      const synopsisData = synopsisRes.ok ? await synopsisRes.json() : [];
      const ordersData = ordersRes.ok ? await ordersRes.json() : [];

      setOrders(ordersData);
      const latest = ordersData?.slice()?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;
      setLatestOrder(latest);

      // Fetch plan details if user has selected a plan
      let planDetails = undefined;
      if (userData.selected_plan_id) {
        const plansRes = await fetch(API_ENDPOINTS.PLANS.LIST, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          const userPlan = plansData.find((plan: any) => plan.id === userData.selected_plan_id);
          if (userPlan) {
            planDetails = {
              name: userPlan.name,
              price: userPlan.price,
              features: typeof userPlan.features === 'string' 
                ? userPlan.features.split(',').map((f: string) => f.trim())
                : userPlan.features,
            };
          }
        }
      }

      // Get signup status
      const statusRes = await fetch(API_ENDPOINTS.USER.SIGNUP_STATUS, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      let signupStatus = { signup_step: 'completed', onboarding_completed: true };
      if (statusRes.ok) {
        signupStatus = await statusRes.json();
      }

      const fullProfile: UserProfile = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        created_at: userData.created_at,
        selected_plan: planDetails,
        projects_count: projectsData.length,
        synopsis_status: synopsisData.length > 0 ? synopsisData[0]?.status || 'pending' : 'not_submitted',
        signup_step: signupStatus.signup_step,
        onboarding_completed: signupStatus.onboarding_completed,
      };

      setProfile(fullProfile);
      setEditedName(userData.name);
      setEditedPhone(userData.phone);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName(profile?.name || "");
    setEditedPhone(profile?.phone || "");
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("tyforge_token");
      
      // Update profile
      const response = await fetch(API_ENDPOINTS.USER.UPDATE_PROFILE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editedName,
          phone: editedPhone,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");
      
      setProfile(prev => prev ? { ...prev, name: editedName, phone: editedPhone } : null);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tyforge_token");
    localStorage.removeItem("user_id");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/login");
  };

  const handleCompleteOnboarding = () => {
    if (profile?.signup_step === 'completed' && !profile?.onboarding_completed) {
      navigate("/select-plan");
    } else if (profile?.signup_step === 'plan_selection') {
      navigate("/select-plan");
    } else if (profile?.signup_step === 'project_setup') {
      navigate("/project-setup");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h2>
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEditing ? (
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-xl font-bold"
                      />
                    ) : (
                      profile.name
                    )}
                  </h1>
                  <p className="text-gray-600">{profile.email}</p>
                  {profile.selected_plan && (
                    <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-purple-500">
                      {profile.selected_plan.name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveProfile} disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEdit}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Payment Verification */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Payment Verification
              </CardTitle>
              <CardDescription>
                Upload your payment screenshot and wait for admin approval.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!latestOrder ? (
                <p className="text-gray-600">No plan/order found yet. Please select a plan first.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{latestOrder.plan_name}</p>
                      <p className="text-sm text-gray-600">Amount: ₹{latestOrder.amount?.toLocaleString?.() ?? latestOrder.amount}</p>
                      {latestOrder.service_type && (
                        <Badge variant="outline" className="mt-2">
                          {latestOrder.service_type === 'web-app' ? '💻 Web & App' : '🔌 IoT'}
                        </Badge>
                      )}
                    </div>
                    <Badge
                      className={
                        latestOrder.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : latestOrder.status === 'paid'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }
                    >
                      {latestOrder.status === 'completed'
                        ? '✅ Approved'
                        : latestOrder.status === 'paid'
                        ? '🕒 Under Review'
                        : '⚠ Pending Payment'}
                    </Badge>
                  </div>

                  {latestOrder.status !== 'completed' && (
                    <div className="space-y-3">
                      <Label>Upload Payment Screenshot (JPG/PNG)</Label>
                      <Input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                      />
                      <Button
                        disabled={!paymentFile || uploadingPayment}
                        onClick={async () => {
                          try {
                            setUploadingPayment(true);
                            const token = localStorage.getItem('tyforge_token');
                            const form = new FormData();
                            form.append('file', paymentFile as File);

                            const res = await fetch(`${API_BASE_URL}/api/payment/orders/${latestOrder.id}/proof`, {
                              method: 'POST',
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                              body: form,
                            });

                            if (!res.ok) {
                              const err = await res.json().catch(() => ({}));
                              throw new Error(err.detail || 'Upload failed');
                            }

                            toast({
                              title: 'Uploaded',
                              description: 'Payment proof uploaded. Awaiting admin verification.',
                            });
                            setPaymentFile(null);
                            await fetchProfile();
                          } catch (err: any) {
                            toast({
                              title: 'Error',
                              description: err.message,
                              variant: 'destructive',
                            });
                          } finally {
                            setUploadingPayment(false);
                          }
                        }}
                        className="w-full"
                      >
                        {uploadingPayment ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          'Upload Payment Proof'
                        )}
                      </Button>

                      {latestOrder.payment_proof_original_name && (
                        <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-3">
                          📎 Uploaded: {latestOrder.payment_proof_original_name}
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        After upload, admin will verify your payment. Once approved, you will be able to download your project ZIP and see project activity.
                      </p>
                    </div>
                  )}

                  {latestOrder.status === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">
                      ✅ Your payment is approved. You now have access to your project downloads.
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* My Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-900">{profile.email}</span>
                </div>
              </div>
              
              <div>
                <Label>Phone Number</Label>
                {isEditing ? (
                  <Input
                    value={editedPhone}
                    onChange={(e) => setEditedPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-900">
                      {profile.phone || "Not provided"}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <Label>Member Since</Label>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/synopsis")}
                  className="justify-start h-20 flex-col"
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Upload Synopsis
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/black-book")}
                  className="justify-start h-20 flex-col"
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Black Book
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="justify-start h-20 flex-col"
                >
                  <Settings className="h-6 w-6 mb-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;