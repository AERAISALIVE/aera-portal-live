
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Send, TrendingUp, History, CreditCard } from "lucide-react";
import WithdrawalRequestModal from "./WithdrawalRequestModal";

function PulseWallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [transferData, setTransferData] = useState({
    recipient: "",
    amount: "",
    message: ""
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();

    const walletSubscription = supabase
      .channel('wallet_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pulse_wallets',
        filter: `steward_id=eq.${user?.id}`
      }, () => {
        fetchWalletData();
      })
      .subscribe();

    const transactionSubscription = supabase
      .channel('transaction_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pulse_transactions',
        filter: `steward_id=eq.${user?.id}`
      }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      walletSubscription.unsubscribe();
      transactionSubscription.unsubscribe();
    };
  }, [user]);

  const fetchWalletData = async () => {
    try {
      const { data, error } = await supabase
        .from('pulse_wallets')
        .select('*')
        .eq('steward_id', user.id)
        .single();

      if (error) throw error;
      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('pulse_transactions')
        .select('*')
        .eq('steward_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleTransfer = async () => {
    if (!transferData.recipient || !transferData.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseInt(transferData.amount);
    if (amount <= 0 || amount > wallet.balance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to transfer",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: transferError } = await supabase.rpc('transfer_pulse', {
        recipient_email: transferData.recipient,
        amount: amount,
        message: transferData.message
      });

      if (transferError) throw transferError;

      toast({
        title: "Success",
        description: "PULSE transfer completed successfully"
      });

      setShowTransferModal(false);
      setTransferData({ recipient: "", amount: "", message: "" });
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
        <CardTitle className="text-2xl">PULSE Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <motion.div
          className="relative p-6 rounded-lg bg-secondary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
            <p className="text-4xl font-bold">{wallet?.balance || 0}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date(wallet?.last_updated).toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setShowTransferModal(true)}
            className="sovereign-button"
          >
            <Send className="w-4 h-4 mr-2" />
            Transfer PULSE
          </Button>
          <Button
            onClick={() => setShowWithdrawalModal(true)}
            className="sovereign-button"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Request Withdrawal
          </Button>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <History className="w-4 h-4 mr-2" />
            Recent Transactions
          </h3>
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-lg bg-secondary/10 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium capitalize">{transaction.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === 'earn' || transaction.type === 'gift'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}>
                    {transaction.type === 'earn' || transaction.type === 'gift' ? '+' : '-'}
                    {transaction.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transfer Modal */}
        <AnimatePresence>
          {showTransferModal && (
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
                    <CardTitle>Transfer PULSE</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Recipient Email"
                      value={transferData.recipient}
                      onChange={(e) => setTransferData(prev => ({
                        ...prev,
                        recipient: e.target.value
                      }))}
                      className="celestial-input"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={transferData.amount}
                      onChange={(e) => setTransferData(prev => ({
                        ...prev,
                        amount: e.target.value
                      }))}
                      className="celestial-input"
                    />
                    <Input
                      placeholder="Message (optional)"
                      value={transferData.message}
                      onChange={(e) => setTransferData(prev => ({
                        ...prev,
                        message: e.target.value
                      }))}
                      className="celestial-input"
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleTransfer}
                        className="flex-1 sovereign-button"
                      >
                        Send PULSE
                      </Button>
                      <Button
                        onClick={() => setShowTransferModal(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Withdrawal Request Modal */}
          {showWithdrawalModal && wallet && (
            <WithdrawalRequestModal
              walletId={wallet.id}
              balance={wallet.balance}
              onClose={() => setShowWithdrawalModal(false)}
              onSuccess={() => {
                fetchWalletData();
                fetchTransactions();
              }}
            />
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default PulseWallet;
