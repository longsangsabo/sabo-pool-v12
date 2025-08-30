/**
 * SABO Pool Arena - Authentication Error Class
 * Custom error class for authentication operations
 */

export class AuthError extends Error {
  public code: string;
  public details?: string;
  public hint?: string;
  public status?: number;
  
  constructor(message: string, code: string, details?: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;
    
    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AuthError.prototype);
  }
  
  /**
   * Create AuthError from Supabase error
   */
  static fromSupabaseError(error: any): AuthError {
    return new AuthError(
      error.message || 'Authentication failed',
      error.code || 'AUTH_ERROR',
      error.details
    );
  }
  
  /**
   * Convert to JSON for logging/serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      hint: this.hint,
      status: this.status,
      stack: this.stack,
    };
  }
}

export default AuthError;
