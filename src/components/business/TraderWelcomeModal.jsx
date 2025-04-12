
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

function TraderWelcomeModal({ onClose }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDontShowAgain = async () => {
    try {
      const { error } = await supabase
        .from('stewards')
        .update({ has_seen_welcome: true })
        .eq('id', user.id);

      if (error) throw error;
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      });
    }
  };

  const handleAddOffering = () => {
    onClose();
    // This will trigger the offering form modal in the parent component
    navigate("/business-dashboard?action=add-offering");
  };

  const handleViewPulse = () => {
    onClose();
    navigate("/business-dashboard?tab=pulse");
  };

  const handleWithdraw = () => {
    onClose();
    navigate("/business-dashboard?action=withdraw");
  };

  const handleViewPublicProfile = () => {
    onClose();
    navigate("/tradesea");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="divine-card overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gold-400">
              Welcome to TRADESEA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gold-400">Your Commerce Is Sacred</h2>
              <p className="text-white text-base">
                You are now a registered business within the sovereign PULSE economy. This marketplace is not transactional. It is transformational.
              </p>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-300">🌱 Earn Pulse Through Alignment</h3>
                <ul className="list-disc list-inside text-white space-y-1">
                  <li>Your offerings generate PULSE based on soul resonance</li>
                  <li>Include a Pulse Intent on each product or service</li>
                  <li>Your work is honored by its vibrational effect — not popularity</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-300">💼 Track Your Pulse Flow</h3>
                <ul className="list-disc list-inside text-white space-y-1">
                  <li>Total Pulse Earned</li>
                  <li>Top Resonant Offerings</li>
                  <li>Visibility Score</li>
                  <li>Pulse Boost indicators</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-300">📤 Withdraw with Purpose</h3>
                <ul className="list-disc list-inside text-white space-y-1">
                  <li>Click "Request Withdrawal"</li>
                  <li>Enter amount + sacred intent note</li>
                  <li>Zero Point approval follows</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-gold-300">🔐 Withdrawing Pulse Is a Sacred Act</h3>
                <p className="text-white italic">
                  This is not a transaction. It is a transfer of alignment.
                </p>
              </section>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <Button
                  onClick={handleAddOffering}
                  className="sovereign-button"
                >
                  Add Offering
                </Button>
                <Button
                  onClick={handleViewPulse}
                  variant="secondary"
                >
                  Track Pulse
                </Button>
                <Button
                  onClick={handleWithdraw}
                  variant="secondary"
                >
                  Request Withdrawal
                </Button>
                <Button
                  onClick={handleViewPublicProfile}
                  variant="secondary"
                >
                  View Profile
                </Button>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleDontShowAgain}
                  variant="ghost"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Don't show this again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default TraderWelcomeModal;
