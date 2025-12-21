import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/api";
import { handleApiError, handleApiSuccess } from "@/utils/errorHandler";

const API_BASE = `${API_BASE_URL}/api`;

const LoginLocal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Show email login on localhost and production
  const isLocalhost = true; // Enable email login for all environments

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem("tyforge_token", data.access_token);
      navigate("/dashboard");
    } catch (error: any) {
      handleApiError(error, "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setEmail("test@tyforge.local");
    setPassword("test123456");
    setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "test@tyforge.local", password: "test123456" }),
        });
        if (!res.ok) throw new Error("Invalid credentials");
        const data = await res.json();
        localStorage.setItem("tyforge_token", data.access_token);
        
        // Check if user needs to complete onboarding
        const statusRes = await fetch(`${API_BASE}/user/signup-status`, {
          headers: { "Authorization": `Bearer ${data.access_token}` },
        });
        
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (!statusData.onboarding_completed) {
            // Redirect based on current signup step
            switch (statusData.signup_step) {
              case 'plan_selection':
                navigate("/select-plan");
                break;
              case 'project_setup':
                navigate("/project-setup");
                break;
              default:
                navigate("/dashboard");
            }
          } else {
            navigate("/dashboard");
          }
        } else {
          navigate("/dashboard");
        }
      } catch (error: any) {
        handleApiError(error, "Login failed");
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">TY</span>
              </div>
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <FcGoogle className="w-5 h-5" />
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </Button>

              {/* Localhost-only Email/Password Login */}
              {isLocalhost && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or test with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleEmailLogin} className="space-y-3">
                    <input
                      type="email"
                      placeholder="test@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                    <input
                      type="password"
                      placeholder="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login with Email'}
                    </Button>
                  </form>

                  {/* Auto Test Login Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={handleTestLogin}
                    disabled={isLoading}
                  >
                    🚀 Test Login (Auto-fill & Go)
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginLocal;