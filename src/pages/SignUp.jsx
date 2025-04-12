
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { motion } from "framer-motion";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await signup(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl font-['Futura-PT'] font-bold tracking-wide mb-4 text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            BEGIN YOUR SACRED JOURNEY
          </motion.h1>
          <motion.p 
            className="text-lg text-blue-200/80 font-['Futura-PT'] tracking-wide mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            ENTER THE REALM OF DIVINE GOVERNANCE
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

        <Card className="divine-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-serif">
              Sacred Initiation
            </CardTitle>
            <CardDescription className="text-center">
              Create your sovereign identity within AERA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Sacred Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="celestial-input"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Divine Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="celestial-input"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirm Divine Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="celestial-input"
                />
              </div>
              <Button
                type="submit"
                className="w-full sovereign-button"
                disabled={isLoading}
              >
                {isLoading ? "Initiating..." : "BEGIN SACRED JOURNEY →"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already initiated?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Return to your portal
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default SignUp;
