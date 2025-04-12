
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [roles, setRoles] = useState([]);
  const [archetypes, setArchetypes] = useState([]);
  const [documentStatuses, setDocumentStatuses] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    role_id: "",
    archetype_id: "",
    aetherians_id: "",
    rebirth_status: "pending",
    trust_status: "initiate",
    document_status_id: "",
    pulse_resonance: 0
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('roles')
          .select('*')
          .order('id');
        if (rolesError) throw rolesError;
        setRoles(rolesData);

        // Fetch archetypes
        const { data: archetypesData, error: archetypesError } = await supabase
          .from('archetypes')
          .select('*')
          .order('id');
        if (archetypesError) throw archetypesError;
        setArchetypes(archetypesData);

        // Fetch document statuses
        const { data: statusesData, error: statusesError } = await supabase
          .from('document_statuses')
          .select('*')
          .order('id');
        if (statusesError) throw statusesError;
        setDocumentStatuses(statusesData);

        // Set default document status
        setFormData(prev => ({
          ...prev,
          document_status_id: statusesData[0]?.id || ""
        }));

      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load reference data",
          variant: "destructive"
        });
      }
    };

    fetchReferenceData();
  }, [toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Create steward record
      const { error: stewardError } = await supabase
        .from("stewards")
        .insert([{ 
          ...formData, 
          user_id: user.id,
          created_at: new Date().toISOString()
        }]);

      if (stewardError) throw stewardError;

      // Create initial pulse snapshot
      const { error: pulseError } = await supabase
        .from("pulse_snapshots")
        .insert([{
          steward_id: user.id,
          resonance_score: 0,
          timestamp: new Date().toISOString()
        }]);

      if (pulseError) throw pulseError;

      toast({
        title: "Success",
        description: "Sacred initiation completed successfully",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const progress = (step / 4) * 100;

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
              Sacred Steward Initiation
            </CardTitle>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          <CardContent>
            <Tabs value={String(step)} onValueChange={(v) => setStep(Number(v))}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="1">Identity</TabsTrigger>
                <TabsTrigger value="2">Role</TabsTrigger>
                <TabsTrigger value="3">Status</TabsTrigger>
                <TabsTrigger value="4">Confirmation</TabsTrigger>
              </TabsList>

              <TabsContent value="1" className="space-y-4">
                <div className="space-y-4">
                  <Input
                    name="name"
                    placeholder="Sacred Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="celestial-input"
                  />
                  <Input
                    name="aetherians_id"
                    placeholder="Aetherian ID"
                    value={formData.aetherians_id}
                    onChange={handleInputChange}
                    className="celestial-input"
                  />
                  <Button 
                    onClick={() => setStep(2)} 
                    className="w-full sovereign-button"
                  >
                    Continue
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="2" className="space-y-4">
                <div className="space-y-4">
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border celestial-input"
                  >
                    <option value="">Select Sacred Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="archetype_id"
                    value={formData.archetype_id}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border celestial-input"
                  >
                    <option value="">Select Divine Archetype</option>
                    {archetypes.map(archetype => (
                      <option key={archetype.id} value={archetype.id}>
                        {archetype.name}
                      </option>
                    ))}
                  </select>
                  <Button 
                    onClick={() => setStep(3)} 
                    className="w-full sovereign-button"
                  >
                    Continue
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="3" className="space-y-4">
                <div className="space-y-4">
                  <select
                    name="rebirth_status"
                    value={formData.rebirth_status}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border celestial-input"
                  >
                    <option value="pending">Awaiting Re-Birth</option>
                    <option value="initiated">Re-Birth Initiated</option>
                    <option value="completed">Re-Birth Completed</option>
                  </select>
                  <select
                    name="trust_status"
                    value={formData.trust_status}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border celestial-input"
                  >
                    <option value="initiate">Trust Initiate</option>
                    <option value="apprentice">Trust Apprentice</option>
                    <option value="master">Trust Master</option>
                  </select>
                  <select
                    name="document_status_id"
                    value={formData.document_status_id}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border celestial-input"
                  >
                    <option value="">Select Document Status</option>
                    {documentStatuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                  <Button 
                    onClick={() => setStep(4)} 
                    className="w-full sovereign-button"
                  >
                    Continue
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="4" className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-muted p-6 rounded-md divine-card">
                    <h3 className="font-medium text-lg mb-4">Sacred Identity</h3>
                    <p className="mb-2">Name: {formData.name}</p>
                    <p className="mb-4">Aetherian ID: {formData.aetherians_id}</p>
                    
                    <h3 className="font-medium text-lg mb-4">Divine Purpose</h3>
                    <p className="mb-2">Role: {roles.find(r => r.id === Number(formData.role_id))?.name || 'Not selected'}</p>
                    <p className="mb-4">Archetype: {archetypes.find(a => a.id === Number(formData.archetype_id))?.name || 'Not selected'}</p>
                    
                    <h3 className="font-medium text-lg mb-4">Current Status</h3>
                    <p className="mb-2">Re-Birth: {formData.rebirth_status}</p>
                    <p className="mb-2">Trust Level: {formData.trust_status}</p>
                    <p>Document Status: {documentStatuses.find(s => s.id === Number(formData.document_status_id))?.name || 'Not selected'}</p>
                  </div>
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full sovereign-button"
                  >
                    Complete Sacred Initiation
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default OnboardingWizard;
