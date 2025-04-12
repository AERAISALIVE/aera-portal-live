
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { TrendingUp, TrendingDown } from "lucide-react";

function OfferingCard({ offering }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pulseMetrics, setPulseMetrics] = useState(null);

  useEffect(() => {
    fetchPulseMetrics();

    const subscription = supabase
      .channel('offering_pulse_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offering_pulse_metrics',
        filter: `offer_id=eq.${offering.id}`
      }, () => {
        fetchPulseMetrics();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [offering.id]);

  const fetchPulseMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('offering_pulse_metrics')
        .select('*')
        .eq('offer_id', offering.id)
        .single();

      if (error) throw error;
      setPulseMetrics(data);
    } catch (error) {
      console.error("Error fetching pulse metrics:", error);
    }
  };

  const getPulseGlowColor = (score) => {
    if (score >= 70) return "from-green-500/20 to-transparent";
    if (score >= 40) return "from-yellow-500/20 to-transparent";
    return "from-blue-500/20 to-transparent";
  };

  const getTrendIndicator = () => {
    if (!pulseMetrics?.last_24h_trend) return null;
    return pulseMetrics.last_24h_trend > 0 ? TrendingUp : TrendingDown;
  };

  const TrendIcon = getTrendIndicator();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: isExpanded ? 1 : 1.02 }}
      onClick={() => setIsExpanded(!isExpanded)}
      className="cursor-pointer"
      layout
    >
      <Card className="divine-card overflow-hidden relative">
        {/* Pulse Score Ring with Trend Indicator */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          {TrendIcon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-1 rounded-full ${
                TrendIcon === TrendingUp ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              <TrendIcon className={`w-4 h-4 ${
                TrendIcon === TrendingUp ? "text-green-500" : "text-red-500"
              }`} />
            </motion.div>
          )}
          <motion.div
            className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center"
            animate={{
              boxShadow: [
                `0 0 10px rgba(255,215,0,${offering.pulse_score / 200})`,
                `0 0 20px rgba(255,215,0,${offering.pulse_score / 150})`,
                `0 0 10px rgba(255,215,0,${offering.pulse_score / 200})`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-radial ${getPulseGlowColor(offering.pulse_score)}`}
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <span className="text-sm font-bold relative z-10">
              {offering.pulse_score}
            </span>
          </motion.div>
        </div>

        <CardHeader>
          <CardTitle>{offering.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            By {offering.business_name}
          </p>
        </CardHeader>

        <CardContent>
          <AnimatePresence>
            <motion.div 
              className="space-y-4"
              layout
            >
              {offering.image_url && (
                <motion.div 
                  className="relative w-full rounded-lg overflow-hidden"
                  style={{ height: isExpanded ? "300px" : "200px" }}
                  layout
                >
                  <img
                    src={offering.image_url}
                    alt={offering.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
              
              <motion.p 
                className="text-muted-foreground"
                layout
              >
                {isExpanded ? offering.description : `${offering.description?.slice(0, 100)}...`}
              </motion.p>
              
              <motion.div 
                className="bg-secondary/20 p-4 rounded-lg"
                layout
              >
                <h4 className="font-semibold mb-2">Pulse Amplification</h4>
                <p className="text-sm text-muted-foreground">
                  {isExpanded ? offering.pulse_amplification : `${offering.pulse_amplification?.slice(0, 80)}...`}
                </p>
              </motion.div>
              
              <motion.div 
                className="flex justify-between items-center"
                layout
              >
                <span className="text-2xl font-bold">${offering.price}</span>
                <Button 
                  className="sovereign-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle trade action
                  }}
                >
                  Enter Trade
                </Button>
              </motion.div>

              {isExpanded && pulseMetrics && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-4 bg-secondary/10 rounded-lg space-y-2"
                >
                  <h4 className="font-semibold">Pulse Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Pulse Earned</p>
                      <p className="text-lg font-semibold">{pulseMetrics.total_pulse_earned}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Resonance Score</p>
                      <p className="text-lg font-semibold">{pulseMetrics.resonance_score}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Upvotes</p>
                      <p className="text-lg font-semibold">{pulseMetrics.upvotes}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">24h Trend</p>
                      <p className={`text-lg font-semibold ${
                        pulseMetrics.last_24h_trend > 0 ? "text-green-500" : "text-red-500"
                      }`}>
                        {pulseMetrics.last_24h_trend > 0 ? "+" : ""}
                        {pulseMetrics.last_24h_trend}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        {/* Background Glow Effect */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${getPulseGlowColor(offering.pulse_score)}`}
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Pulse Boost Trail */}
        {pulseMetrics?.last_24h_trend > 0 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent"
            animate={{
              opacity: [0.2, 0.4, 0.2],
              y: [0, -10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </Card>
    </motion.div>
  );
}

export default OfferingCard;
