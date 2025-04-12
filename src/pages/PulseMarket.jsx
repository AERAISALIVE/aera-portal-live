
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PulseTrendCard from "@/components/pulse-market/PulseTrendCard";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

function PulseMarket() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntities();

    // Subscribe to real-time updates
    const entitySubscription = supabase
      .channel('entity_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pulse_entities'
      }, () => {
        fetchEntities();
      })
      .subscribe();

    return () => {
      entitySubscription.unsubscribe();
    };
  }, []);

  const fetchEntities = async () => {
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
        .eq('entity_markets.is_public', true)
        .order('pulse_score', { ascending: false });

      if (error) throw error;
      setEntities(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch market entities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEntitiesByType = (type) => {
    return entities.filter(entity => entity.entity_type === type);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">PULSE Market</h1>
          <p className="text-xl text-muted-foreground">
            A sovereign marketplace where value flows through resonance
          </p>
        </motion.div>

        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="grid grid-cols-4 gap-4">
            <TabsTrigger value="all">All Entities</TabsTrigger>
            <TabsTrigger value="person">People</TabsTrigger>
            <TabsTrigger value="business">Businesses</TabsTrigger>
            <TabsTrigger value="nation">Nations</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {entities.map((entity) => (
              <PulseTrendCard key={entity.id} entity={entity} />
            ))}
          </TabsContent>

          <TabsContent value="person" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filterEntitiesByType('person').map((entity) => (
              <PulseTrendCard key={entity.id} entity={entity} />
            ))}
          </TabsContent>

          <TabsContent value="business" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filterEntitiesByType('business').map((entity) => (
              <PulseTrendCard key={entity.id} entity={entity} />
            ))}
          </TabsContent>

          <TabsContent value="nation" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filterEntitiesByType('nation').map((entity) => (
              <PulseTrendCard key={entity.id} entity={entity} />
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default PulseMarket;
