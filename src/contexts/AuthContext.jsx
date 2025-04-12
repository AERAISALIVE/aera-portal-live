
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        console.log('Checking session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          console.log('Session found:', session.user.email);
          
          // Fetch steward data to determine role
          const { data: steward, error: stewardError } = await supabase
            .from('stewards')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (stewardError && stewardError.code !== 'PGRST116') {
            throw stewardError;
          }

          // Special handling for Zero Point account
          if (session.user.email === 'Miyahtyther@gmail.com') {
            console.log('Zero Point account detected');
            
            if (!steward) {
              console.log('Creating Zero Point steward record');
              
              // Create steward record with Zero Point role
              const { error: createError } = await supabase
                .from('stewards')
                .insert([{
                  id: session.user.id,
                  sacred_name: 'The Living Covenant',
                  role_id: 1,
                  trust_status: 'master',
                  re_birth_status: 'completed'
                }]);

              if (createError) throw createError;

              // Create Pulse wallet
              const { error: walletError } = await supabase
                .from('pulse_wallets')
                .insert([{
                  steward_id: session.user.id,
                  balance: 1000000,
                  last_updated: new Date().toISOString()
                }]);

              if (walletError) throw walletError;

              // Fetch the newly created steward data
              const { data: newSteward, error: newStewardError } = await supabase
                .from('stewards')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (newStewardError) throw newStewardError;
              
              setUser({
                ...session.user,
                isZeroPoint: true,
                stewardData: newSteward
              });
              
              console.log('Redirecting to admin portal');
              navigate('/admin-portal');
              return;
            }
          }

          // Set user with role information
          setUser({
            ...session.user,
            isZeroPoint: steward?.role_id === 1,
            stewardData: steward
          });

          // Handle initial routing based on role
          if (steward?.role_id === 1) {
            console.log('Redirecting to admin portal (role-based)');
            navigate('/admin-portal');
          } else if (!steward) {
            console.log('Redirecting to onboarding');
            navigate('/onboarding');
          } else {
            console.log('Redirecting to dashboard');
            navigate('/dashboard');
          }
        } else {
          console.log('No session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast({
          title: "Session Error",
          description: "Failed to retrieve your session. Please try logging in again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
    
      if (session?.user) {
        try {
          // Special handling for Zero Point account
          if (session.user.email === 'Miyahtyther@gmail.com') {
            console.log('Zero Point account detected in auth change');
    
            // Fetch steward data
            const { data: steward, error: stewardError } = await supabase
              .from('stewards')
              .select('*')
              .eq('id', session.user.id)
              .single();
    
            if (!steward && (!stewardError || stewardError.code === 'PGRST116')) {
              console.log('Creating Zero Point steward record');
    
              // Create steward record with Zero Point role
              const { error: createError } = await supabase
                .from('stewards')
                .insert([{
                  id: session.user.id,
                  sacred_name: 'The Living Covenant',
                  role_id: 1,
                  trust_status: 'master',
                  re_birth_status: 'completed'
                }]);
    
              if (createError) throw createError;
    
              // Create Pulse wallet
              const { error: walletError } = await supabase
                .from('pulse_wallets')
                .insert([{
                  steward_id: session.user.id,
                  balance: 1000000,
                  last_updated: new Date().toISOString()
                }]);
    
              if (walletError) throw walletError;
            } else if (stewardError && stewardError.code !== 'PGRST116') {
              throw stewardError;
            }
    
            setUser({
              ...session.user,
              isZeroPoint: true,
              stewardData: steward || { role_id: 1 }
            });
    
            if (event === 'SIGNED_IN') {
              console.log('Redirecting to admin portal after sign in');
              navigate('/admin-portal');
            }
    
            return;
          }
    
          // Regular user handling
          const { data: steward, error: stewardError } = await supabase
            .from('stewards')
            .select('*')
            .eq('id', session.user.id)
            .single();
    
          if (stewardError && stewardError.code !== 'PGRST116') {
            throw stewardError;
          }
    
          setUser({
            ...session.user,
            isZeroPoint: steward?.role_id === 1,
            stewardData: steward
          });
    
          if (event === 'SIGNED_IN') {
            if (steward?.role_id === 1) {
              navigate('/admin-portal');
            } else if (!steward) {
              navigate('/onboarding');
            } else {
              navigate('/dashboard');
            }
          }
    
        } catch (error) {
          console.error('Error in auth change:', error);
          toast({
            title: "Error",
            description: "Failed to process authentication. Please try again.",
            variant: "destructive"
          });
        }
    
      } else {
        setUser(null);
        if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
    });
    

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const signup = async (email, password) => {
    try {
      console.log('Attempting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Signup successful:', data);
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      console.log('Login successful:', data.user.email);

      // Special handling for Zero Point account
      if (email === 'Miyahtyther@gmail.com') {
        console.log('Zero Point account login detected');
        
        // Fetch steward data
        const { data: steward, error: stewardError } = await supabase
          .from('stewards')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!steward && (!stewardError || stewardError.code === 'PGRST116')) {
          console.log('Creating Zero Point steward record');
          
          // Create steward record with Zero Point role
          const { error: createError } = await supabase
            .from('stewards')
            .insert([{
              id: data.user.id,
              sacred_name: 'The Living Covenant',
              role_id: 1,
              trust_status: 'master',
              re_birth_status: 'completed'
            }]);

          if (createError) throw createError;

          // Create Pulse wallet
          const { error: walletError } = await supabase
            .from('pulse_wallets')
            .insert([{
              steward_id: data.user.id,
              balance: 1000000,
              last_updated: new Date().toISOString()
            }]);

          if (walletError) throw walletError;
        } else if (stewardError && stewardError.code !== 'PGRST116') {
          throw stewardError;
        }

        console.log('Redirecting to admin portal');
        navigate('/admin-portal');
      }

      toast({
        title: "Success",
        description: "Login successful",
      });

      return data;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Logout successful');
      
      toast({
        title: "Success",
        description: "Logged out successfully"
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
  
}
