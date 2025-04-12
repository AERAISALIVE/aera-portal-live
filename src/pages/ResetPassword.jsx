import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const toast = useToast();


  useEffect(() => {
    const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [success, setSuccess] = useState('');

    console.log("⚡ Password Reset Page Loaded");
  
    const checkRecovery = async () => {
      const url = window.location.href;
      console.log("🌐 Current URL:", url);
  
      const { data } = await supabase.auth.getSession();
      console.log("📦 Supabase session data:", data);
  
      if (url.includes("access_token") || url.includes("type=recovery")) {
        console.log("✅ Detected recovery token in URL");
  
        if (data?.session) {
          console.log("🔓 Valid session found.");
          setLoading(false);
        } else {
          console.log("❌ No valid session. Redirecting...");
          navigate("/login");
        }
      } else {
        console.log("⚠️ No recovery token detected.");
      }
  
      setSessionChecked(true);
    };
  
    checkRecovery();
  }, [navigate]);
  

  useEffect(() => {
    const checkRecovery = async () => {
      // ...your session logic here
    };
  
    checkRecovery();
  }, [navigate]); // <--- useEffect ends here ✅
  
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
  
    const { error } = await supabase.auth.updateUser({
      password,
    });
  
    if (error) {
      console.error("❌ Password update error:", error);
      setError(error.message);
    } else {
      console.log("✅ Password updated successfully!");
      setSuccess('✅ Password updated successfully! You may now log in.');
    }
  };
  

  if (!sessionChecked || loading) {
    return (
      <div className="text-center text-white mt-10 text-lg">
        🌀 Validating your recovery link...
      </div>
    );
  }
  console.log("🧬 ResetPassword page rendering...");

  return (
    <div className="reset-password-container">
      <h1>Reset Your Password</h1>
      {!sessionChecked ? (
        <p>🔄 Validating your recovery link...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Update Password</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
        </form>
      )}
    </div>
  );
  
}
