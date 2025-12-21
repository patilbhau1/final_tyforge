import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import { handleApiError, handleApiSuccess } from "@/utils/errorHandler";

const API_BASE = `${API_BASE_URL}/api`;
const getToken = () => localStorage.getItem("tyforge_token");

const Synopsis = () => {
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch(`${API_BASE}/synopsis`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setFiles(data);
      } catch (error) {
        handleApiError(error, "Failed to load synopsis");
      }
    };
    fetchFiles();
  }, []);

  const handleUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetch(`${API_BASE}/synopsis/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      handleApiSuccess("Synopsis uploaded successfully");
      setUploadFile(null);
      // Refresh
      const newRes = await fetch(`${API_BASE}/synopsis`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setFiles(await newRes.json());
    } catch (error) {
      handleApiError(error, "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Synopsis</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload New Synopsis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="flex-1 text-sm border rounded-lg px-3 py-2"
                />
                <Button onClick={handleUpload} disabled={!uploadFile || isUploading}>
                  <Upload size={16} className="mr-2" />
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              {uploadFile && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>📄 Selected:</span>
                    <span className="font-medium break-all">
                      {uploadFile.name.length > 40 
                        ? `${uploadFile.name.substring(0, 37)}...` 
                        : uploadFile.name}
                    </span>
                    <span className="text-blue-700 font-semibold whitespace-nowrap">
                      ({uploadFile.size > 0 ? (uploadFile.size / 1024).toFixed(2) : '0.00'} KB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Previous Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No uploads yet.</p>
            ) : (
              <div className="space-y-3">
                {files.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="font-medium">{file.original_name}</p>
                        <div className="flex gap-3 text-sm text-gray-600 mt-1">
                          <span>📅 {new Date(file.created_at).toLocaleDateString()}</span>
                          {file.file_size && file.file_size !== "0" && (
                            <span>📦 {(parseInt(file.file_size) / (1024 * 1024)).toFixed(2)} MB</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={
                          file.status === "Approved" 
                            ? "bg-green-100 text-green-800 border-green-300" 
                            : file.status === "Rejected"
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-yellow-100 text-yellow-800 border-yellow-300"
                        }
                      >
                        {file.status === "Pending" ? "⏳ Pending Review" : file.status === "Approved" ? "✅ Approved" : "❌ Rejected"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Synopsis;