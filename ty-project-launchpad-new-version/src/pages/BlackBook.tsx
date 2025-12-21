import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Download } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { handleApiError, handleApiSuccess } from "@/utils/errorHandler";

const API_BASE = `${API_BASE_URL}/api`;
const getToken = () => localStorage.getItem("tyforge_token");

const BlackBook = () => {
  const handleDownload = async () => {
    try {
      const res = await fetch(`${API_BASE}/blackbook/download`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "BlackBook.pdf";
      a.click();
      handleApiSuccess("BlackBook downloaded successfully");
    } catch (error) {
      handleApiError(error, "Download failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Book className="w-6 h-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Black Book</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Download Black Book</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Complete guide and reference material for your projects.</p>
            <Button onClick={handleDownload}>
              <Download size={16} className="mr-2" />
              Download PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlackBook;