"use client";
import React, { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Github, Mail, Lock, Sparkles, ArrowRight, User } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function LoginUI() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      await signIn.social({
        provider: "github",
        callbackURL: "http://localhost:3000/dashboard",
      });
    } catch (error) {
      console.error("Error during GitHub sign-in:", error);
      setLoading(false);
    }
  };

  const lineVariants = {
    hidden: { opacity: 0, filter: "blur(10px)", y: 5 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Left Section - Modern Luxurious Design */}
      <div className="hidden lg:flex w-1/2 relative bg-[#020403] items-center justify-center p-12 overflow-hidden border-r border-white/5">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          {/* Subtle Grid Texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:4rem_4rem] mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)" />

          {/* Deep Gradient Glows */}
          <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[0%] right-[0%] w-[600px] h-[600px] bg-teal-900/20 rounded-full blur-[100px]" />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col max-w-lg w-full">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-15 w-15 rounded-xl bg-white flex items-center justify-center shadow-2xl transform transition-transform hover:rotate-3 p-1">
              <Image
                src="/code-logo-bg.png"
                alt="CodeUnicorn Logo"
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white/90">
              CodeUnicorn
            </h1>
          </div>

          <h2 className="text-5xl font-extrabold leading-tight mb-6 text-white">
            Review code like <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-300 to-teal-600 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">
              magic.
            </span>
          </h2>

          <p className="text-lg text-zinc-400 leading-relaxed mb-12 max-w-md">
            Automate your PR reviews with AI-driven insights. Catch bugs early
            and ship faster with the power of modern tooling.
          </p>

          {/* Animated Code Snippet Card */}
          <div className="relative p-6 rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-emerald-900/20 transition-all hover:translate-y-[-4px] group overflow-hidden">
            {/* Glass sheen */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            <motion.div
              className="space-y-3 font-mono text-sm leading-relaxed"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.4, // Delay between each line
                  },
                },
              }}
            >
              {/* Line 1 */}
              <motion.div
                className="flex flex-wrap gap-x-2 items-center"
                variants={lineVariants}
              >
                <span className="text-zinc-600 select-none mr-2">1</span>
                <span className="text-purple-400">const</span>
                <span
                  // variants={wordVariants}
                  className="text-emerald-300"
                >
                  review
                </span>
                <span
                  // variants={wordVariants}
                  className="text-white"
                >
                  =
                </span>
                <span
                  // variants={wordVariants}
                  className="text-purple-400"
                >
                  await
                </span>
                <span
                  // variants={wordVariants}
                  className="text-white"
                >
                  codeUnicorn.analyze(pr);
                </span>
              </motion.div>

              {/* Line 2 */}
              <motion.div
                className="flex flex-wrap gap-x-2 items-center"
                variants={lineVariants}
              >
                <span className="text-zinc-600 select-none mr-2">2</span>
                <span
                  // variants={wordVariants}
                  className="text-purple-400"
                >
                  if
                </span>
                <span
                  // variants={wordVariants}
                  className="text-white"
                >
                  (review.score {">"} 95)
                </span>
                <motion.span
                  // variants={wordVariants}
                  className="text-yellow-400"
                >{`{`}</motion.span>
              </motion.div>

              {/* Line 3 */}
              <motion.div
                className="flex flex-wrap gap-x-2 items-center"
                variants={lineVariants}
              >
                <span className="text-zinc-600 select-none mr-2">3</span>
                <span className="w-4" /> {/* Indent */}
                <span
                  // variants={wordVariants}
                  className="text-purple-400"
                >
                  return
                </span>
                <span
                  // variants={wordVariants}
                  className="text-emerald-400"
                >
                  'Ready to ship!'
                </span>
                <span
                  // variants={wordVariants}
                  className="text-white"
                >
                  ;
                </span>
              </motion.div>

              {/* Line 4 */}
              <motion.div
                variants={lineVariants}
                className="flex gap-2 items-center"
              >
                <span className="text-zinc-600 select-none mr-2">4</span>
                <span className="text-yellow-400">{`}`}</span>
              </motion.div>
            </motion.div>

            {/* Floating badge */}
            {/* <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 3.2, type: "spring" }}
              className="absolute -right-3 -bottom-3 bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1 z-20"
            >
              <Sparkles className="w-3 h-3 fill-black" />
              AI Verified
            </motion.div> */}
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md p-8 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Get started with your free account today"}
            </p>
          </div>

          <div className="space-y-6">
            {/* Social Login */}
            <button
              onClick={handleGitHubLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-secondary/50 hover:bg-secondary text-foreground p-3.5 rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] group cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <Github className="h-5 w-5 group-hover:text-primary transition-colors" />
              )}
              <span className="font-medium">Continue with GitHub</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground font-medium tracking-wide">
                  Or continue with
                </span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {/* Name Field - Only show for Signup */}
              {!isLogin && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <label className="text-sm font-medium text-foreground ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-secondary/20 border border-border rounded-xl px-11 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all hover:bg-secondary/30"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">
                  Email address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    placeholder="name@codeunicorn.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-secondary/20 border border-border rounded-xl px-11 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all hover:bg-secondary/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  {isLogin && (
                    <a
                      href="#"
                      className="text-xs hover:text-primary text-emerald-400 transition-colors"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-secondary/20 border border-border rounded-xl px-11 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all hover:bg-secondary/30"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="text-xs text-muted-foreground px-1 animate-in fade-in duration-300">
                  By clicking create account, you agree to our{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  .
                </div>
              )}

              <button className="w-full bg-gradient-to-r from-emerald-600 via-primary to-teal-600 bg-[length:200%_auto] hover:bg-right text-primary-foreground font-bold py-3.5 rounded-xl transition-all duration-500 hover:shadow-[0_0_20px_-5px_var(--primary)] hover:scale-[1.01] active:scale-[0.98] mt-2 flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-primary/30">
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 hover:text-primary text-emerald-600 font-bold transition-colors hover:underline cursor-pointer"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
