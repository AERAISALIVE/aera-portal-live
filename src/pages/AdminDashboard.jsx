
import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, Activity, Clock, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";
import BusinessApprovalList from "@/components/admin/BusinessApprovalList";
import MetricsOverview from "@/components/admin/MetricsOverview";
import TrustStatusRing from "@/components/admin/TrustStatusRing";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStewards: 0,
    totalDocuments: 0,
    totalPulseSnapshots: 0,
    recentSteward: null,
    trustStatus: {
      initiate: 0,
      apprentice: 0,
      master: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();

    const subscription = supabase
      .channel('admin_dashboard_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stewards'
      }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total stewards
      const { count: stewardsCount, error: stewardsError } = await supabase
        .from('stewards')
        .select('*', { count: 'exact' });

      if (stewardsError) throw stewardsError;

      // Fetch total documents
      const { count: documentsCount, error: documentsError } = await supabase
        .from('document_registry')
        .select('*', { count: 'exact' });

      if (documentsError) throw documentsError;

      // Fetch total pulse snapshots
      const { count: pulseCount, error: pulseError } = await supabase
        .from('pulse_entity_snapshots')
        .select('*', { count: 'exact' });

      if (pulseError) throw pulseError;

      // Fetch most recent steward
      const { data: recentSteward, error: recentError } = await supabase
        .from('stewards')
        .select('sacred_name, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentError) throw recentError;

      // Fetch trust status distribution
      const { data: trustData, error: trustError } = await supabase
        .from('stewards')
        .select('trust_status');

      if (trustError) throw trustError;

      const trustDistribution = {
        initiate: 0,
        apprentice: 0,
        master: 0
      };

      trustData.forEach(steward => {
        if (trustDistribution[steward.trust_status]) {
          trustDistribution[steward.trust_status]++;
        }
      });

      setStats({
        totalStewards: stewardsCount,
        totalDocuments: documentsCount,
        totalPulseSnapshots: pulseCount,
        recentSteward,
        trustStatus: trustDistribution
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
          className="space-y-8"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Divine Administration</h2>
          </div>

          <MetricsOverview stats={stats} />

          <div className="grid gap-6 md:grid-cols-2">
            <TrustStatusRing stats={stats} />
            <BusinessApprovalList />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default AdminDashboard;
