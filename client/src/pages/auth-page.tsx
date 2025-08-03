import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Redirect } from "wouter";
import { Ship, Shield } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/admin/vessels" />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    if (isLogin) {
      loginMutation.mutate({ username, password });
    } else {
      registerMutation.mutate({ username, password });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;
  const error = loginMutation.error || registerMutation.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start mb-6">
            <Ship className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">MSG Back Office</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Secure Admin Access
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Access the cargo management system to handle vessel information, 
            tracking data uploads, and monitor shipments across our network.
          </p>
          <div className="flex items-center justify-center md:justify-start text-sm text-gray-500">
            <Shield className="h-4 w-4 mr-2" />
            Protected with enterprise-grade security
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? "Admin Login" : "Create Admin Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error.message || "Authentication failed. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : (isLogin ? "Login" : "Create Account")}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setUsername("");
                    setPassword("");
                  }}
                >
                  {isLogin ? "Need an account? Register" : "Already have an account? Login"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}