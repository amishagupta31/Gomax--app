import { supabase } from '../lib/supabase';

/**
 * Supabase Auth needs an email identity to do password-based sign-in without
 * SMS/OTP confirmation. We derive a stable synthetic email from the mobile
 * number so the person only ever sees/types their mobile number — this
 * mapping is never shown in the UI.
 */
function syntheticEmail(mobileNumber: string) {
  const digits = mobileNumber.replace(/[^0-9]/g, '');
  // NOTE: .internal is an RFC-2606-adjacent reserved TLD that Supabase's
  // GoTrue email validator rejects outright ("email_address_invalid") —
  // learned the hard way. Any ordinary-looking domain works instead; this
  // address is never actually emailed since Auth confirmation is off.
  return `m${digits}@gomaxusers.app`;
}

export type SignupRole = 'dealer' | 'contractor' | 'applicator';

export const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  'What was the name of your first school?',
  'What is your birth city?',
  'What is the name of your favourite teacher?',
  'What is the name of your first pet?',
] as const;

export type SecurityQuestion = (typeof SECURITY_QUESTIONS)[number];

export type SignupInput = {
  mobileNumber: string;
  password: string;
  role: SignupRole;
  fullName: string;
  city: string;
  address: string;
  bankAccountNumber: string;
  bankIfsc: string;
  upiId: string;
  securityQuestion: SecurityQuestion;
  securityAnswer: string;
  referralCode: string;
  panNumber?: string;
  aadhaarNumber?: string;
};

/** Creates the auth user, then fills in the full profile via complete_signup(). */
export async function signUp(input: SignupInput) {
  const { data, error } = await supabase.auth.signUp({
    email: syntheticEmail(input.mobileNumber),
    password: input.password,
  });
  if (error) throw error;
  if (!data.user) throw new Error('Signup did not return a user');

  // If email confirmation is required by project settings there may be no
  // session yet — sign in explicitly so complete_signup() runs as this user.
  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: syntheticEmail(input.mobileNumber),
      password: input.password,
    });
    if (signInError) throw signInError;
  }

  const { data: result, error: rpcError } = await supabase.rpc('complete_signup', {
    p_role: input.role,
    p_full_name: input.fullName,
    p_mobile_number: input.mobileNumber,
    p_city: input.city,
    p_address: input.address,
    p_bank_account_number: input.bankAccountNumber,
    p_bank_ifsc: input.bankIfsc,
    p_upi_id: input.upiId,
    p_security_question: input.securityQuestion,
    p_security_answer: input.securityAnswer,
    p_referral_code: input.referralCode,
    p_pan_number: input.panNumber,
    p_aadhaar_number: input.aadhaarNumber,
  });
  if (rpcError) throw rpcError;
  const payload = result as { success: boolean; error?: string; referral_code?: string };
  if (!payload.success) {
    await supabase.auth.signOut();
    throw new Error(payload.error ?? 'Signup failed');
  }
  return payload;
}

export async function signIn(mobileNumber: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: syntheticEmail(mobileNumber),
    password,
  });
  if (error) throw new Error('Invalid mobile number or password');
  return data.user?.id ?? null;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/** Looks up which fixed security question a mobile number's owner set, so the forgot-password screen can render it (pre-auth). */
export async function getSecurityQuestionForMobile(mobileNumber: string) {
  const { data, error } = await supabase.rpc('get_security_question', { p_mobile_number: mobileNumber });
  if (error) throw error;
  return data as string | null;
}

/** Step 1 of forgot-password: request an OTP. `devOtp` is only populated until a real SMS provider is wired up. */
export async function requestPasswordResetOtp(mobileNumber: string) {
  const { data, error } = await supabase.rpc('request_password_reset_otp', { p_mobile_number: mobileNumber });
  if (error) throw error;
  const payload = data as { success: boolean; error?: string; dev_otp?: string };
  if (!payload.success) throw new Error(payload.error ?? 'Could not send OTP');
  return payload.dev_otp ?? null;
}

/** Step 2 of forgot-password: OTP + security answer, both required, then sets the new password. */
export async function resetPasswordWithOtp(
  mobileNumber: string,
  otpCode: string,
  securityAnswer: string,
  newPassword: string
) {
  const { data, error } = await supabase.rpc('reset_password_with_otp', {
    p_mobile_number: mobileNumber,
    p_otp_code: otpCode,
    p_security_answer: securityAnswer,
    p_new_password: newPassword,
  });
  if (error) throw error;
  const payload = data as { success: boolean; error?: string };
  if (!payload.success) throw new Error(payload.error ?? 'Could not reset password');
}

