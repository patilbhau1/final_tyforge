import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Lightbulb, 
  LogOut,
  Search,
  Phone,
  User,
  Calendar,
  FileText
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

interface IdeaSubmission {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  interests: string;
  generated_idea: string;
  generation_count: number;
  created_at: string;
}

const AdminIdeaSubmissions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<IdeaSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await adminApiCall('/api/idea-generation/submissions');
      setSubmissions(data);
    } catch (error: any) {
      handleApiError(error, 'Failed to load idea submissions');
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

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.phone.includes(searchTerm) ||
    sub.interests.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Lightbulb className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading idea submissions...</p>
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
              <Lightbulb className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Idea Submissions</h1>
                <p className="text-sm text-purple-100">View all generated project ideas</p>
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
                onClick={() => navigate('/admin/synopsis')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Synopsis
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
        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <Lightbulb className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{submissions.length}</p>
              <p className="text-sm opacity-90">Total Submissions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <User className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{new Set(submissions.map(s => s.phone)).size}</p>
              <p className="text-sm opacity-90">Unique Users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <FileText className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">
                {submissions.filter(s => new Date(s.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm opacity-90">Last 7 Days</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div>
              <Label className="text-sm mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Submissions
              </Label>
              <Input
                placeholder="Search by name, phone, or interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No idea submissions found</p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {submission.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {submission.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(submission.created_at).toLocaleDateString()}
                          </span>
                          <Badge variant="outline">
                            Generation #{submission.generation_count}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User's Interests */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-1">User's Interests:</p>
                    <p className="text-sm text-blue-700">{submission.interests}</p>
                  </div>

                  {/* Generated Idea */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-900 mb-2">AI-Generated Idea:</p>
                    <p className="text-sm text-green-800 leading-relaxed">{submission.generated_idea}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminIdeaSubmissions;
