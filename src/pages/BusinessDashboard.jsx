
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import CreatorPulsePanel from "@/components/business/CreatorPulsePanel";
import BusinessOfferingForm from "@/components/business/BusinessOfferingForm";
import OfferingCard from "@/components/business/OfferingCard";

function BusinessDashboard() {
  const [businessEntity, setBusinessEntity] = useState(null);
  const [offerings, setOfferings] = useState([]);
  const [showOfferingForm, setShowOfferingForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinessData();

    const subscription = supabase
      .channel('business_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pulse_entities'
      }, () => {
        fetchBusinessData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchBusinessData = async () => {
    try {
      // First, get the approved business application
      const { data: application, error: applicationError } = await supabase
        .from('business_applications')
        .select('*')
        .eq('steward_id', user.id)
        .eq('is_approved', true)
        .single();

      if (applicationError) throw applicationError;

      // Then get the pulse entity for this business
      const { data: entity, error: entityError } = await supabase
        .from('pulse_entities')
        .select(`
          *,
          entity_markets!inner (
            is_public,
            market_status
          ),
          trade_offers (
            *,
            offering_pulse_metrics (*)
          )
        `)
        .eq('name', application.business_name)
        .single();

      if (entityError) throw entityError;

      setBusinessEntity(entity);
      setOfferings(entity.trade_offers || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch business data",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Business Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">{businessEntity?.name}</h1>
              <p className="text-xl text-muted-foreground">
                Sacred Business Dashboard
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => navigate(`/pulse-market/${businessEntity?.id}`)}
                variant="outline"
              >
                View Public Profile
              </Button>
              <Button
                onClick={() => setShowOfferingForm(true)}
                className="sovereign-button"
              >
                Add New Offering
              </Button>
            </div>
          </div>

          {/* Business Avatar with Pulse Ring */}
          <motion.div 
            className="relative w-32 h-32 mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="relative z-10 w-full h-full rounded-full bg-secondary flex items-center justify-center">
              <span className="text-3xl font-bold">
                {businessEntity?.name?.charAt(0) || "B"}
              </span>
            </div>
          </motion.div>

          {/* Creator Pulse Panel */}
          {businessEntity && (
            <CreatorPulsePanel entityId={businessEntity.id} />
          )}

          {/* Offering Management */}
          <Card className="divine-card">
            <CardHeader>
              <CardTitle>Sacred Offerings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {offerings.map((offering) => (
                  <OfferingCard key={offering.id} offering={offering} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New Offering Form Modal */}
          {showOfferingForm && businessEntity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-2xl"
              >
                <BusinessOfferingForm
                  entityId={businessEntity.id}
                  onSuccess={() => {
                    setShowOfferingForm(false);
                    fetchBusinessData();
                  }}
                />
                <Button
                  onClick={() => setShowOfferingForm(false)}
                  variant="ghost"
                  className="mt-4 w-full"
                >
                  Cancel
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default BusinessDashboard;
