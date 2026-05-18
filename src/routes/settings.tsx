import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  User,
  Building2,
  Settings2,
  ShieldCheck,
  Bell,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Globe,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Utensils,
  Wine,
  Users,
  Zap,
  AlertCircle,
  Coins,
  History,
  TrendingUp,
  ExternalLink,
  Table as TableIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { 
  useUserProfile, 
  useUpdateProfile, 
  useCompany, 
  useUpdateCompany,
  useInventorySettings,
  useUpdateInventorySettings,
  useHRSettings,
  useUpdateHRSettings
} from "@/lib/api-hooks";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configuration — Fahari Nexus" },
      {
        name: "description",
        content: "Manage your account, business profile, and system preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

type TabType = "account" | "business" | "pos" | "crm" | "hr" | "security" | "notifications";

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: profile, isLoading: loadingProfile } = useUserProfile();
  const { data: company, isLoading: loadingCompany } = useCompany();

  const updateProfile = useUpdateProfile();
  const updateCompany = useUpdateCompany();
  const { data: invSettings, isLoading: loadingInvSettings } = useInventorySettings();
  const updateInvSettings = useUpdateInventorySettings();

  const { data: hrSettings, isLoading: loadingHRSettings } = useHRSettings();
  const updateHRSettings = useUpdateHRSettings();

  // Local state for forms
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    bio: "",
    enable_2fa: false,
    two_factor_method: "none",
  });

  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    primary_address: "",
    city: "",
    country: "",
    tax_id: "",
    enable_restaurant_mode: false,
    enable_bar_mode: false,
    enable_hr_module: false,
    enable_accommodation_module: false,
    tax_inclusive_pricing: false,
    require_manager_to_clear_cart: false,
    manager_pin: "0000",
    link_cash_register: false,
  });

  const [invForm, setInvForm] = useState({
    enable_loyalty_program: false,
    loyalty_points_per_unit: 100,
    loyalty_point_value: 1,
    min_points_to_redeem: 10,
  });

  const [hrForm, setHrForm] = useState({
    enable_leave_management: false,
    enable_shift_management: false,
    enable_payroll_management: false,
    enable_attendance_tracking: false,
    payroll_cycle: "monthly",
    kra_pin: "",
    nssf_code: "",
    nhif_code: "",
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name: profile.user?.first_name || "",
        last_name: profile.user?.last_name || "",
        email: profile.user?.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        enable_2fa: profile.enable_2fa || false,
        two_factor_method: profile.two_factor_method || "none",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || "",
        email: company.email || "",
        phone_number: company.phone_number || "",
        primary_address: company.primary_address || "",
        city: company.city || "",
        country: company.country || "",
        tax_id: company.tax_id || "",
        enable_restaurant_mode: company.enable_restaurant_mode || false,
        enable_bar_mode: company.enable_bar_mode || false,
        enable_hr_module: company.enable_hr_module || false,
        enable_accommodation_module: company.enable_accommodation_module || false,
        tax_inclusive_pricing: company.tax_inclusive_pricing || false,
        require_manager_to_clear_cart: company.require_manager_to_clear_cart || false,
        manager_pin: company.manager_pin || "0000",
        link_cash_register: company.link_cash_register || false,
      });
    }
  }, [company]);

  useEffect(() => {
    if (invSettings) {
      setInvForm({
        enable_loyalty_program: invSettings.enable_loyalty_program || false,
        loyalty_points_per_unit: invSettings.loyalty_points_per_unit || 100,
        loyalty_point_value: invSettings.loyalty_point_value || 1,
        min_points_to_redeem: invSettings.min_points_to_redeem || 10,
      });
    }
  }, [invSettings]);

  useEffect(() => {
    if (hrSettings) {
      setHrForm({
        enable_leave_management: hrSettings.enable_leave_management || false,
        enable_shift_management: hrSettings.enable_shift_management || false,
        enable_payroll_management: hrSettings.enable_payroll_management || false,
        enable_attendance_tracking: hrSettings.enable_attendance_tracking || false,
        payroll_cycle: hrSettings.payroll_cycle || "monthly",
        kra_pin: hrSettings.kra_pin || "",
        nssf_code: hrSettings.nssf_code || "",
        nhif_code: hrSettings.nhif_code || "",
      });
    }
  }, [hrSettings]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(profileForm);
      showSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to update profile");
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const handleInvSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateInvSettings.mutateAsync(invForm);
      showSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to update inventory settings");
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const handleHRSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateHRSettings.mutateAsync(hrForm);
      showSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to update HR settings");
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create a payload based on the active tab to avoid validation errors on unrelated fields
      const payload =
        activeTab === "pos"
          ? {
              enable_restaurant_mode: companyForm.enable_restaurant_mode,
              enable_bar_mode: companyForm.enable_bar_mode,
              enable_hr_module: companyForm.enable_hr_module,
              enable_accommodation_module: companyForm.enable_accommodation_module,
              tax_inclusive_pricing: companyForm.tax_inclusive_pricing,
              require_manager_to_clear_cart: companyForm.require_manager_to_clear_cart,
              manager_pin: companyForm.manager_pin,
              link_cash_register: companyForm.link_cash_register,
            }
          : {
              name: companyForm.name,
              email: companyForm.email,
              phone_number: companyForm.phone_number,
              primary_address: companyForm.primary_address,
              tax_id: companyForm.tax_id,
              city: companyForm.city,
              country: companyForm.country,
            };

      await updateCompany.mutateAsync(payload);
      showSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to update company info");
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const showSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const isLoading = loadingProfile || loadingCompany || loadingHRSettings;

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl text-foreground tracking-tight flex items-center gap-3">
          <Settings2 className="size-8 text-brass" />
          System Configuration
        </h1>
        <p className="text-muted-foreground mt-2 text-sm italic font-serif">
          Tailor your experience and manage business credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        {/* Sidebar Nav */}
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "account"
                ? "bg-brass/10 text-brass border border-brass/20 shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <User className="size-4" />
            Account Profile
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "business"
                ? "bg-brass/10 text-brass border border-brass/20 shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Building2 className="size-4" />
            Business Info
          </button>
          <button
            onClick={() => setActiveTab("pos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "pos"
                ? "bg-brass/10 text-brass border border-brass/20 shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Settings2 className="size-4" />
            POS Configuration
          </button>
          <button
            onClick={() => setActiveTab("crm")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "crm"
                ? "bg-brass/10 text-brass border border-brass/20 shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Users className="size-4" />
            CRM & Loyalty
          </button>
          <button
            onClick={() => setActiveTab("hr")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "hr"
                ? "bg-brass/10 text-brass border border-brass/20 shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Coins className="size-4" />
            HR & Payroll Config
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "security"
                ? "bg-brass/10 text-brass border border-brass/20 shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ShieldCheck className="size-4" />
            Security & Auth
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "notifications"
                ? "bg-brass/10 text-brass border border-brass/20 shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Bell className="size-4" />
            Notifications
          </button>
        </nav>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Status Message */}
          {isSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 className="size-5" />
              <p className="text-sm font-medium">Settings saved successfully!</p>
            </div>
          )}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <XCircle className="size-5" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-muted-foreground border border-dashed border-border rounded-2xl">
              <Loader2 className="size-10 animate-spin text-brass" />
              <p className="font-serif italic">Retrieving configuration...</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeTab === "account" && (
                <form onSubmit={handleProfileSubmit}>
                  <div className="p-8 border-b border-border bg-muted/20">
                    <h2 className="text-xl font-display text-foreground">Personal Profile</h2>
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">
                      Your account identity
                    </p>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          First Name
                        </label>
                        <input
                          value={profileForm.first_name}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, first_name: e.target.value })
                          }
                          className="w-full h-11 px-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Last Name
                        </label>
                        <input
                          value={profileForm.last_name}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, last_name: e.target.value })
                          }
                          className="w-full h-11 px-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          readOnly
                          value={profileForm.email}
                          className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/10 border border-border text-sm text-muted-foreground cursor-not-allowed italic"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Email is linked to your authentication provider
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value })
                          }
                          placeholder="+254..."
                          className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Short Bio
                      </label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        rows={3}
                        className="w-full p-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                  <div className="p-8 bg-muted/10 border-t border-border flex justify-end">
                    <button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="h-11 px-6 rounded-lg bg-navy text-brass-light font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-navy/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {updateProfile.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "business" && (
                <form onSubmit={handleCompanySubmit}>
                  <div className="p-8 border-b border-border bg-muted/20">
                    <h2 className="text-xl font-display text-foreground">Business Profile</h2>
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">
                      Company details & billing
                    </p>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          value={companyForm.name}
                          onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                          className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Business Email
                        </label>
                        <input
                          value={companyForm.email}
                          onChange={(e) =>
                            setCompanyForm({ ...companyForm, email: e.target.value })
                          }
                          className="w-full h-11 px-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Business Phone
                        </label>
                        <input
                          value={companyForm.phone_number}
                          onChange={(e) =>
                            setCompanyForm({ ...companyForm, phone_number: e.target.value })
                          }
                          className="w-full h-11 px-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Tax Identification (TIN/PIN)
                      </label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          value={companyForm.tax_id}
                          onChange={(e) =>
                            setCompanyForm({ ...companyForm, tax_id: e.target.value })
                          }
                          className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all uppercase"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Street Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <input
                            value={companyForm.primary_address}
                            onChange={(e) =>
                              setCompanyForm({ ...companyForm, primary_address: e.target.value })
                            }
                            className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          City
                        </label>
                        <input
                          value={companyForm.city}
                          onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-8 bg-muted/10 border-t border-border flex justify-end">
                    <button
                      type="submit"
                      disabled={updateCompany.isPending}
                      className="h-11 px-6 rounded-lg bg-navy text-brass-light font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-navy/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {updateCompany.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Update Business
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "pos" && (
                <form onSubmit={handleCompanySubmit}>
                  <div className="p-8 border-b border-border bg-muted/20">
                    <h2 className="text-xl font-display text-foreground">POS Terminal Settings</h2>
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">
                      Toggle specialized POS features
                    </p>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between p-6 rounded-2xl border border-border bg-muted/10 hover:border-brass/30 transition-all">
                      <div className="flex gap-4">
                        <div className="size-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                          <Utensils className="size-6 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            Restaurant / Kitchen Section
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enable specialized ordering for tables, kitchen tickets, and food
                            categories.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCompanyForm({
                            ...companyForm,
                            enable_restaurant_mode: !companyForm.enable_restaurant_mode,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          companyForm.enable_restaurant_mode ? "bg-brass" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            companyForm.enable_restaurant_mode ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-2xl border border-border bg-muted/10 hover:border-brass/30 transition-all">
                      <div className="flex gap-4">
                        <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                          <Wine className="size-6 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            Bar / Drinks Section
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enable specialized drink categories and bar-focused sales terminal.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCompanyForm({
                            ...companyForm,
                            enable_bar_mode: !companyForm.enable_bar_mode,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          companyForm.enable_bar_mode ? "bg-brass" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            companyForm.enable_bar_mode ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-2xl border border-border bg-muted/10 hover:border-brass/30 transition-all">
                      <div className="flex gap-4">
                        <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <Users className="size-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            HR Management Module
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enable employee records, payroll, leave management, and performance
                            tracking.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCompanyForm({
                            ...companyForm,
                            enable_hr_module: !companyForm.enable_hr_module,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          companyForm.enable_hr_module ? "bg-brass" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            companyForm.enable_hr_module ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-2xl border border-border bg-muted/10 hover:border-brass/30 transition-all">
                      <div className="flex gap-4">
                        <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <Building2 className="size-6 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            Accommodation & Booking
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enable room management, guest bookings, floor plans, and housekeeping
                            status.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCompanyForm({
                            ...companyForm,
                            enable_accommodation_module: !companyForm.enable_accommodation_module,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          companyForm.enable_accommodation_module
                            ? "bg-brass"
                            : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            companyForm.enable_accommodation_module
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="border-t border-border pt-8 mt-8">
                      <div className="flex items-center gap-2 mb-6">
                        <TableIcon className="size-5 text-brass" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-brass">Terminal Settings</h3>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 rounded-2xl border border-border bg-muted/10 hover:border-brass/30 transition-all">
                          <div>
                            <h4 className="text-sm font-bold text-foreground">Tax-Inclusive Pricing</h4>
                            <p className="text-xs text-muted-foreground mt-1">Prices shown include VAT (16%)</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setCompanyForm({
                                ...companyForm,
                                tax_inclusive_pricing: !companyForm.tax_inclusive_pricing,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              companyForm.tax_inclusive_pricing ? "bg-brass" : "bg-muted-foreground/30"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                companyForm.tax_inclusive_pricing ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-6 rounded-2xl border border-border bg-muted/10 hover:border-brass/30 transition-all">
                          <div>
                            <h4 className="text-sm font-bold text-foreground">Require Manager PIN to Clear Cart</h4>
                            <p className="text-xs text-muted-foreground mt-1">Locks the sales basket; requires override to empty</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setCompanyForm({
                                ...companyForm,
                                require_manager_to_clear_cart: !companyForm.require_manager_to_clear_cart,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              companyForm.require_manager_to_clear_cart ? "bg-brass" : "bg-muted-foreground/30"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                companyForm.require_manager_to_clear_cart ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {companyForm.require_manager_to_clear_cart && (
                          <div className="flex items-center justify-between p-6 rounded-2xl border border-border bg-muted/10 hover:border-brass/30 transition-all animate-in slide-in-from-top-2 duration-200">
                            <div>
                              <h4 className="text-sm font-bold text-foreground">Manager Override PIN</h4>
                              <p className="text-xs text-muted-foreground mt-1">4-digit security code for clear overrides</p>
                            </div>
                            <input
                              type="text"
                              maxLength={4}
                              pattern="\d{4}"
                              value={companyForm.manager_pin}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                  setCompanyForm({ ...companyForm, manager_pin: val });
                                }
                              }}
                              className="w-20 h-10 px-3 text-center text-sm font-bold tracking-widest rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-brass/20 text-foreground"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between p-6 rounded-2xl border border-border bg-muted/10 hover:border-brass/30 transition-all">
                          <div>
                            <h4 className="text-sm font-bold text-foreground">Link POS Cash Payments to Register Drawer</h4>
                            <p className="text-xs text-muted-foreground mt-1">Opens the cash drawer automatically on completion</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setCompanyForm({
                                ...companyForm,
                                link_cash_register: !companyForm.link_cash_register,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              companyForm.link_cash_register ? "bg-brass" : "bg-muted-foreground/30"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                companyForm.link_cash_register ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 bg-muted/10 border-t border-border flex justify-end">
                    <button
                      type="submit"
                      disabled={updateCompany.isPending}
                      className="h-11 px-6 rounded-lg bg-navy text-brass-light font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-navy/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {updateCompany.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Save POS Config
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "crm" && (
                <form onSubmit={handleInvSettingsSubmit}>
                  <div className="p-8 border-b border-border bg-muted/20">
                    <h2 className="text-xl font-display text-foreground">CRM & Loyalty Program</h2>
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">
                      Manage customer engagement and rewards
                    </p>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between p-6 rounded-2xl border border-border bg-muted/10 hover:border-brass/30 transition-all">
                      <div className="flex gap-4">
                        <div className="size-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                          <Coins className="size-6 text-amber-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            Loyalty Points Program
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Reward customers with points for every purchase that can be redeemed for discounts.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setInvForm({
                            ...invForm,
                            enable_loyalty_program: !invForm.enable_loyalty_program,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          invForm.enable_loyalty_program ? "bg-brass" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            invForm.enable_loyalty_program ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {invForm.enable_loyalty_program && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-4">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Earning Rate
                          </label>
                          <div className="relative">
                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                              type="number"
                              value={invForm.loyalty_points_per_unit}
                              onChange={(e) => setInvForm({ ...invForm, loyalty_points_per_unit: Number(e.target.value) })}
                              className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all"
                              placeholder="100"
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground italic">
                            Amount spent to earn 1 point (e.g. 100 KES = 1 Point)
                          </p>
                        </div>

                        <div className="space-y-4">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Redemption Value
                          </label>
                          <div className="relative">
                            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                              type="number"
                              value={invForm.loyalty_point_value}
                              onChange={(e) => setInvForm({ ...invForm, loyalty_point_value: Number(e.target.value) })}
                              className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all"
                              placeholder="1"
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground italic">
                            Monetary value of 1 point during checkout
                          </p>
                        </div>

                        <div className="space-y-4">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Min Points to Redeem
                          </label>
                          <div className="relative">
                            <History className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                              type="number"
                              value={invForm.min_points_to_redeem}
                              onChange={(e) => setInvForm({ ...invForm, min_points_to_redeem: Number(e.target.value) })}
                              className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all"
                              placeholder="10"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-8 bg-muted/10 border-t border-border flex justify-end">
                    <button
                      type="submit"
                      disabled={updateInvSettings.isPending}
                      className="h-11 px-6 rounded-lg bg-navy text-brass-light font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-navy/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {updateInvSettings.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Save CRM Config
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "hr" && (
                <form onSubmit={handleHRSettingsSubmit}>
                  <div className="p-8 border-b border-border bg-muted/20">
                    <h2 className="text-xl font-display text-foreground">HR & Payroll Configuration</h2>
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">
                      Configure dynamic payroll cycles, statutory compliance, and sub-module activation
                    </p>
                  </div>
                  <div className="p-8 space-y-6">
                    <h3 className="font-serif text-lg text-brass border-b border-border/40 pb-2">Sub-Module Activation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/5 hover:border-brass/35 transition-all">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">Leave Management</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Track employee paid & unpaid leaves</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHrForm({ ...hrForm, enable_leave_management: !hrForm.enable_leave_management })}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            hrForm.enable_leave_management ? "bg-brass" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                            hrForm.enable_leave_management ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/5 hover:border-brass/35 transition-all">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">Shift Schedules</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Assign shifts & working hour calendars</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHrForm({ ...hrForm, enable_shift_management: !hrForm.enable_shift_management })}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            hrForm.enable_shift_management ? "bg-brass" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                            hrForm.enable_shift_management ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/5 hover:border-brass/35 transition-all">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">Payroll Processing</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Process salaries, statutory deductions & slips</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHrForm({ ...hrForm, enable_payroll_management: !hrForm.enable_payroll_management })}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            hrForm.enable_payroll_management ? "bg-brass" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                            hrForm.enable_payroll_management ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/5 hover:border-brass/35 transition-all">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">Attendance & Clock In</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Enable smart clock-in controls and timers</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHrForm({ ...hrForm, enable_attendance_tracking: !hrForm.enable_attendance_tracking })}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            hrForm.enable_attendance_tracking ? "bg-brass" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                            hrForm.enable_attendance_tracking ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-serif text-lg text-brass border-b border-border/40 pb-2 mt-8">Statutory Registrations & Cycles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">KRA Tax ID / PIN</label>
                        <input
                          value={hrForm.kra_pin}
                          onChange={(e) => setHrForm({ ...hrForm, kra_pin: e.target.value })}
                          placeholder="e.g. P051234567A"
                          className="w-full h-11 px-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all uppercase font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">NSSF Code</label>
                        <input
                          value={hrForm.nssf_code}
                          onChange={(e) => setHrForm({ ...hrForm, nssf_code: e.target.value })}
                          placeholder="e.g. 1009923"
                          className="w-full h-11 px-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">NHIF / SHIF Code</label>
                        <input
                          value={hrForm.nhif_code}
                          onChange={(e) => setHrForm({ ...hrForm, nhif_code: e.target.value })}
                          placeholder="e.g. SHIF-88329"
                          className="w-full h-11 px-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payroll Cycle</label>
                        <select
                          value={hrForm.payroll_cycle}
                          onChange={(e) => setHrForm({ ...hrForm, payroll_cycle: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg bg-muted/40 border border-border text-sm focus:border-brass/60 outline-none transition-all font-mono"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-muted/10 border-t border-border flex justify-end">
                    <button
                      type="submit"
                      disabled={updateHRSettings.isPending}
                      className="h-11 px-6 rounded-lg bg-navy text-brass-light font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-navy/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {updateHRSettings.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Save HR Configurations
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "security" && (
                <form onSubmit={handleProfileSubmit}>
                  <div className="p-8 border-b border-border bg-muted/20">
                    <h2 className="text-xl font-display text-foreground">Security & Access Control</h2>
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">
                      Manage authentication, users, and roles
                    </p>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Link to="/settings/users" className="flex items-center justify-between p-6 rounded-2xl border border-border bg-muted/10 hover:border-brass/50 hover:bg-muted/30 transition-all group">
                        <div className="flex gap-4 items-center">
                          <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Users className="size-6 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground">User Management</h3>
                            <p className="text-xs text-muted-foreground mt-1">Add, remove, and manage system users</p>
                          </div>
                        </div>
                        <ExternalLink className="size-5 text-muted-foreground group-hover:text-brass transition-colors" />
                      </Link>

                      <Link to="/settings/roles" className="flex items-center justify-between p-6 rounded-2xl border border-border bg-muted/10 hover:border-brass/50 hover:bg-muted/30 transition-all group">
                        <div className="flex gap-4 items-center">
                          <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <ShieldCheck className="size-6 text-purple-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground">Roles & Permissions</h3>
                            <p className="text-xs text-muted-foreground mt-1">Configure access control rules</p>
                          </div>
                        </div>
                        <ExternalLink className="size-5 text-muted-foreground group-hover:text-brass transition-colors" />
                      </Link>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-2xl border border-border bg-muted/10 hover:border-brass/30 transition-all">
                      <div className="flex gap-4">
                        <div className="size-12 rounded-xl bg-brass/10 flex items-center justify-center border border-brass/20">
                          <ShieldCheck className="size-6 text-brass" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            Two-Factor Authentication (2FA)
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Add an extra layer of security to your account.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setProfileForm({ ...profileForm, enable_2fa: !profileForm.enable_2fa })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          profileForm.enable_2fa ? "bg-brass" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            profileForm.enable_2fa ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {profileForm.enable_2fa && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                          Verification Method
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              setProfileForm({ ...profileForm, two_factor_method: "email" })
                            }
                            className={`p-4 rounded-xl border text-left transition-all ${
                              profileForm.two_factor_method === "email"
                                ? "bg-brass/5 border-brass shadow-sm"
                                : "bg-background border-border hover:border-brass/30"
                            }`}
                          >
                            <Mail
                              className={`size-5 mb-2 ${profileForm.two_factor_method === "email" ? "text-brass" : "text-muted-foreground"}`}
                            />
                            <p className="text-sm font-bold">Email Code</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Receive a 6-digit code via email on every login.
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setProfileForm({ ...profileForm, two_factor_method: "app" })
                            }
                            className={`p-4 rounded-xl border text-left transition-all ${
                              profileForm.two_factor_method === "app"
                                ? "bg-brass/5 border-brass shadow-sm"
                                : "bg-background border-border hover:border-brass/30"
                            }`}
                          >
                            <Zap
                              className={`size-5 mb-2 ${profileForm.two_factor_method === "app" ? "text-brass" : "text-muted-foreground"}`}
                            />
                            <p className="text-sm font-bold">Authenticator App</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Use apps like Google Authenticator or Authy.
                            </p>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="p-6 rounded-2xl bg-muted/5 border border-dashed border-border">
                      <p className="text-xs text-muted-foreground leading-relaxed italic font-serif">
                        <AlertCircle className="size-3 inline mr-1 mb-0.5" />
                        When 2FA is enabled, you will be required to provide a verification code
                        even if you have your password. Magic links will also require 2FA
                        verification if enabled.
                      </p>
                    </div>
                  </div>
                  <div className="p-8 bg-muted/10 border-t border-border flex justify-end">
                    <button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="h-11 px-6 rounded-lg bg-navy text-brass-light font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-navy/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {updateProfile.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Update Security
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "notifications" && (
                <div className="p-8 py-20 text-center">
                  <Bell className="size-16 text-brass mx-auto mb-6 opacity-20" />
                  <h2 className="font-display text-xl text-foreground">Notification Preferences</h2>
                  <p className="text-sm text-muted-foreground mt-2 max-w-[400px] mx-auto italic font-serif">
                    Configure SMS and Email alerts for low stock levels and successful sales.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
