
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

function EntityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEntityDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('pulse_entities')
          .select(`
            *,
            entity_markets (
              is_public,
              market_status
            ),
            pulse_entity_snapshots (
              previous_score,
              new_score,
              created_at
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setEntity(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch entity details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEntityDetails();
  }, [id, toast]);

  const getTrendIcon = () => {
    if (!entity?.pulse_entity_snapshots?.length) return null;
    const latest = entity.pulse_entity_snapshots[0];
    return latest.new_score > latest.previous_score ? TrendingUp : TrendingDown;
  };

  const TrendIcon = getTrendIcon();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-2xl font-bold text-primary"
        >
          Loading Entity Data...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={() => navigate("/pulse-market")}
          variant="ghost"
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Market
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <Card className="divine-card overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-bold">{entity.name}</CardTitle>
                {TrendIcon && (
                  <TrendIcon 
                    className={`w-6 h-6 ${
                      TrendIcon === TrendingUp ? "text-green-500" : "text-red-500"
                    }`}
                  />
                )}
              </div>
              <p className="text-lg text-muted-foreground capitalize">
                {entity.entity_type}
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Description</h3>
                <p className="text-muted-foreground">{entity.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">PULSE Score</h3>
                <div className="relative">
                  <motion.div
                    className="h-4 bg-secondary/50 rounded-full overflow-hidden"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: `${entity.pulse_score}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(255,215,0,0.2)",
                        "0 0 40px rgba(255,215,0,0.4)",
                        "0 0 20px rgba(255,215,0,0.2)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="mt-2 text-2xl font-bold">{entity.pulse_score}%</div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Market Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="divine-card p-4">
                    <p className="text-sm text-muted-foreground">Visibility</p>
                    <p className="text-lg font-semibold">
                      {entity.entity_markets?.is_public ? "Public" : "Private"}
                    </p>
                  </Card>
                  <Card className="divine-card p-4">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-semibold capitalize">
                      {entity.entity_markets?.market_status || "Unknown"}
                    </p>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">PULSE History</h3>
                <div className="space-y-4">
                  {entity.pulse_entity_snapshots?.map((snapshot, index) => (
                    <Card key={index} className="divine-card p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Score Change</p>
                          <p className="text-lg font-semibold">
                            {snapshot.previous_score} → {snapshot.new_score}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(snapshot.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default EntityDetail;
