"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Film,
  Clapperboard,
  MonitorPlay,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password Visibility Toggle State
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Form Field State Values
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // 1. EXECUTE SECURE LOGIN REQUEST
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials. Please try again.");
      }

      // Store auth session tokens
      localStorage.setItem("cinevault_token", data.token);
      localStorage.setItem("cinevault_uid", data.userId);

      // Redirect back to home platform
      router.push("/");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. EXECUTE ACCOUNT SIGN-UP REQUEST
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (registerPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (registerPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registerEmail, password: registerPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Try a different email.");
      }

      // Auto-login following successful registration
      localStorage.setItem("cinevault_token", data.token);
      localStorage.setItem("cinevault_uid", data.userId);

      router.push("/");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground items-center justify-center p-4 md:p-8 dark selection:bg-primary selection:text-primary-foreground">
      {/* Container Frame */}
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-card rounded-2xl overflow-hidden border border-border/30 shadow-2xl shadow-black/80 min-h-[640px]">
        
        {/* LEFT COLUMN: CINEMATIC COVER PANEL */}
        <div className="hidden md:flex flex-col justify-between p-10 relative bg-gradient-to-br from-primary/20 via-zinc-950 to-black overflow-hidden border-r border-border/20">
          {/* Subtle Ambient Background Mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(var(--primary),0.15),transparent_50%)] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="flex items-center gap-2 z-10">
            <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-primary uppercase">
              CineVault
            </span>
          </div>

          {/* Core Feature Teasers */}
          <div className="space-y-6 z-10 my-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <ShieldCheck className="w-3.5 h-3.5" /> UNLIMITED STREAMING ACCESS
            </div>

            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight uppercase">
              Your Complete <br />
              <span className="text-primary bg-gradient-to-r from-primary via-primary/80 to-amber-500 bg-clip-text text-transparent">
                Streaming Vault
              </span>
            </h2>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm font-medium">
              Watch high-resolution cinematic trailers, track watch lists across devices, and unlock full offline viewing options.
            </p>

            <div className="space-y-3 pt-2 text-xs font-bold text-zinc-300">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-card border border-border/40">
                  <MonitorPlay className="w-4 h-4 text-primary" />
                </div>
                <span>4K Ultra HD & Inline Autoplay Trailers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-card border border-border/40">
                  <Clapperboard className="w-4 h-4 text-primary" />
                </div>
                <span>Cloud Progress Synchronization</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <p className="text-xs text-muted-foreground z-10 font-semibold flex items-center justify-between">
            <span>&copy; 2026 CineVault Engine</span>
            <span className="text-primary hover:underline cursor-pointer">Privacy & Terms</span>
          </p>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE AUTH TABBED SHEET */}
        <div className="flex flex-col justify-center p-6 sm:p-12 bg-zinc-950/90 backdrop-blur-xl">
          <div className="w-full max-w-md mx-auto space-y-6">
            
            {/* Global Error Banner */}
            {errorMessage && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs p-3.5 rounded-xl flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-semibold leading-tight">{errorMessage}</p>
              </div>
            )}

            <Tabs defaultValue="login" className="w-full">
              {/* Tab Selector Pill Bar */}
              <TabsList className="grid w-full grid-cols-2 bg-card/80 border border-border/40 mb-6 p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  onClick={() => setErrorMessage(null)}
                  className="font-extrabold text-xs tracking-wider rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all cursor-pointer"
                >
                  SIGN IN
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  onClick={() => setErrorMessage(null)}
                  className="font-extrabold text-xs tracking-wider rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all cursor-pointer"
                >
                  REGISTER
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: LOGIN FORM */}
              <TabsContent value="login" className="animate-in fade-in duration-200">
                <form onSubmit={handleLoginSubmit}>
                  <Card className="bg-transparent border-0 shadow-none p-0">
                    <CardHeader className="p-0 pb-5 space-y-1">
                      <CardTitle className="text-2xl font-black uppercase text-foreground tracking-tight">
                        Welcome Back
                      </CardTitle>
                      <CardDescription className="text-xs font-medium text-muted-foreground">
                        Sign into your CineVault profile to resume streaming.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0 space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="login-email" className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                          Email Address
                        </Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="name@domain.com"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="bg-card/60 border-border/40 h-11 text-sm rounded-xl focus-visible:ring-primary focus-visible:border-primary/50 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password" className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                            Password
                          </Label>
                          <a href="#" className="text-[11px] text-primary hover:underline font-bold">
                            Forgot password?
                          </a>
                        </div>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="bg-card/60 border-border/40 h-11 text-sm rounded-xl pr-10 focus-visible:ring-primary focus-visible:border-primary/50 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-0 pt-6">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-xs font-black uppercase cursor-pointer rounded-xl shadow-lg shadow-primary/20 tracking-wider transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Sign Into Platform</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </TabsContent>

              {/* TAB 2: REGISTER FORM */}
              <TabsContent value="register" className="animate-in fade-in duration-200">
                <form onSubmit={handleRegisterSubmit}>
                  <Card className="bg-transparent border-0 shadow-none p-0">
                    <CardHeader className="p-0 pb-5 space-y-1">
                      <CardTitle className="text-2xl font-black uppercase text-foreground tracking-tight">
                        Create Account
                      </CardTitle>
                      <CardDescription className="text-xs font-medium text-muted-foreground">
                        Unlock personal watchlists and high-definition video streams.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0 space-y-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="register-email" className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                          Email Address
                        </Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="name@domain.com"
                          required
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="bg-card/60 border-border/40 h-11 text-sm rounded-xl focus-visible:ring-primary focus-visible:border-primary/50 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="register-password" className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                          Choose Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            type={showRegisterPassword ? "text" : "password"}
                            placeholder="At least 6 characters"
                            required
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="bg-card/60 border-border/40 h-11 text-sm rounded-xl pr-10 focus-visible:ring-primary focus-visible:border-primary/50 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                          >
                            {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="confirm-password" className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="Repeat chosen password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-card/60 border-border/40 h-11 text-sm rounded-xl focus-visible:ring-primary focus-visible:border-primary/50 transition-all"
                        />
                      </div>
                    </CardContent>

                    <CardFooter className="p-0 pt-6">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-xs font-black uppercase cursor-pointer rounded-xl shadow-lg shadow-primary/20 tracking-wider transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Register Profile Now</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>

      </div>
    </div>
  );
}