import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Users, 
  LogOut,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Link2,
  DollarSign,
  Lightbulb,
  FolderOpen,
  Activity
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { handleApiError, handleApiSuccess } from "@/utils/errorHandler";

// Helper to get admin token
const getAdminToken = () => localStorage.getItem('admin_token');

// Helper for admin API calls
const adminApiCall = async (endpoint: string, options: any = {}) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': options.body instanceof FormData ? undefined : 'application/json',
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'API error');
  }
  return res.json();
};

interface StudentData {
  user: any;
  projects: any[];
  plan: any | null;
  synopsis: any[];
  meetings: any[];
  ideaSubmissions: any[];
  stats: {
    totalProjects: number;
    planName: string;
    planAmount: number;
    hasPaid: boolean;
  };
}

const AdminStudentsGrid = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [projectUrl, setProjectUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projectStatus, setProjectStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [editingSynopsis, setEditingSynopsis] = useState<any>(null);
  const [synopsisStatus, setSynopsisStatus] = useState('');
  const [synopsisNotes, setSynopsisNotes] = useState('');
  
  // Payment proof preview state
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [paymentProofFileName, setPaymentProofFileName] = useState<string>('');

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      
      // Fetch all data with better error logging
      const [usersData, projectsData, ordersData, synopsisData, meetingsData, ideaSubmissionsData] = await Promise.all([
        adminApiCall('/api/users/').catch((err) => { console.error('Failed to fetch users:', err); return []; }),
        adminApiCall('/api/projects/all').catch((err) => { console.error('Failed to fetch projects:', err); return []; }),
        adminApiCall('/api/orders/all').catch((err) => { console.error('Failed to fetch orders:', err); return []; }),
        adminApiCall('/api/synopsis/all').catch((err) => { console.error('Failed to fetch synopsis:', err); return []; }),
        adminApiCall('/api/meetings/all').catch((err) => { console.error('Failed to fetch meetings:', err); return []; }),
        adminApiCall('/api/idea-generation/submissions').catch((err) => { console.error('Failed to fetch idea submissions:', err); return []; }),
      ]);
      
      console.log('📊 Data fetched:', {
        users: usersData.length,
        projects: projectsData.length,
        orders: ordersData.length,
        synopsis: synopsisData.length,
        meetings: meetingsData.length,
        ideaSubmissions: ideaSubmissionsData.length,
      });

      // Map students with their data
      const studentsMap = usersData.map((user: any) => {
        const userProjects = projectsData.filter((p: any) => p.user_id === user.id);
        const userOrders = ordersData.filter((o: any) => o.user_id === user.id);
        const userSynopsis = synopsisData.filter((s: any) => s.user_id === user.id);
        const userMeetings = meetingsData.filter((m: any) => m.user_id === user.id);
        
        // Match idea submissions to this student:
        // 1) Prefer user_id match when available
        // 2) Fallback to phone match (idea submissions track phone)
        const userIdeaSubmissions = ideaSubmissionsData.filter((s: any) =>
          (s.user_id && s.user_id === user.id) ||
          (!s.user_id && s.phone && user.phone && String(s.phone) === String(user.phone))
        );

        // Get single plan/order (latest or completed)
        const userPlan = userOrders.find((o: any) => o.status === 'completed') || userOrders[0] || null;
        const hasPaid = userPlan && userPlan.status === 'completed';

        return {
          user,
          projects: userProjects,
          plan: userPlan,
          synopsis: userSynopsis,
          meetings: userMeetings,
          ideaSubmissions: userIdeaSubmissions,
          stats: {
            totalProjects: userProjects.length,
            planName: userPlan ? userPlan.plan_name : 'No Plan',
            planAmount: userPlan ? userPlan.amount : 0,
            hasPaid
          }
        };
      });

      setStudents(studentsMap);
    } catch (error: any) {
      handleApiError(error, 'Failed to load students');
      if (error.message.includes('403') || error.message.includes('401')) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProjectFile = async (studentId: string) => {
    if (!projectFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', projectFile);
      formData.append('user_id', studentId);

      const token = getAdminToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/upload-project`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      handleApiSuccess('Project file uploaded successfully!');
      setProjectFile(null);
      fetchAllStudents();
    } catch (error) {
      handleApiError(error, 'Failed to upload project file');
    } finally {
      setUploading(false);
    }
  };

  const handleShareProjectUrl = async (studentId: string, approved: boolean) => {
    if (!projectUrl && approved) return;

    try {
      await adminApiCall(`/api/admin/share-project-url`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: studentId,
          project_url: projectUrl,
          approved: approved
        })
      });

      handleApiSuccess(approved ? 'Project URL shared!' : 'Access revoked');
      setProjectUrl('');
      fetchAllStudents();
    } catch (error) {
      handleApiError(error, 'Failed to share project URL');
    }
  };

  const handleUpdateProject = async (projectId: string) => {
    try {
      const updateData: any = {};
      
      if (projectStatus) updateData.status = projectStatus;
      if (adminNotes) updateData.admin_notes = adminNotes;
      if (projectUrl) {
        updateData.project_url = projectUrl;
        updateData.url_approved = true;
      }

      await adminApiCall(`/api/admin/update-project/${projectId}?${new URLSearchParams(updateData).toString()}`, {
        method: 'PUT'
      });

      handleApiSuccess('Project updated successfully!');
      setEditingProject(null);
      setProjectStatus('');
      setAdminNotes('');
      setProjectUrl('');
      fetchAllStudents();
    } catch (error) {
      handleApiError(error, 'Failed to update project');
    }
  };

  const handleDownloadSynopsis = async (synopsisId: string, filename: string) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE_URL}/api/synopsis/admin/download/${synopsisId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Download failed');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      handleApiSuccess('Synopsis downloaded successfully!');
    } catch (error) {
      handleApiError(error, 'Failed to download synopsis');
    }
  };

  const handleUpdateSynopsis = async (synopsisId: string) => {
    try {
      const updateData: any = {};
      
      if (synopsisStatus) updateData.status = synopsisStatus;
      if (synopsisNotes !== undefined) updateData.admin_notes = synopsisNotes;

      await adminApiCall(`/api/synopsis/admin/${synopsisId}?${new URLSearchParams(updateData).toString()}`, {
        method: 'PUT'
      });

      handleApiSuccess('Synopsis updated successfully!');
      setEditingSynopsis(null);
      setSynopsisStatus('');
      setSynopsisNotes('');
      fetchAllStudents();
    } catch (error) {
      handleApiError(error, 'Failed to update synopsis');
    }
  };

  const handleViewPaymentProof = async (orderId: string, fileName: string) => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/payment/admin/orders/${orderId}/proof`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPaymentProofUrl(url);
        setPaymentProofFileName(fileName);
        setShowPaymentProofModal(true);
      } else {
        throw new Error('Failed to load payment proof');
      }
    } catch (e) {
      handleApiError(e, 'Failed to view payment proof');
    }
  };

  const handleClosePaymentProofModal = () => {
    setShowPaymentProofModal(false);
    if (paymentProofUrl) {
      URL.revokeObjectURL(paymentProofUrl);
    }
    setPaymentProofUrl('');
    setPaymentProofFileName('');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    handleApiSuccess('Logged out successfully');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Students Management</h1>
                <p className="text-sm text-purple-100">Manage all registered students</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <Users className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{students.length}</p>
              <p className="text-sm opacity-90">Total Students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">
                {students.filter(s => s.stats.hasPaid).length}
              </p>
              <p className="text-sm opacity-90">Paid Students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <FolderOpen className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">
                {students.reduce((sum, s) => sum + s.stats.totalProjects, 0)}
              </p>
              <p className="text-sm opacity-90">Total Projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">
                ₹{students.reduce((sum, s) => sum + s.stats.planAmount, 0)}
              </p>
              <p className="text-sm opacity-90">Total Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((studentData) => (
            <Card 
              key={studentData.user.id} 
              className="hover:shadow-xl transition-shadow duration-200 border-2 hover:border-purple-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{studentData.user.name}</CardTitle>
                      {studentData.user.is_admin && (
                        <Badge className="bg-purple-100 text-purple-700 mt-1">Admin</Badge>
                      )}
                    </div>
                  </div>
                  {studentData.stats.hasPaid && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{studentData.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{studentData.user.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(studentData.user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{studentData.stats.totalProjects}</div>
                    <div className="text-xs text-gray-600">Projects</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">{studentData.synopsis.length}</div>
                    <div className="text-xs text-gray-600">Synopsis</div>
                    {studentData.ideaSubmissions?.length > 0 && (
                      <div className="text-[10px] text-blue-700 mt-1">
                        💡 {studentData.ideaSubmissions.length} idea(s)
                      </div>
                    )}
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded col-span-2">
                    <div className="text-sm font-semibold text-green-600">{studentData.stats.planName}</div>
                    <div className="text-xl font-bold text-green-700">₹{studentData.stats.planAmount}</div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="pt-2">
                  {studentData.stats.hasPaid ? (
                    <Badge className="w-full justify-center bg-green-100 text-green-700">
                      ✓ Payment Complete
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="w-full justify-center text-orange-600 border-orange-300">
                      ⚠ Pending Payment
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedStudent(studentData);
                      setShowDetailModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedStudent(studentData);
                      setShowDetailModal(true);
                    }}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {students.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No students registered yet</p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  {selectedStudent.user.name}
                </DialogTitle>
                <DialogDescription>
                  Complete student profile and project management
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="font-medium">{selectedStudent.user.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="font-medium">{selectedStudent.user.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Registered On</Label>
                      <p className="font-medium">
                        {new Date(selectedStudent.user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Account Status</Label>
                      <p className="font-medium">
                        {selectedStudent.user.is_admin ? (
                          <Badge className="bg-purple-100 text-purple-700">Admin</Badge>
                        ) : (
                          <Badge variant="outline">Student</Badge>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan & Payment Status */}
                <Card className={selectedStudent.stats.hasPaid ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Plan & Payment Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.plan ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {selectedStudent.plan.plan_name || 'Selected Plan'}
                              </h3>
                              <div className="text-sm text-gray-600">
                                Registered: {new Date(selectedStudent.plan.created_at).toLocaleDateString()}
                              </div>
                              {selectedStudent.plan.service_type && (
                                <div className="mt-2">
                                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                                    {selectedStudent.plan.service_type === 'web-app' ? '💻 Web & App Development' : '🔌 IoT Project'}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                ₹{selectedStudent.plan.amount.toLocaleString()}
                              </div>
                              <Badge variant={selectedStudent.plan.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                                {selectedStudent.plan.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 pt-3 border-t">
                            {selectedStudent.stats.hasPaid ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-semibold text-green-600">Payment Verified ✓</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-5 h-5 text-orange-600" />
                                <span className="font-semibold text-orange-600">Payment Pending ⚠</span>
                              </>
                            )}
                          </div>

                          {/* Payment Proof Review */}
                          {!selectedStudent.stats.hasPaid && selectedStudent.plan?.payment_proof_original_name && (
                            <div className="mt-4 p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                              <div className="text-sm font-semibold text-blue-900 mb-2">Payment Proof Uploaded</div>
                              <div className="text-xs text-blue-800 mb-3">📎 {selectedStudent.plan.payment_proof_original_name}</div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-300 text-blue-700"
                                  onClick={() => handleViewPaymentProof(selectedStudent.plan.id, selectedStudent.plan.payment_proof_original_name)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Proof
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={async () => {
                                    try {
                                      await adminApiCall(`/api/payment/admin/orders/${selectedStudent.plan.id}/approve`, { method: 'POST' });
                                      handleApiSuccess('Payment approved! Student now has access.');
                                      fetchAllStudents();
                                    } catch (e) {
                                      handleApiError(e, 'Failed to approve payment');
                                    }
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve Payment
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No plan selected yet</p>
                        <p className="text-sm text-gray-400 mt-1">Student needs to choose a plan</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Projects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FolderOpen className="w-5 h-5" />
                      Projects ({selectedStudent.projects.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.projects.length > 0 ? (
                      <div className="space-y-3">
                        {selectedStudent.projects.map((project) => (
                          <div key={project.id} className="p-4 border-2 rounded-lg bg-white">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{project.title}</h4>
                                <div className="text-sm text-gray-600 mt-1">{project.description || 'No description'}</div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Created: {new Date(project.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge>{project.status}</Badge>
                            </div>

                            {/* Admin Controls for this project */}
                            <div className="mt-3 pt-3 border-t space-y-3">
                              <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Update Status</Label>
                                  <select
                                    className="w-full mt-1 px-3 py-2 border rounded text-sm"
                                    value={editingProject?.id === project.id ? projectStatus : project.status}
                                    onChange={(e) => {
                                      setEditingProject(project);
                                      setProjectStatus(e.target.value);
                                    }}
                                  >
                                    <option value="idea_pending">Idea Pending</option>
                                    <option value="synopsis_pending">Synopsis Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-xs">Project URL</Label>
                                  <Input
                                    type="url"
                                    placeholder="Download link"
                                    className="mt-1 text-sm"
                                    defaultValue={project.project_url || ''}
                                    onChange={(e) => {
                                      setEditingProject(project);
                                      setProjectUrl(e.target.value);
                                    }}
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs">Admin Notes (Visible to Student)</Label>
                                <Textarea
                                  placeholder="Add updates for the student..."
                                  className="mt-1 text-sm"
                                  rows={2}
                                  defaultValue={project.admin_notes || ''}
                                  onChange={(e) => {
                                    setEditingProject(project);
                                    setAdminNotes(e.target.value);
                                  }}
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateProject(project.id)}
                                  disabled={editingProject?.id !== project.id}
                                  className="flex-1"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Update Project
                                </Button>
                                {project.url_approved && (
                                  <Badge variant="default" className="self-center">
                                    ✓ URL Approved
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Current Admin Notes Display */}
                            {project.admin_notes && (
                              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-xs font-semibold text-blue-900">Current Note:</p>
                                <p className="text-xs text-blue-700">{project.admin_notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No projects yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* AI Idea Submissions (when student has no synopsis) */}
                <Card className={selectedStudent.ideaSubmissions?.length ? 'border-blue-300 bg-blue-50' : ''}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      AI Idea Submissions ({selectedStudent.ideaSubmissions?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.ideaSubmissions?.length ? (
                      <div className="space-y-4">
                        {selectedStudent.ideaSubmissions
                          .slice()
                          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map((sub: any) => (
                            <div key={sub.id} className="p-4 border-2 border-blue-200 rounded-lg bg-white">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                                      Generation #{sub.generation_count || '-'}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {sub.created_at ? new Date(sub.created_at).toLocaleString() : ''}
                                    </span>
                                  </div>
                                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-xs font-semibold text-blue-900 mb-1">User Input / Interests</p>
                                    <p className="text-sm text-blue-800 break-words">{sub.interests}</p>
                                  </div>
                                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                                    <p className="text-xs font-semibold text-green-900 mb-1">Grok Generated Idea</p>
                                    <p className="text-sm text-green-800 break-words">{sub.generated_idea}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No AI idea submissions</p>
                    )}
                  </CardContent>
                </Card>

                {/* Synopsis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Synopsis Submissions ({selectedStudent.synopsis.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.synopsis.length > 0 ? (
                      <div className="space-y-4">
                        {selectedStudent.synopsis.map((syn) => (
                          <div key={syn.id} className="p-4 border-2 rounded-lg bg-white">
                            {/* Synopsis Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <div className="flex-1">
                                  <div className="font-semibold text-base">{syn.original_name || 'synopsis.pdf'}</div>
                                  <div className="text-xs text-gray-500">
                                    Uploaded: {new Date(syn.created_at).toLocaleDateString()}
                                  </div>
                                  {syn.file_size && (
                                    <div className="text-xs text-gray-400">
                                      Size: {(parseInt(syn.file_size) / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge variant={syn.status === 'Approved' ? 'default' : syn.status === 'Rejected' ? 'destructive' : 'secondary'}>
                                {syn.status}
                              </Badge>
                            </div>

                            {/* Admin Controls */}
                            <div className="mt-3 pt-3 border-t space-y-3">
                              <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Update Status</Label>
                                  <select
                                    className="w-full mt-1 px-3 py-2 border rounded text-sm"
                                    value={editingSynopsis?.id === syn.id ? synopsisStatus : syn.status}
                                    onChange={(e) => {
                                      setEditingSynopsis(syn);
                                      setSynopsisStatus(e.target.value);
                                    }}
                                  >
                                    <option value="Pending">Pending Review</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                  </select>
                                </div>
                                <div className="flex items-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleDownloadSynopsis(syn.id, syn.original_name)}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download PDF
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs">Admin Notes (Feedback to Student)</Label>
                                <Textarea
                                  placeholder="Add feedback or comments..."
                                  className="mt-1 text-sm"
                                  rows={2}
                                  defaultValue={syn.admin_notes || ''}
                                  onChange={(e) => {
                                    setEditingSynopsis(syn);
                                    setSynopsisNotes(e.target.value);
                                  }}
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateSynopsis(syn.id)}
                                  disabled={editingSynopsis?.id !== syn.id}
                                  className="flex-1"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Update Synopsis
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                                  onClick={() => {
                                    setEditingSynopsis(syn);
                                    setSynopsisStatus('Approved');
                                    setSynopsisNotes(syn.admin_notes || '');
                                    setTimeout(() => handleUpdateSynopsis(syn.id), 100);
                                  }}
                                >
                                  ✓ Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                                  onClick={() => {
                                    setEditingSynopsis(syn);
                                    setSynopsisStatus('Rejected');
                                    setSynopsisNotes(syn.admin_notes || '');
                                    setTimeout(() => handleUpdateSynopsis(syn.id), 100);
                                  }}
                                >
                                  ✗ Reject
                                </Button>
                              </div>
                            </div>

                            {/* Current Admin Notes Display */}
                            {syn.admin_notes && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-xs font-semibold text-blue-900 mb-1">Current Feedback:</p>
                                <p className="text-sm text-blue-700">{syn.admin_notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No synopsis uploaded</p>
                    )}
                  </CardContent>
                </Card>

                {/* File Upload Section */}
                <Card className="border-2 border-purple-300 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload Project Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="project-file">Upload ZIP File (Project Files)</Label>
                      <Input
                        id="project-file"
                        type="file"
                        accept=".zip"
                        onChange={(e) => setProjectFile(e.target.files?.[0] || null)}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      onClick={() => handleUploadProjectFile(selectedStudent.user.id)}
                      disabled={!projectFile || uploading}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Project ZIP'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Project URL Sharing */}
                <Card className="border-2 border-blue-300 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Link2 className="w-5 h-5" />
                      Share Project URL
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="project-url">Project URL or Download Link</Label>
                      <Input
                        id="project-url"
                        type="url"
                        placeholder="https://example.com/project.zip"
                        value={projectUrl}
                        onChange={(e) => setProjectUrl(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    {selectedStudent.stats.hasPaid ? (
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleShareProjectUrl(selectedStudent.user.id, true)}
                          disabled={!projectUrl}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & Share URL
                        </Button>
                        <p className="text-xs text-green-700 text-center">
                          ✓ Payment verified - Student can download
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleShareProjectUrl(selectedStudent.user.id, false)}
                          variant="outline"
                          className="w-full border-orange-300 text-orange-700"
                          disabled
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Payment Required
                        </Button>
                        <p className="text-xs text-orange-700 text-center">
                          ⚠ Student must complete payment first
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Meetings */}
                {selectedStudent.meetings.length > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Scheduled Meetings ({selectedStudent.meetings.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedStudent.meetings.map((meeting) => (
                          <div key={meeting.id} className="flex items-center justify-between p-2 border rounded bg-white">
                            <div className="flex-1">
                              <div className="font-medium text-blue-900">{meeting.title || 'Meeting'}</div>
                              <div className="text-xs text-blue-700">
                                {meeting.meeting_date 
                                  ? (() => {
                                      const d = new Date(meeting.meeting_date);
                                      return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
                                    })()
                                  : '📅 Not scheduled yet'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge>{meeting.status}</Badge>
                              {meeting.status === 'requested' && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={async () => {
                                    try {
                                      await adminApiCall(`/api/meetings/${meeting.id}`, {
                                        method: 'PUT',
                                        body: JSON.stringify({ status: 'approved' })
                                      });
                                      
                                      // Show success notification with meeting details
                                      handleApiSuccess(`✅ Meeting "${meeting.title || 'Meeting'}" has been approved!`);
                                      
                                      // Refresh data
                                      await fetchAllStudents();
                                      
                                      // Close dialog after a brief delay to show notification
                                      setTimeout(() => {
                                        setSelectedStudent(null);
                                      }, 1500);
                                    } catch (error) {
                                      handleApiError(error, 'Failed to approve meeting');
                                    }
                                  }}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Proof Preview Modal */}
      <Dialog open={showPaymentProofModal} onOpenChange={handleClosePaymentProofModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Payment Proof Preview
            </DialogTitle>
            <DialogDescription>
              Review the uploaded payment proof for verification
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {paymentProofUrl && (
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={paymentProofUrl} 
                  alt="Payment Proof" 
                  className="w-full h-auto max-h-[600px] object-contain bg-gray-50"
                />
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <p><strong>File:</strong> {paymentProofFileName}</p>
              <p className="mt-1">Review this payment proof and then approve or reject the payment.</p>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClosePaymentProofModal}
              >
                Close
              </Button>
              {selectedStudent && (
                <Button
                  className="bg-green-600 hover:bg-green-700 ml-auto"
                  onClick={async () => {
                    try {
                      await adminApiCall(`/api/payment/admin/orders/${selectedStudent.plan.id}/approve`, { method: 'POST' });
                      handleApiSuccess('Payment approved! Student now has access.');
                      handleClosePaymentProofModal();
                      fetchAllStudents();
                    } catch (e) {
                      handleApiError(e, 'Failed to approve payment');
                    }
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Payment
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudentsGrid;
