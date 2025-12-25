import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Users, 
  FolderOpen, 
  ShoppingCart, 
  Calendar,
  FileText,
  MessageSquare,
  LogOut,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Lightbulb,
  Send
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
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'API error');
  }
  return res.json();
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_users: 0,
    total_orders: 0,
    total_projects: 0,
    pending_synopsis: 0,
    pending_requests: 0
  });

  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [adminRequests, setAdminRequests] = useState<any[]>([]);
  const [synopsis, setSynopsis] = useState<any[]>([]);
  
  // Request approval dialog state
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsData = await adminApiCall('/api/admin/stats');
      setStats(statsData);

      // Fetch all data
      const [usersData, projectsData, ordersData, meetingsData, requestsData, synopsisData] = await Promise.all([
        adminApiCall('/api/users/').catch(() => []),
        adminApiCall('/api/projects/all').catch(() => []),
        adminApiCall('/api/orders/all').catch(() => []),
        adminApiCall('/api/meetings/all').catch(() => []),
        adminApiCall('/api/admin/requests').catch(() => []),
        adminApiCall('/api/synopsis/all').catch(() => [])
      ]);

      setUsers(usersData);
      setProjects(projectsData);
      setOrders(ordersData);
      setMeetings(meetingsData);
      setAdminRequests(requestsData);
      setSynopsis(synopsisData);
    } catch (error: any) {
      handleApiError(error, 'Failed to load admin data');
      if (error.message.includes('403') || error.message.includes('401')) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    handleApiSuccess('Logged out successfully');
    navigate('/admin/login');
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminApiCall(`/api/users/${userId}`, { method: 'DELETE' });
      handleApiSuccess('User deleted successfully');
      fetchAllData();
    } catch (error) {
      handleApiError(error, 'Failed to delete user');
    }
  };

  const handleOpenRequestDialog = (request: any) => {
    setSelectedRequest(request);
    setAdminResponse(request.admin_response || '');
  };

  const handleCloseRequestDialog = () => {
    setSelectedRequest(null);
    setAdminResponse('');
  };

  const handleUpdateRequestWithResponse = async (status: string) => {
    if (!selectedRequest) return;
    
    try {
      setIsProcessingRequest(true);
      await adminApiCall(`/api/admin/requests/${selectedRequest.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status,
          admin_response: adminResponse 
        })
      });
      
      const statusText = status === 'approved' ? 'approved' : 
                         status === 'rejected' ? 'rejected' :
                         status === 'resolved' ? 'resolved' : 
                         status === 'in_progress' ? 'marked as in progress' : 
                         status === 'closed' ? 'closed' : 'updated';
      handleApiSuccess(`Request ${statusText} successfully!`);
      handleCloseRequestDialog();
      fetchAllData();
    } catch (error) {
      handleApiError(error, 'Failed to update request');
    } finally {
      setIsProcessingRequest(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: string) => {
    try {
      await adminApiCall(`/api/admin/requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      handleApiSuccess('Request status updated');
      fetchAllData();
    } catch (error) {
      handleApiError(error, 'Failed to update request');
    }
  };

  const handleUpdateMeetingStatus = async (meetingId: string, status: string) => {
    try {
      await adminApiCall(`/api/meetings/${meetingId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      handleApiSuccess(`Meeting marked as ${status}`);
      fetchAllData();
    } catch (error) {
      handleApiError(error, 'Failed to update meeting status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Admin Portal</h1>
                <p className="text-sm text-purple-100">TY Project Launchpad</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/students')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Users className="w-4 h-4 mr-2" />
                Students
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/synopsis')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <FileText className="w-4 h-4 mr-2" />
                Synopsis
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/idea-submissions')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Idea Submissions
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/approved-ideas')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <FileText className="w-4 h-4 mr-2" />
                Approved Ideas
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
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <Users className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.total_users}</p>
              <p className="text-sm opacity-90">Total Users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <FolderOpen className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.total_projects}</p>
              <p className="text-sm opacity-90">Projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <ShoppingCart className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.total_orders}</p>
              <p className="text-sm opacity-90">Orders</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <FileText className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.pending_synopsis}</p>
              <p className="text-sm opacity-90">Pending Synopsis</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <MessageSquare className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.pending_requests}</p>
              <p className="text-sm opacity-90">Pending Requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-md">
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="meetings">Meetings ({meetings.length})</TabsTrigger>
            <TabsTrigger value="requests">Requests ({adminRequests.length})</TabsTrigger>
            <TabsTrigger value="synopsis">Synopsis ({synopsis.length})</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Name</th>
                        <th className="text-left p-3 font-semibold">Email</th>
                        <th className="text-left p-3 font-semibold">Phone</th>
                        <th className="text-left p-3 font-semibold">Admin</th>
                        <th className="text-left p-3 font-semibold">Created</th>
                        <th className="text-left p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{user.name}</td>
                          <td className="p-3">{user.email}</td>
                          <td className="p-3">{user.phone || 'N/A'}</td>
                          <td className="p-3">
                            {user.is_admin ? (
                              <Badge className="bg-purple-100 text-purple-700">Admin</Badge>
                            ) : (
                              <Badge variant="outline">User</Badge>
                            )}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!user.is_admin && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Project Management
                </CardTitle>
                <CardDescription>View and manage all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Title</th>
                        <th className="text-left p-3 font-semibold">Description</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Created</th>
                        <th className="text-left p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{project.title}</td>
                          <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                            {project.description || 'No description'}
                          </td>
                          <td className="p-3">
                            <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                              {project.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(project.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Management
                </CardTitle>
                <CardDescription>Track and manage all orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Order ID</th>
                        <th className="text-left p-3 font-semibold">Plan</th>
                        <th className="text-left p-3 font-semibold">Amount</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Date</th>
                        <th className="text-left p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-sm">#{order.id}</td>
                          <td className="p-3">{order.plan_name || 'N/A'}</td>
                          <td className="p-3 font-semibold">₹{order.amount}</td>
                          <td className="p-3">
                            <Badge
                              variant={
                                order.status === 'completed'
                                  ? 'default'
                                  : order.status === 'pending'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Meeting Management
                </CardTitle>
                <CardDescription className="text-blue-700">View all scheduled meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Date & Time</th>
                        <th className="text-left p-3 font-semibold">Student</th>
                        <th className="text-left p-3 font-semibold">Topic</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Created</th>
                        <th className="text-left p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.map((meeting) => (
                        <tr key={meeting.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="text-sm">
                              {(() => {
                                // Debug: Log the meeting_date value
                                console.log('Meeting Date Raw:', meeting.meeting_date, 'Type:', typeof meeting.meeting_date);
                                
                                if (!meeting.meeting_date) {
                                  return (
                                    <div>
                                      <p className="font-medium text-yellow-600">📅 Not Scheduled</p>
                                      <p className="text-xs text-gray-500">Awaiting admin schedule</p>
                                    </div>
                                  );
                                }
                                
                                // Try parsing the date
                                const d = new Date(meeting.meeting_date);
                                console.log('Parsed Date:', d, 'Valid:', !isNaN(d.getTime()));
                                
                                if (isNaN(d.getTime())) {
                                  return (
                                    <div>
                                      <p className="font-medium text-red-500">Invalid Date</p>
                                      <p className="text-xs text-gray-400">Raw: {String(meeting.meeting_date)}</p>
                                    </div>
                                  );
                                }
                                return (
                                  <>
                                    <p className="font-medium">{d.toLocaleDateString()}</p>
                                    <p className="text-gray-600">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <p className="font-medium">{meeting.user?.name || 'Unknown'}</p>
                              <p className="text-gray-500 text-xs">{meeting.user?.email}</p>
                            </div>
                          </td>
                          <td className="p-3">{meeting.title || 'No topic'}</td>
                          <td className="p-3">
                            <Badge 
                              variant={
                                meeting.status === 'approved' ? 'default' :
                                meeting.status === 'completed' ? 'default' : 
                                meeting.status === 'scheduled' ? 'secondary' : 
                                meeting.status === 'rejected' ? 'destructive' :
                                meeting.status === 'cancelled' ? 'destructive' :
                                'outline'
                              }
                              className={
                                meeting.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''
                              }
                            >
                              {meeting.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(meeting.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              {meeting.status === 'requested' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleUpdateMeetingStatus(meeting.id, 'approved')}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleUpdateMeetingStatus(meeting.id, 'rejected')}
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {(meeting.status === 'approved' || meeting.status === 'scheduled') && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-blue-600"
                                  onClick={() => handleUpdateMeetingStatus(meeting.id, 'completed')}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Complete
                                </Button>
                              )}
                              {meeting.status !== 'completed' && meeting.status !== 'cancelled' && meeting.status !== 'rejected' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600"
                                  onClick={() => handleUpdateMeetingStatus(meeting.id, 'cancelled')}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Admin Requests
                </CardTitle>
                <CardDescription>Handle user support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{request.subject || 'Support Request'}</h4>
                            <Badge variant="outline" className="text-xs">
                              {request.request_type || 'general'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{request.description || request.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            📅 {new Date(request.created_at).toLocaleString()}
                          </p>
                          {request.admin_response && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                              <p className="font-semibold text-blue-900">Admin Response:</p>
                              <p className="text-blue-800">{request.admin_response}</p>
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={
                            request.status === 'approved'
                              ? 'default'
                              : request.status === 'rejected'
                              ? 'destructive'
                              : request.status === 'resolved'
                              ? 'default'
                              : request.status === 'in_progress'
                              ? 'secondary'
                              : request.status === 'closed'
                              ? 'destructive'
                              : 'outline'
                          }
                          className={
                            request.status === 'approved'
                              ? 'bg-green-600 hover:bg-green-700'
                              : ''
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenRequestDialog(request)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View & Respond
                        </Button>
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateRequestStatus(request.id, 'in_progress')}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            In Progress
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {adminRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No admin requests</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Synopsis Tab */}
          <TabsContent value="synopsis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Synopsis Management
                </CardTitle>
                <CardDescription>Review and approve synopsis submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">File Name</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Submitted</th>
                        <th className="text-left p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {synopsis.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{item.file_path?.split('/').pop() || 'synopsis.pdf'}</td>
                          <td className="p-3">
                            <Badge
                              variant={
                                item.status === 'Approved'
                                  ? 'default'
                                  : item.status === 'Pending'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Request Approval Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={handleCloseRequestDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Admin Request Details</DialogTitle>
            <DialogDescription>
              Review and respond to student request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {/* Request Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{selectedRequest.subject}</h3>
                  <Badge variant="outline">{selectedRequest.request_type}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <Badge className="ml-2" variant={
                      selectedRequest.status === 'approved' ? 'default' :
                      selectedRequest.status === 'rejected' ? 'destructive' :
                      selectedRequest.status === 'resolved' ? 'default' :
                      selectedRequest.status === 'in_progress' ? 'secondary' :
                      selectedRequest.status === 'closed' ? 'destructive' : 'outline'
                    }>
                      {selectedRequest.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <span className="ml-2">{new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Request Description */}
              <div>
                <Label>Request Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {selectedRequest.description}
                </div>
              </div>

              {/* Admin Response */}
              <div>
                <Label htmlFor="admin-response">Admin Response</Label>
                <Textarea
                  id="admin-response"
                  placeholder="Type your response here..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={5}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={handleCloseRequestDialog}
              disabled={isProcessingRequest}
            >
              Cancel
            </Button>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => handleUpdateRequestWithResponse('in_progress')}
                disabled={isProcessingRequest}
              >
                <Clock className="w-4 h-4 mr-2" />
                In Progress
              </Button>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleUpdateRequestWithResponse('approved')}
                disabled={isProcessingRequest || !adminResponse.trim()}
              >
                {isProcessingRequest ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Send
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleUpdateRequestWithResponse('rejected')}
                disabled={isProcessingRequest || !adminResponse.trim()}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject & Send
              </Button>
              <Button
                variant="outline"
                className="text-gray-600"
                onClick={() => handleUpdateRequestWithResponse('resolved')}
                disabled={isProcessingRequest || !adminResponse.trim()}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
