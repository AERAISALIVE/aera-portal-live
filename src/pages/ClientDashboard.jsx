
import React, { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Users, Star } from "lucide-react";
import PulseStatus from "@/components/PulseStatus";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stewardData, setStewardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStewardData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("stewards")
          .select(`
            *,
            roles:role_id(*),
            archetypes:archetype_id(*),
            document_statuses:document_status_id(*),
            pulse_snapshots(resonance_score)
          `)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (!data) {
          navigate("/onboarding");
          return;
        }

        setStewardData(data);
      } catch (error) {
        console.error("Error fetching steward data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStewardData();

    // Subscribe to realtime changes
    const stewardSubscription = supabase
      .channel('stewards_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stewards',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        setStewardData(prev => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => {
      stewardSubscription.unsubscribe();
    };
  }, [user, navigate]);

  const getStatusProgress = (status) => {
    const statusMap = {
      pending: 33,
      initiated: 66,
      completed: 100
    };
    return statusMap[status] || 0;
  };

  const getTrustProgress = (status) => {
    const trustMap = {
      initiate: 33,
      apprentice: 66,
      master: 100
    };
    return trustMap[status] || 0;
  };

  const stats = [
    {
      title: "Sacred Name",
      value: stewardData?.name || "Unnamed",
      icon: Star,
      description: "Your divine identity in AERA",
    },
    {
      title: "Re-Birth Status",
      value: stewardData?.rebirth_status || "Pending",
      progress: getStatusProgress(stewardData?.rebirth_status),
      icon: Shield,
      description: "Your spiritual awakening progress",
    },
    {
      title: "Sacred Role",
      value: stewardData?.roles?.name || "Undefined",
      icon: Users,
      description: stewardData?.roles?.description || "Your divine purpose",
    },
    {
      title: "Divine Archetype",
      value: stewardData?.archetypes?.name || "Undefined",
      icon: FileText,
      description: stewardData?.archetypes?.description || "Your sacred essence",
    },
  ];

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
          Loading Sacred Data...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              Welcome, {stewardData?.name || "Sacred Steward"}
            </h2>
            <div className="flex space-x-4">
              <Button onClick={() => navigate("/living-record")} className="bg-primary">
                View Living Record
              </Button>
              <Button onClick={() => navigate("/tradesea")} className="bg-primary/20 hover:bg-primary/30">
                TRADESEA
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="divine-card overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize mb-2">{stat.value}</div>
                    {stat.progress !== undefined && (
                      <Progress value={stat.progress} className="h-2 mb-2" />
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="divine-card">
                <CardHeader>
                  <CardTitle>Trust Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-2xl font-bold capitalize">
                      {stewardData?.trust_status || "Initiate"}
                    </div>
                    <Progress 
                      value={getTrustProgress(stewardData?.trust_status)} 
                      className="h-2" 
                    />
                    <p className="text-sm text-muted-foreground">
                      Your journey of divine trust and sovereignty
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <PulseStatus />
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default ClientDashboard;
