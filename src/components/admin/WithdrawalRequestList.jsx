
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, AlertTriangle, TrendingUp } from "lucide-react";

function WithdrawalRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    calculateTotalWithdrawn();

    const subscription = supabase
      .channel('withdrawal_requests_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawal_requests'
      }, () => {
        fetchRequests();
        calculateTotalWithdrawn();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          stewards (
            sacred_name,
            trust_status
          ),
          pulse_wallets (
            balance
          )
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch withdrawal requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalWithdrawn = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('amount')
        .eq('status', 'approved');

      if (error) throw error;
      const total = data.reduce((sum, req) => sum + req.amount, 0);
      setTotalWithdrawn(total);
    } catch (error) {
      console.error("Error calculating total withdrawn:", error);
    }
  };

  const handleRequest = async (request, isApproved, notes = "") => {
    try {
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: isApproved ? 'approved' : 'declined',
          review_notes: notes || request.review_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      if (isApproved) {
        // Create transaction record
        const { error: transactionError } = await supabase
          .from('pulse_transactions')
          .insert([{
            wallet_id: request.wallet_id,
            steward_id: request.steward_id,
            amount: request.amount,
            type: 'withdrawal',
            description: request.review_notes || 'Withdrawal request approved',
            created_at: new Date().toISOString()
          }]);

        if (transactionError) throw transactionError;

        // Update wallet balance
        const { error: walletError } = await supabase
          .from('pulse_wallets')
          .update({
            balance: request.pulse_wallets.balance - request.amount,
            last_updated: new Date().toISOString()
          })
          .eq('id', request.wallet_id);

        if (walletError) throw walletError;
      }

      toast({
        title: isApproved ? "Request Approved" : "Request Declined",
        description: `Withdrawal request has been ${isApproved ? 'approved' : 'declined'}`,
        className: isApproved ? "divine-glow" : undefined
      });

      fetchRequests();
      calculateTotalWithdrawn();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="divine-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Withdrawal Requests</CardTitle>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              Total Withdrawn: {totalWithdrawn} PULSE
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          <div className="space-y-4">
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className={`divine-card overflow-hidden ${
                  request.status === 'approved' 
                    ? 'border-green-500/50' 
                    : request.status === 'declined'
                      ? 'border-red-500/50'
                      : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {request.stewards?.sacred_name || "Unknown Steward"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Trust Status: {request.stewards?.trust_status || "Unknown"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{request.amount} PULSE</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.requested_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {request.review_notes && (
                      <div className="mb-4 p-3 bg-secondary/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Purpose: {request.review_notes}
                        </p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex space-x-2 mt-4">
                        <Button
                          onClick={() => handleRequest(request, true)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRequest(request, false)}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {request.status !== 'pending' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`mt-4 p-4 rounded-lg ${
                          request.status === 'approved' 
                            ? 'bg-green-500/10 border border-green-500/20' 
                            : 'bg-red-500/10 border border-red-500/20'
                        }`}
                      >
                        <div className="flex items-center">
                          {request.status === 'approved' 
                            ? <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                            : <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                          }
                          <span className="font-medium capitalize">
                            {request.status}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default WithdrawalRequestList;
