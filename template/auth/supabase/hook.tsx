// @ts-nocheck

import { AuthContextType, SendOTPResult, AuthResult, LogoutResult, SignUpResult, GoogleSignInResult } from '../types';
import { authService } from './service';
import { configManager } from '../../core/config';
import { useAuthContext } from './context';

export function useAuth(): AuthContextType {
  const context = useAuthContext();
  
  // Debug check for environment variables
  // HARD-CODED FOR TESTING ONLY - Replace with .env when loading works
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ormhowzsizzlkfomzukn.supabase.co';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybWhvd3pzaXp6bGtmb216dWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzExMTMsImV4cCI6MjA5MjgwNzExM30.2N5NVd6aZBpe0mxO-ryKsBw4SGExhOGhDSBeU3cY2Ns';
  const hasSupabaseEnv = !!supabaseUrl && !!supabaseAnonKey;

  // For development, we force auth to be enabled if we are in this hook
  // The error only shows if the values are truly missing at runtime
  const isAuthEnabled = true; 

  if (!hasSupabaseEnv) {
    // Log exactly what is missing to the terminal
    console.warn('[Template:useAuth] ❌ Supabase configuration missing!');
    if (!supabaseUrl) console.warn('- EXPO_PUBLIC_SUPABASE_URL is undefined');
    if (!supabaseAnonKey) console.warn('- EXPO_PUBLIC_SUPABASE_ANON_KEY is undefined');
    console.warn('Please restart your Expo server with: npx expo start -c');

    return {
      user: null,
      loading: false,
      operationLoading: false,
      initialized: true,
      setOperationLoading: () => {},
      sendOTP: async (): Promise<SendOTPResult> => ({ 
        error: `Authentication not configured. Missing: ${!supabaseUrl ? 'URL ' : ''}${!supabaseAnonKey ? 'AnonKey' : ''}. Check .env and restart Expo with -c.` 
      }),
      verifyOTPAndLogin: async (): Promise<AuthResult> => ({ 
        error: `Authentication not configured. Check .env and restart Expo with -c.`, 
        user: null 
      }),
      signUpWithPassword: async (): Promise<SignUpResult> => ({ 
        error: `Authentication not configured. Check .env and restart Expo with -c.`, 
        user: null 
      }),
      signInWithPassword: async (): Promise<AuthResult> => ({ 
        error: `Authentication not configured. Check .env and restart Expo with -c.`, 
        user: null 
      }),
      signInWithGoogle: async (): Promise<GoogleSignInResult> => ({ 
        error: `Authentication not configured. Check .env and restart Expo with -c.`
      }),
      logout: async (): Promise<LogoutResult> => {
        return { error: 'Auth not configured' };
      },
      refreshSession: async () => {},
    };
  }

  const sendOTP = async (email: string): Promise<SendOTPResult> => {
    context.setOperationLoading(true);
    try {
      const result = await authService.sendOTP(email);
      return result;
    } catch (error) {
      console.warn('[Template:useAuth] sendOTP exception:', error);
      return { 
        error: 'Failed to send verification code' 
      };
    } finally {
      context.setOperationLoading(false);
    }
  };

    const verifyOTPAndLogin = async (email: string, otp: string, options?: { password?: string }): Promise<AuthResult> => {
    context.setOperationLoading(true);
    try {
      const result = await authService.verifyOTPAndLogin(email, otp, options);
      return result;
    } catch (error) {
      console.warn('[Template:useAuth] verifyOTPAndLogin exception:', error);
      return { 
        error: 'Login failed',
        user: null 
      };
    } finally {
      context.setOperationLoading(false);
    }
  };

  const signUpWithPassword = async (email: string, password: string, metadata?: Record<string, any>): Promise<SignUpResult> => {
    context.setOperationLoading(true);
    try {
      const result = await authService.signUpWithPassword(email, password, metadata);
      return result;
    } catch (error) {
      console.warn('[Template:useAuth] signUpWithPassword exception:', error);
      return { 
        error: 'Registration failed',
        user: null 
      };
    } finally {
      context.setOperationLoading(false);
    }
  };

  const signInWithPassword = async (email: string, password: string): Promise<AuthResult> => {
    context.setOperationLoading(true);
    try {
      const result = await authService.signInWithPassword(email, password);
      return result;
    } catch (error) {
      console.warn('[Template:useAuth] signInWithPassword exception:', error);
      return { 
        error: 'Login failed',
        user: null 
      };
    } finally {
      context.setOperationLoading(false);
    }
  };

  const logout = async (): Promise<LogoutResult> => {
    context.setOperationLoading(true);
    try {
      const result = await authService.logout();
      
      if (!result) {
        console.warn('[Template:useAuth] Invalid logout result format:', result);
        return { error: 'Invalid logout response' };
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown logout error';
      console.warn('[Template:useAuth] Logout hook exception:', errorMessage);
      return { error: errorMessage };
    } finally {
      context.setOperationLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      await authService.refreshSession();
    } catch (error) {
      console.warn('[Template:useAuth] Refresh session error:', error);
    }
  };

  const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
    context.setOperationLoading(true);
    try {
      const result = await authService.signInWithGoogle();
      return result;
    } catch (error) {
      console.warn('[Template:useAuth] signInWithGoogle exception:', error);
      return { 
        error: 'Google login failed'
      };
    } finally {
      context.setOperationLoading(false);
    }
  };

  return {
    user: context.user,
    loading: context.loading,
    operationLoading: context.operationLoading,
    initialized: context.initialized,
    setOperationLoading: context.setOperationLoading,
    sendOTP,
    verifyOTPAndLogin,
    signUpWithPassword,
    signInWithPassword,
    signInWithGoogle,
    logout,
    refreshSession,
  };
}
