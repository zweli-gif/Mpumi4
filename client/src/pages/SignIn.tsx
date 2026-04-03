import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function SignInPage() {
  const [, setLocation] = useLocation();

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setLocation("/");
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">Growth Farm</h1>
        <p className="text-gray-500 mb-6">Sign in to continue</p>
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}