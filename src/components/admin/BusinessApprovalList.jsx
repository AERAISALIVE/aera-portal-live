
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, CheckCircle, XCircle, AlertOctagon } from "lucide-react";

function BusinessApprovalList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();

    const subscription = supabase
      .channel('business_applications_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'business_applications'
      }, () => {
        fetchApplications();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('business_applications')
        .select(`
          *,
          stewards (
            sacred_name,
            pulse_snapshots (
              resonance_score
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch business applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateApplication = (application) => {
    const violations = [];

    // Check for banned sectors
    const bannedSectors = [
      'pharmaceutical',
      'weapons',
      'fast food',
      'porn',
      'synthetic chemicals',
      'animal exploitation',
      'gambling',
      'tobacco',
      'fossil fuels'
    ];
    
    if (bannedSectors.some(sector => 
      application.sector?.toLowerCase().includes(sector.toLowerCase())
    )) {
      violations.push("Business sector violates sacred principles");
    }

    // Check for harmful language patterns
    const harmfulPatterns = [
      {
        terms: ['disruptive', 'dominate', 'scale aggressively', 'high-pressure'],
        reason: "Contains aggressive market language"
      },
      {
        terms: ['exploit', 'manipulate', 'force', 'control'],
        reason: "Contains manipulative language"
      },
      {
        terms: ['profit maximization', 'market domination', 'aggressive growth'],
        reason: "Prioritizes profit over harmony"
      }
    ];
    
    const combinedText = `${application.description} ${application.pulse_intent}`.toLowerCase();
    
    harmfulPatterns.forEach(pattern => {
      if (pattern.terms.some(term => combinedText.includes(term.toLowerCase()))) {
        violations.push(pattern.reason);
      }
    });

    // Check steward's pulse score
    const pulseScores = application.stewards?.pulse_snapshots || [];
    const averagePulse = pulseScores.length 
      ? pulseScores.reduce((acc, curr) => acc + curr.resonance_score, 0) / pulseScores.length
      : 0;

    if (averagePulse < 40) {
      violations.push("Steward's PULSE score is below required threshold (40)");
    }

    // Check pulse intent alignment
    const requiredTerms = [
      'harmony',
      'restoration',
      'healing',
      'sovereign',
      'divine',
      'sacred',
      'regenerative',
      'sustainable'
    ];
    
    const hasPositiveIntent = requiredTerms.some(term => 
      application.pulse_intent?.toLowerCase().includes(term.toLowerCase())
    );

    if (!hasPositiveIntent) {
      violations.push("PULSE intent lacks clear positive contribution to life");
    }

    // Check for frequency-draining patterns
    const drainingPatterns = [
      'competitive advantage',
      'market share',
      'beat competition',
      'aggressive marketing',
      'viral growth'
    ];

    if (drainingPatterns.some(pattern => combinedText.includes(pattern.toLowerCase()))) {
      violations.push("Contains frequency-draining business patterns");
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  };

  const handleApproval = async (application, isApproved, validationResult) => {
    try {
      // Update business application status
      const { error: applicationError } = await supabase
        .from('business_applications')
        .update({
          is_approved: isApproved,
          review_notes: isApproved 
            ? "Application approved - Aligned with sacred principles"
            : `Application rejected - ${validationResult.violations.join("; ")}`
        })
        .eq('id', application.id);

      if (applicationError) throw applicationError;

      if (isApproved) {
        // Create pulse entity for approved business
        const { data: entityData, error: entityError } = await supabase
          .from('pulse_entities')
          .insert([{
            name: application.business_name,
            entity_type: 'business',
            description: application.description,
            pulse_score: 50
          }])
          .select()
          .single();

        if (entityError) throw entityError;

        // Create entity market entry
        const { error: marketError } = await supabase
          .from('entity_markets')
          .insert([{
            entity_id: entityData.id,
            is_public: true,
            market_status: 'rising'
          }]);

        if (marketError) throw marketError;
      }

      toast({
        title: isApproved ? "Business Approved" : "Business Rejected",
        description: isApproved 
          ? "Business has been added to the PULSE Market"
          : `Application rejected due to ${validationResult.violations.length} violations`,
        variant: isApproved ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="divine-card">
      <CardHeader>
        <CardTitle>Sacred Business Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          <div className="space-y-4">
            {applications.map((application) => {
              const validationResult = validateApplication(application);
              
              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card 
                    className={`divine-card overflow-hidden ${
                      application.is_approved === true 
                        ? 'border-green-500/50' 
                        : application.is_approved === false 
                          ? 'border-red-500/50' 
                          : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r"
                        animate={{
                          opacity: application.is_approved === true ? [0.1, 0.2, 0.1] : 0,
                          background: [
                            "linear-gradient(45deg, rgba(255,215,0,0.1), transparent)",
                            "linear-gradient(45deg, rgba(255,215,0,0.2), transparent)",
                            "linear-gradient(45deg, rgba(255,215,0,0.1), transparent)"
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      
                      <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold">{application.business_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              By {application.stewards?.sacred_name || "Unknown Steward"}
                            </p>
                          </div>
                          {application.is_approved === null && (
                            <div className="space-x-2">
                              <Button
                                onClick={() => handleApproval(application, true, validationResult)}
                                className="bg-green-500 hover:bg-green-600"
                                disabled={!validationResult.isValid}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleApproval(application, false, validationResult)}
                                variant="destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Sector</p>
                              <p className="text-muted-foreground">{application.sector}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Submission Date</p>
                              <p className="text-muted-foreground">
                                {new Date(application.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">Description</p>
                            <p className="text-muted-foreground">{application.description}</p>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">PULSE Intent</p>
                            <p className="text-muted-foreground">{application.pulse_intent}</p>
                          </div>
                          
                          {!validationResult.isValid && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20"
                            >
                              <div className="flex items-start">
                                <AlertOctagon className="w-5 h-5 text-red-400 mt-1 mr-3 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-red-400 mb-2">
                                    Validation Violations ({validationResult.violations.length})
                                  </p>
                                  <ul className="list-disc list-inside space-y-1">
                                    {validationResult.violations.map((violation, index) => (
                                      <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="text-sm text-red-300"
                                      >
                                        {violation}
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          
                          {application.review_notes && (
                            <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                              <p className="text-sm font-medium mb-1">Review Notes</p>
                              <p className="text-sm text-muted-foreground">
                                {application.review_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default BusinessApprovalList;
