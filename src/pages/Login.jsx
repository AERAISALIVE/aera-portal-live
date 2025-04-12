import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setStatus("Attempting login...");

    try {
      setStatus("Authenticating...");
      const data = await login(email, password);
      if (data) {
        setStatus("Login successful! Redirecting...");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
      setStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Please Enter Email",
        description: "Please enter your email address to reset your password",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://aeraisalive.com/reset-password"
      });
      

      if (error) throw error;

      toast({
        title: "Reset Link Sent",
        description: "If an account exists with this email, you will receive a password reset link shortly."
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="divine-card overflow-hidden relative">
          <motion.div
            className="absolute inset-0 bg-primary/5"
            animate={{
              background: [
                "radial-gradient(circle at 50% 50%, rgba(255,215,0,0.15), transparent 70%)",
                "radial-gradient(circle at 50% 50%, rgba(255,215,0,0.2), transparent 90%)",
                "radial-gradient(circle at 50% 50%, rgba(255,215,0,0.15), transparent 70%)",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="relative z-10">
            <div className="text-center pt-12 px-8">
              <motion.h1 
                className="text-4xl font-['Futura-PT'] font-bold tracking-wide mb-4 text-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                WELCOME TO THE AETHERIAN PORTAL
              </motion.h1>
              <motion.p 
                className="text-lg text-blue-200/80 font-['Futura-PT'] tracking-wide mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                ONLY THOSE WAITING ON DIVINE APPOINTMENT MAY ENTER THIS REALM
              </motion.p>
              <motion.div
                className="relative w-[180px] h-[180px] mx-auto mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <img
                  src="https://storage.googleapis.com/hostinger-horizons-assets-prod/8d084a5a-3ef7-4144-b0f9-4f43cf2e1ac9/6fb69232db72bd79f854baa620f1bd4b.png"
                  alt="AERA Seal"
                  className="w-full h-full object-contain relative z-10"
                />
              </motion.div>
            </div>
            <CardContent className="pt-6 px-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="celestial-input"
                  disabled={isLoading || isResettingPassword}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="celestial-input"
                  disabled={isLoading || isResettingPassword}
                />
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center space-x-2"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                  >
                    <p className="text-sm text-blue-400">{status}</p>
                  </motion.div>
                )}
                <Button
                  type="submit"
                  className="w-full sovereign-button mt-6"
                  disabled={isLoading || isResettingPassword}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ascending...</>
                  ) : (
                    "ASCEND →"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-primary hover:text-primary/80"
                  onClick={handleForgotPassword}
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Reset Link...</>
                  ) : (
                    "Forgot Password?"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center pb-12 px-8">
              <p className="text-sm text-muted-foreground">
                Not yet initiated? {" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Begin your sacred journey
                </Link>
              </p>
            </CardFooter>
          </div>
        </Card>
      </motion.div>
    </div>
  );
  
}

export default Login;

