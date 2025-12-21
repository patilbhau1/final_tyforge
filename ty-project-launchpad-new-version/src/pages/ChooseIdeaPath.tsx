import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Lightbulb, CheckCircle } from "lucide-react";

const ChooseIdeaPath = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-8 sm:py-12 md:py-16 px-4 min-h-[calc(100vh-128px)]">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Option 1: Generate Idea */}
          <Link to="/idea-generator" className="block">
            <Card className="h-full flex flex-col justify-between hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <Lightbulb className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold">Generate Idea</CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2">
                  Generate idea for your project
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center px-4 sm:px-6">
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Need inspiration? Let our AI help you brainstorm unique project ideas based on your interests.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Option 2: Got Approved Idea */}
          <Link to="/approved-idea" className="block">
            <Card className="h-full flex flex-col justify-between hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold">Got Approved Idea</CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2">
                  Submit your approved idea
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center px-4 sm:px-6">
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Already have a project idea finalized? Submit it directly to us for review and next steps.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChooseIdeaPath;
