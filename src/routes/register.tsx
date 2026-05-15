import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  User,
  Mail,
  Building2,
  Lock,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Sparkles,
  UserCircle,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useRegister } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    company_name: "",
    password: "",
    confirm_password: "",
  });

  const navigate = useNavigate();
  const registerMutation = useRegister();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match");
      return;
    }
    registerMutation.mutate(formData, {
      onSuccess: () => {
        setStep(4); // Success step
      },
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 size-[600px] bg-navy/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 size-[600px] bg-brass/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2" />

      <div className="w-full max-w-[500px] relative">
        {/* Progress Stepper */}
        {step < 4 && (
          <div className="mb-10 flex items-center justify-between px-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={cn(
                    "size-10 rounded-full flex items-center justify-center font-display text-sm font-bold transition-all duration-500 border-2",
                    step === s
                      ? "bg-navy-deep text-white border-navy-deep shadow-lg shadow-navy/20"
                      : step > s
                        ? "bg-brass text-navy-deep border-brass"
                        : "bg-white text-navy/30 border-[#e1e5ee]",
                  )}
                >
                  {step > s ? <CheckCircle2 className="size-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "h-0.5 w-16 md:w-24 rounded-full transition-all duration-500",
                      step > s ? "bg-brass" : "bg-[#e1e5ee]",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-navy/10 overflow-hidden flex flex-col transform transition-all duration-500 hover:shadow-navy/20 border border-white/20">
          {/* Card Header */}
          <div className="bg-navy-deep p-10 text-center space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="relative inline-flex items-center justify-center size-16 rounded-2xl bg-white/10 border border-white/20 text-white mb-2">
              {step === 1 && <UserCircle className="size-8" />}
              {step === 2 && <Briefcase className="size-8" />}
              {step === 3 && <ShieldCheck className="size-8" />}
              {step === 4 && <CheckCircle2 className="size-8" />}
            </div>
            <div className="relative">
              <h1 className="text-3xl font-display text-white tracking-tight">
                {step === 1 && "Personal Profile"}
                {step === 2 && "Business Identity"}
                {step === 3 && "Account Security"}
                {step === 4 && "Setup Complete"}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {step === 1 && "Tell us about yourself"}
                {step === 2 && "Let's set up your workspace"}
                {step === 3 && "Secure your dashboard"}
                {step === 4 && "Welcome to Fahari Nexus"}
              </p>
            </div>
          </div>

          <div className="p-10 pt-12">
            {step === 1 && (
              <div className="space-y-7 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <label className="text-[13px] font-semibold text-navy/70 px-1">
                      First Name
                    </label>
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full h-14 bg-white border-2 border-[#e1e5ee] rounded-2xl px-5 text-navy font-medium outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-navy/20"
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[13px] font-semibold text-navy/70 px-1">Last Name</label>
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full h-14 bg-white border-2 border-[#e1e5ee] rounded-2xl px-5 text-navy font-medium outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-navy/20"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[13px] font-semibold text-navy/70 px-1 flex items-center gap-2">
                    <User className="size-4 text-navy/40" /> Username
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full h-14 bg-white border-2 border-[#e1e5ee] rounded-2xl px-5 text-navy font-medium outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-navy/20"
                    placeholder="Choose a handle"
                  />
                </div>
                <button
                  onClick={nextStep}
                  disabled={!formData.username || !formData.first_name}
                  className="w-full h-16 bg-navy-deep text-white font-display font-bold tracking-widest rounded-2xl shadow-xl shadow-navy/20 hover:shadow-navy/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                >
                  CONTINUE
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="space-y-2.5">
                  <label className="text-[13px] font-semibold text-navy/70 px-1 flex items-center gap-2">
                    <Building2 className="size-4 text-navy/40" /> Business Name
                  </label>
                  <input
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="w-full h-14 bg-white border-2 border-[#e1e5ee] rounded-2xl px-5 text-navy font-medium outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-navy/20"
                    placeholder="Fahari Enterprises Ltd"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[13px] font-semibold text-navy/70 px-1 flex items-center gap-2">
                    <Mail className="size-4 text-navy/40" /> Official Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-14 bg-white border-2 border-[#e1e5ee] rounded-2xl px-5 text-navy font-medium outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-navy/20"
                    placeholder="hello@company.com"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 h-16 bg-white border-2 border-[#e1e5ee] text-navy font-display font-bold tracking-widest rounded-2xl hover:bg-[#f0f2f5] transition-all flex items-center justify-center gap-2 group"
                  >
                    <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    BACK
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!formData.company_name || !formData.email}
                    className="flex-[2] h-16 bg-navy-deep text-white font-display font-bold tracking-widest rounded-2xl shadow-xl shadow-navy/20 hover:shadow-navy/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                  >
                    CONTINUE
                    <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-7 animate-in fade-in slide-in-from-right-8 duration-500">
                <form onSubmit={handleSubmit} className="space-y-7">
                  <div className="space-y-2.5">
                    <label className="text-[13px] font-semibold text-navy/70 px-1 flex items-center gap-2">
                      <Lock className="size-4 text-navy/40" /> Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full h-14 bg-white border-2 border-[#e1e5ee] rounded-2xl px-5 text-navy font-medium outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-navy/20"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[13px] font-semibold text-navy/70 px-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className="w-full h-14 bg-white border-2 border-[#e1e5ee] rounded-2xl px-5 text-navy font-medium outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-navy/20"
                      placeholder="••••••••"
                    />
                  </div>

                  {registerMutation.isError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3 animate-shake">
                      <div className="size-2 rounded-full bg-red-500" />
                      <div className="flex-1">
                        {(registerMutation.error as any)?.response?.data?.error ||
                          (registerMutation.error as any)?.message ||
                          "Registration failed. Please try again."}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 h-16 bg-white border-2 border-[#e1e5ee] text-navy font-display font-bold tracking-widest rounded-2xl hover:bg-[#f0f2f5] transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="size-4" />
                      BACK
                    </button>
                    <button
                      type="submit"
                      disabled={registerMutation.isPending || !formData.password}
                      className="flex-[2] h-16 bg-navy-deep text-white font-display font-bold tracking-widest rounded-2xl shadow-xl shadow-navy/20 hover:shadow-navy/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <>
                          FINISH SETUP
                          <Sparkles className="size-5 group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 4 && (
              <div className="text-center space-y-10 py-6 animate-in zoom-in duration-500">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-navy/10 blur-3xl rounded-full scale-150" />
                  <div className="relative size-28 rounded-[2.5rem] bg-navy-deep flex items-center justify-center text-white shadow-2xl shadow-navy/30">
                    <CheckCircle2 className="size-12" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl font-display text-navy tracking-tight">
                    You're all set!
                  </h1>
                  <p className="text-navy/50 font-serif italic text-lg max-w-xs mx-auto leading-relaxed">
                    Welcome to the Fahari family. Your Business Operating System is ready.
                  </p>
                </div>

                <button
                  onClick={() => navigate({ to: "/login" })}
                  className="w-full h-18 bg-navy-deep text-white rounded-2xl font-display font-bold tracking-widest shadow-2xl shadow-navy/20 hover:shadow-navy/40 hover:-translate-y-1 transition-all"
                >
                  GO TO DASHBOARD
                </button>
              </div>
            )}
          </div>
        </div>

        {step < 4 && (
          <div className="mt-10 text-center">
            <Link
              to="/login"
              className="text-navy/50 hover:text-navy transition-colors font-medium text-sm"
            >
              Already have an account?{" "}
              <span className="font-bold underline underline-offset-4">Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
