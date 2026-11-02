import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  updateProfile,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { firebaseConfigured, getFirebaseAuth } from "./firebase";

export type AuthProvider = "google" | "email" | "phone";

export function watchAuth(callback: (user: User | null) => void): () => void {
  if (!firebaseConfigured) {
    callback(null);
    return () => {};
  }
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured.");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured.");
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string, name?: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured.");
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(result.user, { displayName: name });
  return result.user;
}

let recaptcha: RecaptchaVerifier | null = null;

/**
 * Starts phone sign-in. The container must be an empty element already in the DOM.
 * Returns a ConfirmationResult; pass the SMS code to `confirmPhoneCode`.
 */
export async function startPhoneSignIn(phone: string, containerId: string): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured.");
  if (!recaptcha) {
    recaptcha = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  }
  return signInWithPhoneNumber(auth, phone, recaptcha);
}

export async function confirmPhoneCode(result: ConfirmationResult, code: string): Promise<User> {
  const credential = await result.confirm(code);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}

export function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code || "";
  const map: Record<string, string> = {
    "auth/invalid-email": "That email address is not valid.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/email-already-in-use": "An account already exists with this email. Sign in instead.",
    "auth/weak-password": "Use a password with at least 6 characters.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes.",
    "auth/invalid-phone-number": "Enter the phone number in +91XXXXXXXXXX format.",
    "auth/invalid-verification-code": "The verification code is incorrect.",
    "auth/operation-not-allowed": "This sign-in method is not enabled for the project.",
    "auth/quota-exceeded": "SMS quota exceeded. Try again later.",
    "auth/billing-not-enabled": "Phone sign-in needs the Firebase Blaze plan.",
    "auth/unauthorized-domain": "This domain is not authorised in Firebase Authentication settings.",
  };
  if (map[code]) return map[code];
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
