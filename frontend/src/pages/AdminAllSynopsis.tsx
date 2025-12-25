import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  FileText, 
  LogOut,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  User,
  Calendar
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

interface SynopsisData {
  id: string;
  user_id: string;
  original_name: string;
  file_size: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  phone: string;
}

const AdminAllSynopsis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [synopsisList, setSynopsisList] = useState<SynopsisData[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, UserData>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingSynopsis, setEditingSynopsis] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

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
      
      // Fetch synopsis and users
      const [synopsisData, usersData] = await Promise.all([
        adminApiCall('/api/synopsis/all').catch((err) => {
          console.error('Failed to fetch synopsis:', err);
          return [];
        }),
        adminApiCall('/api/users/').catch((err) => {
          console.error('Failed to fetch users:', err);
          return [];
        })
      ]);

      console.log('📊 Synopsis data fetched:', synopsisData.length);
      
      // Create users map for quick lookup
      const usersMapTemp = new Map<string, UserData>();
      usersData.forEach((user: UserData) => {
        usersMapTemp.set(user.id, user);
      });
      
      setUsersMap(usersMapTemp);
      setSynopsisList(synopsisData);
    } catch (error: any) {
      handleApiError(error, 'Failed to load synopsis data');
      if (error.message.includes('403') || error.message.includes('401')) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (synopsisId: string, filename: string) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE_URL}/api/synopsis/admin/download/${synopsisId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
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
      
      if (editStatus) updateData.status = editStatus;
      if (editNotes !== undefined) updateData.admin_notes = editNotes;

      await adminApiCall(`/api/synopsis/admin/${synopsisId}?${new URLSearchParams(updateData).toString()}`, {
        method: 'PUT'
      });

      handleApiSuccess('Synopsis updated successfully!');
      setEditingSynopsis(null);
      setEditStatus('');
      setEditNotes('');
      fetchAllData();
    } catch (error) {
      handleApiError(error, 'Failed to update synopsis');
    }
  };

  const handleQuickUpdate = async (synopsisId: string, newStatus: string) => {
    try {
      await adminApiCall(`/api/synopsis/admin/${synopsisId}?status=${newStatus}`, {
        method: 'PUT'
      });
      handleApiSuccess(`Synopsis ${newStatus.toLowerCase()}!`);
      fetchAllData();
    } catch (error) {
      handleApiError(error, 'Failed to update synopsis');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    handleApiSuccess('Logged out successfully');
    navigate('/admin/login');
  };

  // Filter synopsis
  const filteredSynopsis = synopsisList.filter(syn => {
    const user = usersMap.get(syn.user_id);
    const matchesSearch = 
      syn.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || syn.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status counts
  const statusCounts = {
    all: synopsisList.length,
    pending: synopsisList.filter(s => s.status === 'Pending').length,
    approved: synopsisList.filter(s => s.status === 'Approved').length,
    rejected: synopsisList.filter(s => s.status === 'Rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading synopsis...</p>
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
              <FileText className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">All Synopsis</h1>
                <p className="text-sm text-purple-100">Manage all uploaded synopsis</p>
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
                onClick={() => navigate('/admin/students')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Students
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <FileText className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{statusCounts.all}</p>
              <p className="text-sm opacity-90">Total Synopsis</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{statusCounts.pending}</p>
              <p className="text-sm opacity-90">Pending Review</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{statusCounts.approved}</p>
              <p className="text-sm opacity-90">Approved</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <XCircle className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{statusCounts.rejected}</p>
              <p className="text-sm opacity-90">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Label>
                <Input
                  placeholder="Search by filename, student name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter by Status
                </Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Synopsis List */}
        <div className="space-y-4">
          {filteredSynopsis.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No synopsis found</p>
              </CardContent>
            </Card>
          ) : (
            filteredSynopsis.map((syn) => {
              const user = usersMap.get(syn.user_id);
              const isEditing = editingSynopsis === syn.id;
              
              return (
                <Card key={syn.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{syn.original_name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {user?.name || 'Unknown User'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(syn.created_at).toLocaleDateString()}
                            </span>
                            {syn.file_size && syn.file_size !== "0" && (
                              <span>
                                📦 {(parseInt(syn.file_size) / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            )}
                          </div>
                          {user && (
                            <p className="text-xs text-gray-500 mt-1">📧 {user.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            syn.status === 'Approved' ? 'default' : 
                            syn.status === 'Rejected' ? 'destructive' : 
                            'secondary'
                          }
                          className="text-sm"
                        >
                          {syn.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Admin Controls */}
                    {!isEditing ? (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(syn.id, syn.original_name)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingSynopsis(syn.id);
                            setEditStatus(syn.status);
                            setEditNotes(syn.admin_notes || '');
                          }}
                        >
                          Edit Status
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                          onClick={() => handleQuickUpdate(syn.id, 'Approved')}
                          disabled={syn.status === 'Approved'}
                        >
                          ✓ Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                          onClick={() => handleQuickUpdate(syn.id, 'Rejected')}
                          disabled={syn.status === 'Rejected'}
                        >
                          ✗ Reject
                        </Button>
                      </div>
                    ) : (
                      <div className="pt-4 border-t space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Update Status</Label>
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="w-full mt-1 px-3 py-2 border rounded-lg"
                            >
                              <option value="Pending">Pending Review</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">Admin Notes (Feedback to Student)</Label>
                          <Textarea
                            placeholder="Add feedback or comments..."
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateSynopsis(syn.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Save Changes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSynopsis(null);
                              setEditStatus('');
                              setEditNotes('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Display existing admin notes */}
                    {syn.admin_notes && !isEditing && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Admin Feedback:</p>
                        <p className="text-sm text-blue-700">{syn.admin_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAllSynopsis;
