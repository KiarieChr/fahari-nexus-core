import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Clock,
  Users,
  Loader2,
  LogIn,
  HelpCircle,
  UserPlus,
} from "lucide-react";
import { useLogin, useVerifyOTP, useMagicLink } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<any>(null);
  const [isMagicLinkMode, setIsMagicLinkMode] = useState(false);

  const navigate = useNavigate();
  const loginMutation = useLogin();
  const verifyMutation = useVerifyOTP();
  const magicLinkMutation = useMagicLink();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isMagicLinkMode) {
      magicLinkMutation.mutate(username, {
        onSuccess: () => {
          toast.success("Magic link sent! Check your email.");
        },
        onError: () => {
          toast.error("Failed to send magic link.");
        },
      });
      return;
    }

    if (show2FA) {
      verifyMutation.mutate(
        {
          user_id: twoFactorData.user_id,
          otp_code: otp,
        },
        {
          onSuccess: () => {
            toast.success("Login successful!");
            navigate({ to: "/" });
          },
        },
      );
    } else {
      loginMutation.mutate(
        { username, password },
        {
          onSuccess: (data) => {
            if (data.two_factor_required) {
              setTwoFactorData(data);
              setShow2FA(true);
              toast.info("Verification code sent to your email");
            } else {
              toast.success("Welcome back!");
              navigate({ to: "/" });
            }
          },
        },
      );
    }
  };

  const toggleMagicLink = () => {
    setIsMagicLinkMode(!isMagicLinkMode);
    setShow2FA(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#f0f2f5] overflow-hidden font-inter">
      {/* Left Side - Login Card */}
      <div className="flex items-center justify-center p-6 z-10 relative">
        <div className="w-full max-w-[420px] bg-white rounded-[2rem] shadow-2xl shadow-navy/10 overflow-hidden flex flex-col transform transition-all duration-500 hover:shadow-navy/20">
          {/* Card Header */}
          <div className="bg-navy-deep p-10 text-center space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="relative inline-flex items-center justify-center size-14 rounded-2xl bg-white/10 border border-white/20 text-white mb-2">
              <Lock className="size-7" />
            </div>
            <div className="relative">
              <h1 className="text-3xl font-display text-white tracking-tight">
                {show2FA ? "Security Check" : isMagicLinkMode ? "Magic Login" : "Welcome Back"}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {show2FA
                  ? "Enter the code sent to your email"
                  : isMagicLinkMode
                    ? "Get a login link via email"
                    : "Sign in to continue"}
              </p>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-10 pt-12 flex-1 flex flex-col">
            <form onSubmit={handleSubmit} className="space-y-7">
              {!show2FA ? (
                <>
                  {/* Username field */}
                  <div className="space-y-3">
                    <label className="text-[13px] font-semibold text-navy/70 flex items-center gap-2.5 px-1">
                      <User className="size-4 text-navy/40" />{" "}
                      {isMagicLinkMode ? "Email Address" : "User ID/Email"}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-navy/50 transition-colors">
                        <LogIn className="size-4 rotate-180" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-14 bg-white border-2 border-[#e1e5ee] rounded-2xl pl-12 pr-4 text-navy font-medium outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-navy/20 placeholder:font-normal"
                        placeholder={isMagicLinkMode ? "ENTER YOUR EMAIL" : "ENTER YOUR ID"}
                        required
                      />
                    </div>
                  </div>

                  {!isMagicLinkMode && (
                    <div className="space-y-3">
                      <label className="text-[13px] font-semibold text-navy/70 flex items-center gap-2.5 px-1">
                        <Lock className="size-4 text-navy/40" /> Password
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-navy/50 transition-colors">
                          <ShieldCheck className="size-4" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-14 bg-white border-2 border-[#e1e5ee] rounded-2xl pl-12 pr-12 text-navy font-medium outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-navy/20 placeholder:font-normal"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/20 hover:text-navy transition-colors p-1"
                        >
                          {showPassword ? (
                            <EyeOff className="size-5" />
                          ) : (
                            <Eye className="size-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* OTP Field */
                <div className="space-y-3">
                  <label className="text-[13px] font-semibold text-navy/70 flex items-center gap-2.5 px-1">
                    <Clock className="size-4 text-navy/40" /> 6-Digit Code
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-navy/50 transition-colors">
                      <ShieldCheck className="size-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full h-16 text-center text-3xl tracking-[1em] bg-white border-2 border-[#e1e5ee] rounded-2xl outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-navy/10 font-bold"
                      placeholder="000000"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-center text-muted-foreground mt-2">
                    Sent to:{" "}
                    <span className="font-semibold text-navy">{twoFactorData?.email_mask}</span>
                  </p>
                </div>
              )}

              {(loginMutation.isError || verifyMutation.isError) && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3 animate-shake">
                  <div className="size-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  {show2FA ? "Invalid OTP code." : "Invalid credentials."}
                </div>
              )}

              <div className="flex flex-col gap-5 pt-2">
                <button
                  type="submit"
                  disabled={
                    loginMutation.isPending ||
                    verifyMutation.isPending ||
                    magicLinkMutation.isPending
                  }
                  className="w-full h-16 bg-navy-deep text-white font-display font-bold tracking-widest rounded-2xl shadow-xl shadow-navy/20 hover:shadow-navy/40 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3 group"
                >
                  {loginMutation.isPending ||
                  verifyMutation.isPending ||
                  magicLinkMutation.isPending ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="size-5 group-hover:translate-x-1 transition-transform" />
                      {show2FA ? "VERIFY CODE" : isMagicLinkMode ? "SEND LINK" : "LOGIN"}
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-4 text-sm">
                  <button
                    type="button"
                    onClick={toggleMagicLink}
                    className="text-navy/50 hover:text-navy transition-colors flex items-center gap-2 font-medium group"
                  >
                    <HelpCircle className="size-4 group-hover:rotate-12 transition-transform" />
                    {isMagicLinkMode ? "Back to Password Login" : "Forgot password / Magic Login?"}
                  </button>
                  <Link
                    to="/register"
                    className="text-navy hover:text-navy-deep transition-colors flex items-center gap-2 font-bold group"
                  >
                    <UserPlus className="size-4 group-hover:scale-110 transition-transform" />{" "}
                    Create Account
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Features Branding */}
      <div className="hidden lg:flex flex-col justify-center p-20 bg-navy-deep relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-0 right-0 size-[600px] bg-brass/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 size-[600px] bg-white/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative space-y-16 max-w-2xl">
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="text-6xl font-display text-white tracking-tighter leading-none">
              Fahari <span className="text-brass-light">Nexus</span>
            </h2>
            <p className="text-xl text-white/50 font-serif italic max-w-lg leading-relaxed">
              Your Business Operating System
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: ShieldCheck, title: "Secure", desc: "Bank-level encryption" },
              { icon: Zap, title: "Fast", desc: "Lightning quick access" },
              { icon: Clock, title: "24/7 Available", desc: "Access anytime, anywhere" },
              { icon: Users, title: "Trusted", desc: "By thousands of users" },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm space-y-4 group hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 cursor-default"
              >
                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-navy-deep transition-all duration-500 shadow-xl shadow-black/20">
                  <feature.icon className="size-7" />
                </div>
                <div className="space-y-1 text-center">
                  <h3 className="text-white font-display text-lg tracking-wide">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed font-serif italic">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
