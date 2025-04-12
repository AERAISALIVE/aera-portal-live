
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

function PulseStatus() {
  const { user } = useAuth();
  const [resonanceScore, setResonanceScore] = useState(0);

  useEffect(() => {
    const fetchPulseData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("pulse_snapshots")
          .select("resonance_score")
          .eq("steward_id", user.id)
          .order("timestamp", { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        if (data) {
          setResonanceScore(data.resonance_score);
        }
      } catch (error) {
        console.error("Error fetching pulse data:", error);
      }
    };

    fetchPulseData();

    // Subscribe to real-time changes
    const pulseSubscription = supabase
      .channel('pulse_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pulse_snapshots',
        filter: `steward_id=eq.${user?.id}`
      }, (payload) => {
        if (payload.new) {
          setResonanceScore(payload.new.resonance_score);
        }
      })
      .subscribe();

    return () => {
      pulseSubscription.unsubscribe();
    };
  }, [user]);

  const pulseColor = resonanceScore >= 70 ? "#4CAF50" : resonanceScore >= 40 ? "#FFC107" : "#F44336";

  return (
    <Card className="divine-card">
      <CardHeader>
        <CardTitle className="text-center">PULSE Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-32 h-32 flex items-center justify-center"
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: pulseColor, opacity: 0.2 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="relative z-10 text-2xl font-bold">
            {resonanceScore}%
          </div>
        </motion.div>
        
        <p className="text-sm text-center text-muted-foreground">
          Your Soul Field is calibrating. PULSE resonance tracking coming soon.
        </p>
      </CardContent>
    </Card>
  );
}

export default PulseStatus;
