
import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { TrendingUp, TrendingDown, Filter, Grid, List } from "lucide-react";
import FrequencyMeter from "@/components/tradesea/FrequencyMeter";
import OfferingCard from "@/components/business/OfferingCard";
import { useAuth } from "@/contexts/AuthContext";

function Tradesea() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    minPulse: 0,
    sector: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "recent"
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const [showOfferingForm, setShowOfferingForm] = useState(false);

  useEffect(() => {
    fetchEntities();

    const subscription = supabase
      .channel('market_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pulse_entities'
      }, () => {
        fetchEntities();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filters]);

  const fetchEntities = async () => {
    try {
      let query = supabase
        .from('pulse_entities')
        .select(`
          *,
          entity_markets!inner (
            is_public,
            market_status
          ),
          trade_offers (
            id,
            title,
            description,
            pulse_amplification,
            price,
            image_url,
            is_active
          )
        `)
        .eq('entity_markets.is_public', true)
        .eq('entity_type', 'business')
        .gte('pulse_score', filters.minPulse);

      if (filters.sector) {
        query = query.ilike('description', `%${filters.sector}%`);
      }

      if (filters.minPrice) {
        query = query.gte('trade_offers.price', parseFloat(filters.minPrice));
      }

      if (filters.maxPrice) {
        query = query.lte('trade_offers.price', parseFloat(filters.maxPrice));
      }

      switch (filters.sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'pulse':
          query = query.order('pulse_score', { ascending: false });
          break;
        case 'price_low':
          query = query.order('trade_offers.price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('trade_offers.price', { ascending: false });
          break;
      }

      const { data, error } = await query;

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

  const checkBusinessEligibility = async () => {
    try {
      const { data, error } = await supabase
        .from('business_applications')
        .select('is_approved')
        .eq('steward_id', user.id)
        .single();

      if (error) throw error;

      return data?.is_approved === true;
    } catch (error) {
      return false;
    }
  };

  const handleJoinTradesea = async () => {
    const isEligible = await checkBusinessEligibility();
    
    if (isEligible) {
      setShowOfferingForm(true);
    } else {
      toast({
        title: "Not Eligible",
        description: "Please submit a business application first",
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
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold">TRADESEA</h1>
              <p className="text-xl text-muted-foreground">
                Divine Commerce Through Resonance
              </p>
            </div>
            <Button 
              onClick={handleJoinTradesea}
              className="sovereign-button"
            >
              Join TRADESEA
            </Button>
          </div>
          <FrequencyMeter />
        </motion.div>

        <Card className="divine-card mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Filter Offerings</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-primary/20" : ""}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-primary/20" : ""}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                type="number"
                placeholder="Min Pulse Score"
                value={filters.minPulse}
                onChange={(e) => setFilters(prev => ({ ...prev, minPulse: e.target.value }))}
                className="celestial-input"
              />
              
              <Input
                placeholder="Search by Sector"
                value={filters.sector}
                onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
                className="celestial-input"
              />
              
              <Input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="celestial-input"
              />
              
              <Input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="celestial-input"
              />
              
              <select
                className="celestial-input px-4 py-2 rounded-md"
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              >
                <option value="recent">Recently Added</option>
                <option value="pulse">Highest Resonance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-6"}>
          {entities.map((entity) => (
            entity.trade_offers?.map((offer) => (
              offer.is_active && (
                <OfferingCard
                  key={offer.id}
                  offering={{
                    ...offer,
                    business_name: entity.name,
                    pulse_score: entity.pulse_score
                  }}
                />
              )
            ))
          ))}
        </div>
      </main>
    </div>
  );
}

export default Tradesea;
