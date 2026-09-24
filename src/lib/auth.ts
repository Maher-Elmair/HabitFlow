/**
 * Auth facade.
 *
 * When Firebase env vars are present (see .env.example) every call goes to
 * Firebase Auth. When they're missing — local preview, fresh clone, CI — the
 * app falls back to a local demo account stored in localStorage so the UI is
 * still usable instead of crashing with `auth/invalid-api-key`.
 */
import {
  onAuthStateChanged as fbOnAuthStateChanged,
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbSignUp,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile,
  signInWithPopup as fbSignInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebaseConfig";

export type AppUser = Pick<User, "uid" | "email" | "displayName" | "photoURL">;

const DEMO_KEY = "habitflow_demo_user";

type Listener = (user: AppUser | null) => void;
const listeners = new Set<Listener>();

function readDemoUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

function writeDemoUser(user: AppUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(DEMO_KEY);
  }
  listeners.forEach((listener) => listener(user));
}

function makeDemoUser(email: string, displayName?: string): AppUser {
  return {
    uid: "demo-user",
    email,
    displayName: displayName || email.split("@")[0] || "Demo user",
    photoURL: null,
  };
}

export const usingDemoAuth = !isFirebaseConfigured;

export function onAuthChanged(callback: Listener): () => void {
  if (isFirebaseConfigured && auth) {
    return fbOnAuthStateChanged(auth, (user) => callback(user));
  }
  listeners.add(callback);
  callback(readDemoUser());
  return () => listeners.delete(callback);
}

export function getCurrentUser(): AppUser | null {
  if (isFirebaseConfigured && auth) return auth.currentUser;
  return readDemoUser();
}

export async function signInWithEmail(email: string, password: string) {
  if (isFirebaseConfigured && auth) {
    await fbSignIn(auth, email, password);
    return;
  }
  writeDemoUser(makeDemoUser(email));
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  if (isFirebaseConfigured && auth) {
    const credential = await fbSignUp(auth, email, password);
    if (fullName) {
      await fbUpdateProfile(credential.user, { displayName: fullName });
    }
    return;
  }
  writeDemoUser(makeDemoUser(email, fullName));
}

export async function signInWithProvider(provider: "google" | "github") {
  if (isFirebaseConfigured && auth) {
    const authProvider =
      provider === "google" ? new GoogleAuthProvider() : new GithubAuthProvider();
    await fbSignInWithPopup(auth, authProvider);
    return;
  }
  writeDemoUser(makeDemoUser(`demo@${provider}.local`, "Demo user"));
}

export async function signOutUser() {
  if (isFirebaseConfigured && auth) {
    await fbSignOut(auth);
    return;
  }
  writeDemoUser(null);
}
