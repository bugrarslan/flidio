import { supabase } from '@/lib/supabase';
import { validateEmail, validatePassword, validateFullName } from '@/utils/formValidation';
import type { AuthError, User, Session } from '@supabase/supabase-js';

export type AuthResult = {
  user: User | null;
  session: Session | null;
  error: AuthError | Error | null;
};

export type SignUpData = {
  email: string;
  password: string;
  fullName: string;
  revenuecatCustomerId?: string;
};

export type SignInData = {
  email: string;
  password: string;
};

export type SocialSignInProvider = 'google' | 'apple';

/**
 * Auth Service for Supabase authentication
 * Handles sign in, sign up, and social authentication (Google, Apple)
 */
export class AuthService {
  /**
   * Sign up a new user with email and password
   * @param data - Sign up data including email, password, full name, and optional RevenueCat customer ID
   * @returns AuthResult with user, session, and error
   */
  static async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      // Validate email
      const emailValidation = validateEmail(data.email);
      if (!emailValidation.isValid) {
        return {
          user: null,
          session: null,
          error: new Error(emailValidation.error),
        };
      }

      // Validate password
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        return {
          user: null,
          session: null,
          error: new Error(passwordValidation.error),
        };
      }

      // Validate full name
      const nameValidation = validateFullName(data.fullName);
      if (!nameValidation.isValid) {
        return {
          user: null,
          session: null,
          error: new Error(nameValidation.error),
        };
      }

      // Sign up with Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            ...(data.revenuecatCustomerId && {
              revenuecat_customer_id: data.revenuecatCustomerId,
            }),
          },
        },
      });

      

      if (error) {
        return {
          user: null,
          session: null,
          error,
        };
      }

      return {
        user: authData.user,
        session: authData.session,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('An unexpected error occurred'),
      };
    }
  }

  /**
   * Sign in an existing user with email and password
   * @param data - Sign in data including email and password
   * @returns AuthResult with user, session, and error
   */
  static async signIn(data: SignInData): Promise<AuthResult> {
    try {
      // Validate email
      const emailValidation = validateEmail(data.email);
      if (!emailValidation.isValid) {
        return {
          user: null,
          session: null,
          error: new Error(emailValidation.error),
        };
      }

      // Validate password (basic check for sign in)
      if (!data.password || data.password.trim() === '') {
        return {
          user: null,
          session: null,
          error: new Error('Password is required'),
        };
      }

      // Sign in with Supabase
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (error) {
        return {
          user: null,
          session: null,
          error,
        };
      }

      return {
        user: authData.user,
        session: authData.session,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('An unexpected error occurred'),
      };
    }
  }

  /**
   * Sign in with Google
   * @returns AuthResult with user, session, and error
   */
  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'flidio://auth/callback',
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error,
        };
      }

      // For OAuth, we need to wait for the session to be established
      // The actual user and session will be available via onAuthStateChange
      return {
        user: null,
        session: null,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('An unexpected error occurred'),
      };
    }
  }

  /**
   * Sign in with Apple
   * @returns AuthResult with user, session, and error
   */
  static async signInWithApple(): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'flidio://auth/callback',
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error,
        };
      }

      // For OAuth, we need to wait for the session to be established
      // The actual user and session will be available via onAuthStateChange
      return {
        user: null,
        session: null,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('An unexpected error occurred'),
      };
    }
  }

  /**
   * Sign out the current user
   * @returns Error if sign out failed, null otherwise
   */
  static async signOut(): Promise<{ error: AuthError | Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unexpected error occurred'),
      };
    }
  }

  /**
   * Get the current user session
   * @returns Current session or null
   */
  static async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Get the current user
   * @returns Current user or null
   */
  static async getUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        return null;
      }
      return data.user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Update user metadata (full_name, revenuecat_customer_id)
   * @param metadata - User metadata to update
   * @returns AuthResult with updated user
   */
  static async updateUserMetadata(metadata: {
    full_name?: string;
    revenuecat_customer_id?: string;
  }): Promise<AuthResult> {
    try {
      // Validate full_name if provided
      if (metadata.full_name) {
        const nameValidation = validateFullName(metadata.full_name);
        if (!nameValidation.isValid) {
          return {
            user: null,
            session: null,
            error: new Error(nameValidation.error),
          };
        }
      }

      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...(metadata.full_name && { full_name: metadata.full_name.trim() }),
          ...(metadata.revenuecat_customer_id && {
            revenuecat_customer_id: metadata.revenuecat_customer_id,
          }),
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error,
        };
      }

      return {
        user: data.user,
        session: null,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('An unexpected error occurred'),
      };
    }
  }

  /**
   * Send password reset email
   * @param email - User's email address
   * @returns Error if failed, null otherwise
   */
  static async resetPassword(email: string): Promise<{ error: AuthError | Error | null }> {
    try {
      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return {
          error: new Error(emailValidation.error),
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: 'flidio://auth/reset-password',
        }
      );

      return { error };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unexpected error occurred'),
      };
    }
  }

  /**
   * Update user password
   * @param newPassword - New password
   * @returns Error if failed, null otherwise
   */
  static async updatePassword(newPassword: string): Promise<{ error: AuthError | Error | null }> {
    try {
      // Validate password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          error: new Error(passwordValidation.error),
        };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { error };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unexpected error occurred'),
      };
    }
  }

  /**
   * Listen to auth state changes
   * @param callback - Callback function to execute on auth state change
   * @returns Subscription object to unsubscribe
   */
  static onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
}

export default AuthService;
