
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

function SetupSupabase() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const testConnection = async () => {
    try {
      // Test the connection by fetching the current user session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Supabase connection established successfully"
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Supabase Connection</h2>
          <p className="mt-2 text-muted-foreground">
            Testing connection to Supabase
          </p>
        </div>
        <Button onClick={testConnection} className="w-full">
          Test Connection
        </Button>
      </div>
    </div>
  );
}

export default SetupSupabase;
