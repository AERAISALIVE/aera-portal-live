
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

function BusinessLaunchWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    business_name: "",
    sector: "",
    description: "",
    pulse_intent: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.business_name || !formData.sector || !formData.description || !formData.pulse_intent) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("business_applications")
        .insert([{
          steward_id: user.id,
          ...formData
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business proposal submitted for divine review",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="divine-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Sacred Business Launch
            </CardTitle>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <Input
                    name="business_name"
                    placeholder="Sacred Business Name"
                    value={formData.business_name}
                    onChange={handleInputChange}
                    className="celestial-input"
                    required
                  />
                  <Input
                    name="sector"
                    placeholder="Business Sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    className="celestial-input"
                    required
                  />
                  <Button 
                    onClick={() => setStep(2)} 
                    className="w-full sovereign-button"
                    disabled={!formData.business_name || !formData.sector}
                  >
                    Continue
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <textarea
                    name="description"
                    placeholder="Describe your sacred business..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-4 h-32 rounded-md border celestial-input"
                    required
                  />
                  <Button 
                    onClick={() => setStep(3)} 
                    className="w-full sovereign-button"
                    disabled={!formData.description}
                  >
                    Continue
                  </Button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <textarea
                    name="pulse_intent"
                    placeholder="How does this business serve life?"
                    value={formData.pulse_intent}
                    onChange={handleInputChange}
                    className="w-full p-4 h-32 rounded-md border celestial-input"
                    required
                  />
                  <Button 
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.pulse_intent}
                    className="w-full sovereign-button"
                  >
                    {isLoading ? "Submitting..." : "Submit for Divine Review"}
                  </Button>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default BusinessLaunchWizard;
