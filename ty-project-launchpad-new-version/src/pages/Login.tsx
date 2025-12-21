import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Show email login only on localhost
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate("/dashboard");
    } catch (error: any) {
      alert("Login failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback"
        }
      });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
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
                onClick={handleGoogleLogin}
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

                    {/* Auto Test Login Button */}
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={async () => {
                        setEmail("test@tyforge.local");
                        setPassword("test123456");
                        // Auto-login after fill
                        setTimeout(async () => {
                          try {
                            setIsLoading(true);
                            const { data, error } = await supabase.auth.signInWithPassword({
                              email: "test@tyforge.local",
                              password: "test123456",
                            });
                            if (error) {
                              // If login fails, try to create the user
                              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                                email: "test@tyforge.local",
                                password: "test123456",
                              });
                              if (signUpError) throw signUpError;
                              alert("Test user created! Please click login again.");
                            } else {
                              navigate("/dashboard");
                            }
                          } catch (error: any) {
                            alert("Login/Signup failed: " + error.message);
                          } finally {
                            setIsLoading(false);
                          }
                        }, 100);
                      }}
                      disabled={isLoading}
                    >
                      🚀 Test Login (Auto-fill & Go)
                    </Button>
                  </form>
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

export default Login;
