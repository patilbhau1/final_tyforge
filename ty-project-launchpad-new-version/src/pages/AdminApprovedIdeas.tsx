import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { handleApiError } from "@/utils/errorHandler";

const getAdminToken = () => localStorage.getItem('admin_token');

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
    const error = await res.json().catch(() => ({ detail: 'API error' }));
    throw new Error(error.detail || error.message || 'API error');
  }
  return res.json();
};

interface ApprovedIdeaSubmission {
  id: string;
  name: string;
  phone: string;
  approved_idea: string;
  created_at: string;
}

const AdminApprovedIdeas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<ApprovedIdeaSubmission[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await adminApiCall('/api/approved-ideas/submissions');
        setSubmissions(data);
      } catch (error) {
        handleApiError(error, 'Failed to load approved ideas');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.approved_idea.toLowerCase().includes(q)
    );
  }, [query, submissions]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Loading approved ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Approved Ideas</h1>
                <p className="text-sm text-purple-100">Public submissions (no login)</p>
              </div>
            </div>
            <div className="flex gap-2">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{submissions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Unique Phones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{new Set(submissions.map(s => s.phone)).size}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {submissions.filter(s => new Date(s.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name, phone, or idea text..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No approved idea submissions found.</div>
          ) : (
            filtered.map((s) => (
              <Card key={s.id} className="border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      {s.name}
                    </span>
                    <Badge variant="outline">{s.id.slice(0, 8)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> {s.phone}</span>
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(s.created_at).toLocaleString()}</span>
                  </div>

                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-green-700" />
                      <p className="font-semibold text-green-900">Approved Idea</p>
                    </div>
                    <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap">{s.approved_idea}</p>
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

export default AdminApprovedIdeas;
