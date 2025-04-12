
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

function WithdrawalRequestModal({ walletId, balance, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert([{
          wallet_id: walletId,
          amount: parseFloat(amount),
          status: 'pending',
          review_notes: note || "For project reinvestment",
          requested_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
        className: "divine-glow"
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="divine-card">
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={balance}
                  className="celestial-input"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Available balance: {balance}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Withdrawal Purpose</label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., For project reinvestment"
                  className="celestial-input"
                />
                <p className="text-xs text-muted-foreground">
                  Helps us understand the flow of divine commerce
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="flex-1 sovereign-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit Request"}
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default WithdrawalRequestModal;
