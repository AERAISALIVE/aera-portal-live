
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

function CreatorPulsePanel({ entityId }) {
  const [metrics, setMetrics] = useState({
    totalPulseEarned: 0,
    averageOfferingPulse: 0,
    topOffering: null,
    visibilityScore: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();

    const subscription = supabase
      .channel('creator_pulse_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offering_pulse_metrics'
      }, () => {
        fetchMetrics();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [entityId]);

  const fetchMetrics = async () => {
    try {
      // Fetch all offerings and their metrics
      const { data: offerings, error: offeringsError } = await supabase
        .from('trade_offers')
        .select(`
          *,
          offering_pulse_metrics (
            total_pulse_earned,
            resonance_score,
            upvotes
          )
        `)
        .eq('entity_id', entityId);

      if (offeringsError) throw offeringsError;

      // Calculate metrics
      let totalPulse = 0;
      let totalScore = 0;
      let highestPulse = 0;
      let topOffering = null;
      let totalVisibility = 0;

      offerings.forEach(offering => {
        const metrics = offering.offering_pulse_metrics?.[0] || {};
        const pulseEarned = metrics.total_pulse_earned || 0;
        const resonance = metrics.resonance_score || 0;
        const upvotes = metrics.upvotes || 0;

        totalPulse += pulseEarned;
        totalScore += resonance;
        totalVisibility += (resonance + upvotes) / 2;

        if (pulseEarned > highestPulse) {
          highestPulse = pulseEarned;
          topOffering = offering;
        }
      });

      setMetrics({
        totalPulseEarned: totalPulse,
        averageOfferingPulse: offerings.length ? totalScore / offerings.length : 0,
        topOffering,
        visibilityScore: offerings.length ? totalVisibility / offerings.length : 0
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch creator metrics",
        variant: "destructive"
      });
    }
  };

  const getPulseGlowColor = (score) => {
    if (score >= 70) return "from-yellow-500/20 via-yellow-500/10 to-transparent";
    if (score >= 40) return "from-blue-500/20 via-blue-500/10 to-transparent";
    return "from-primary/20 via-primary/10 to-transparent";
  };

  return (
    <Card className="divine-card overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl">Creator Pulse Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Pulse Earned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-4 rounded-lg bg-secondary/20"
        >
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${getPulseGlowColor(metrics.totalPulseEarned)}`}
            animate={{
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-2">Total Pulse Earned</h3>
            <p className="text-3xl font-bold">{metrics.totalPulseEarned.toFixed(1)}</p>
          </div>
        </motion.div>

        {/* Average Offering Pulse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative p-4 rounded-lg bg-secondary/20"
        >
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${getPulseGlowColor(metrics.averageOfferingPulse)}`}
            animate={{
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-2">Average Offering Pulse</h3>
            <p className="text-3xl font-bold">{metrics.averageOfferingPulse.toFixed(1)}%</p>
          </div>
        </motion.div>

        {/* Top Rated Offering */}
        {metrics.topOffering && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative p-4 rounded-lg bg-secondary/20"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
              animate={{
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-2">Highest Rated Offering</h3>
              <p className="text-xl font-bold mb-1">{metrics.topOffering.title}</p>
              <p className="text-sm text-muted-foreground">
                Pulse Score: {metrics.topOffering.offering_pulse_metrics?.[0]?.resonance_score || 0}%
              </p>
            </div>
          </motion.div>
        )}

        {/* Visibility Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative p-4 rounded-lg bg-secondary/20"
        >
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${getPulseGlowColor(metrics.visibilityScore)}`}
            animate={{
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-2">Visibility Score</h3>
            <p className="text-3xl font-bold">{metrics.visibilityScore.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              Based on resonance and engagement
            </p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

export default CreatorPulsePanel;
