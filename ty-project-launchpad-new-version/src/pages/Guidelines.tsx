import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, BookOpen, Scale, Award, AlertCircle, CheckCircle2 } from "lucide-react";

const Guidelines = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Guidance, Disclaimer & Ethical Policy
          </h1>
          <p className="text-lg text-gray-600">
            Our commitment to quality, education, and academic integrity.
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1 & 2: Nature of Service & Model */}
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Shield className="w-6 h-6" />
                1. Nature of Service & 2. Student-Centric Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                <strong>TYforge is not a project-selling platform.</strong> We operate as a freelancer-based development and mentoring service that assists students in building their academic projects through guidance, collaboration, and technical support.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="font-semibold text-blue-900">All projects supported by TYforge are:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Built with the active involvement of the student</li>
                  <li>Explained line-by-line to ensure full understanding</li>
                  <li>Designed to help students learn implementation, logic, and architecture</li>
                </ul>
              </div>
              <p className="text-sm italic">The student remains the primary owner, contributor, and presenter of the project.</p>
            </CardContent>
          </Card>

          {/* Section 3: Mentorship */}
          <Card className="border-l-4 border-l-green-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <BookOpen className="w-6 h-6" />
                3. Learning & Mentorship Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>Our core intent is education and skill development, not shortcut solutions. We provide:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Technical mentoring", "Concept explanation", 
                  "Code walkthroughs", "Architecture understanding", 
                  "Debugging guidance", "Interview and viva preparation support"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p>This ensures the student can confidently explain, modify, and defend their project.</p>
            </CardContent>
          </Card>

          {/* Section 4 & 5: Responsibility & Ethics */}
          <Card className="border-l-4 border-l-red-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Scale className="w-6 h-6" />
                4. Academic Responsibility & 5. Ethical Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-900">
                <p className="font-bold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Final Responsibility Notice
                </p>
                <p>Final responsibility for project submission, institutional compliance, plagiarism checks, and university rules rests entirely with the student.</p>
              </div>
              <p><strong>TYforge strictly discourages:</strong></p>
              <ul className="list-disc ml-6 space-y-1 text-red-800">
                <li>Copy–paste submissions without understanding</li>
                <li>Misrepresentation of authorship</li>
                <li>Use of our services to bypass academic evaluation</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 6: Career */}
          <Card className="border-l-4 border-l-purple-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Award className="w-6 h-6" />
                6. Career-Oriented Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>Beyond project development, TYforge provides career-related guidance, including:</p>
              <ul className="space-y-2">
                {[
                  "Real-world development practices",
                  "Industry-relevant tech stacks",
                  "Resume and project explanation readiness",
                  "Interview-oriented project understanding"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="font-medium text-purple-900 mt-4 text-center border-t pt-4">
                "Our mission is to empower final-year students with knowledge, confidence, and career clarity."
              </p>
            </CardContent>
          </Card>

          {/* Section 7, 8, 9: Legal & Acceptance */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="text-lg">7. No Affiliation Disclaimer</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                TYforge is not affiliated with any university, college, or examination authority. All brand names and references belong to their respective owners.
              </CardContent>
            </Card>
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="text-lg">8. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                By using TYforge services, you acknowledge that this is a guidance and mentoring platform and you retain full academic responsibility.
              </CardContent>
            </Card>
          </div>

          {/* Final Statement */}
          <div className="text-center pt-8 border-t border-indigo-200">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">9. Core Intent</h2>
            <p className="text-xl text-indigo-800 italic max-w-2xl mx-auto">
              "Our intention is not to sell projects, but to help last-year students understand, build, and present their projects confidently while gaining real skills and career direction."
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Guidelines;
