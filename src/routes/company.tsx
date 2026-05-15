import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Settings2,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Plus,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { companyApi, Company, Branch } from "@/api/company";
import { integrationsApi, MpesaConfig, BankConfig, EtimsConfig } from "@/api/integrations";
import { toast } from "sonner";

export const Route = createFileRoute("/company")({
  component: CompanyPage,
});

function CompanyPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingFeatures, setIsEditingFeatures] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [mpesa, setMpesa] = useState<MpesaConfig | null>(null);
  const [etims, setEtims] = useState<EtimsConfig | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    console.log("[CompanyPage] Starting data fetch...");
    try {
      const [compRes, branchRes, mpesaRes, etimsRes] = await Promise.all([
        companyApi.getCompany(),
        companyApi.getBranches().catch((err) => {
          console.warn("[CompanyPage] Branches fetch failed:", err);
          return { data: [] };
        }),
        integrationsApi.getMpesaConfig().catch((err) => {
          console.warn("[CompanyPage] M-Pesa fetch failed:", err);
          return { data: [] };
        }),
        integrationsApi.getEtimsConfig().catch((err) => {
          console.warn("[CompanyPage] eTIMS fetch failed:", err);
          return { data: [] };
        }),
      ]);

      console.log("[CompanyPage] Company Data received:", compRes.data);
      setCompany(compRes.data);

      // Handle paginated branches
      const branchData = Array.isArray(branchRes.data)
        ? branchRes.data
        : (branchRes.data as any).results || [];
      setBranches(branchData);

      // Handle paginated M-Pesa config
      const mpesaData = Array.isArray(mpesaRes.data)
        ? mpesaRes.data
        : (mpesaRes.data as any).results || [];
      if (mpesaData.length > 0) setMpesa(mpesaData[0]);

      // Handle paginated eTIMS config
      const etimsData = Array.isArray(etimsRes.data)
        ? etimsRes.data
        : (etimsRes.data as any).results || [];
      if (etimsData.length > 0) setEtims(etimsData[0]);
    } catch (error) {
      console.error("[CompanyPage] Failed to fetch company data:", error);
      toast.error("Failed to load company information. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    try {
      await companyApi.updateCompany(company);
      toast.success("Company updated successfully");
      setIsEditingDetails(false);
      setIsEditingFeatures(false);
      fetchData(); // Refresh data
    } catch (error) {
      toast.error("Failed to update company");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl uppercase font-cinzel">
            Company Management
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Manage your business profile, branches, and system integrations in one central hub.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {company?.is_active ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1"
            >
              <AlertCircle className="w-3 h-3" /> Trial
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
        <TabsList className="flex w-fit bg-muted/50 p-1 rounded-xl h-12">
          <TabsTrigger
            value="overview"
            className="gap-2 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Building2 className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger
            value="branches"
            className="gap-2 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <MapPin className="w-4 h-4" /> Branches
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="gap-2 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Settings2 className="w-4 h-4" /> Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="shadow-lg border-muted/40">
            <CardHeader className="pb-8 border-b bg-muted/5 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl font-bold">Company Details</CardTitle>
                <CardDescription className="text-base">
                  Your primary business information used across receipts and reports.
                </CardDescription>
              </div>
              <Button
                variant={isEditingDetails ? "outline" : "default"}
                onClick={() => setIsEditingDetails(!isEditingDetails)}
                className="gap-2"
              >
                {isEditingDetails ? (
                  "Cancel"
                ) : (
                  <>
                    <Settings2 className="w-4 h-4" /> Edit Profile
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="pt-8 px-6 lg:px-10">
              {isEditingDetails ? (
                <form onSubmit={handleUpdateCompany} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Business Name</Label>
                      <Input
                        id="name"
                        value={company?.name || ""}
                        onChange={(e) =>
                          setCompany((c) => (c ? { ...c, name: e.target.value } : null))
                        }
                        placeholder="Enter business name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Official Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={company?.email || ""}
                        onChange={(e) =>
                          setCompany((c) => (c ? { ...c, email: e.target.value } : null))
                        }
                        placeholder="business@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax_id">KRA PIN / Tax ID</Label>
                      <Input
                        id="tax_id"
                        value={company?.tax_id || ""}
                        onChange={(e) =>
                          setCompany((c) => (c ? { ...c, tax_id: e.target.value } : null))
                        }
                        placeholder="P000..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={company?.phone_number || ""}
                        onChange={(e) =>
                          setCompany((c) => (c ? { ...c, phone_number: e.target.value } : null))
                        }
                        placeholder="+254..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Primary Address</Label>
                    <Input
                      id="address"
                      value={company?.primary_address || ""}
                      onChange={(e) =>
                        setCompany((c) => (c ? { ...c, primary_address: e.target.value } : null))
                      }
                      placeholder="Physical location"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="gap-2 px-8 shadow-md hover:shadow-lg transition-all"
                    >
                      <Save className="w-4 h-4" /> Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 py-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground font-medium uppercase text-xs tracking-wider">
                      Business Name
                    </Label>
                    <p className="text-xl font-semibold">{company?.name || "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground font-medium uppercase text-xs tracking-wider">
                      Official Email
                    </Label>
                    <p className="text-lg">{company?.email || "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground font-medium uppercase text-xs tracking-wider">
                      KRA PIN / Tax ID
                    </Label>
                    <p className="text-lg font-mono">{company?.tax_id || "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground font-medium uppercase text-xs tracking-wider">
                      Phone Number
                    </Label>
                    <p className="text-lg">{company?.phone_number || "Not set"}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-muted-foreground font-medium uppercase text-xs tracking-wider">
                      Primary Address
                    </Label>
                    <p className="text-lg">{company?.primary_address || "Not set"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-muted/40 overflow-hidden">
            <CardHeader className="pb-8 border-b bg-muted/5 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl font-bold">Modules & Features</CardTitle>
                <CardDescription className="text-base">
                  Toggle features on or off for your entire business ecosystem.
                </CardDescription>
              </div>
              <Button
                variant={isEditingFeatures ? "outline" : "default"}
                onClick={() => setIsEditingFeatures(!isEditingFeatures)}
                className="gap-2"
              >
                {isEditingFeatures ? (
                  "Done Editing"
                ) : (
                  <>
                    <Settings2 className="w-4 h-4" /> Edit Features
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="flex items-center justify-between p-6 lg:p-8 hover:bg-muted/5 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Label className="text-lg font-semibold">Restaurant Mode</Label>
                      {company?.enable_restaurant_mode && !isEditingFeatures && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enable table management, KDS, and dining sessions.
                    </p>
                  </div>
                  {isEditingFeatures ? (
                    <Switch
                      checked={company?.enable_restaurant_mode}
                      onCheckedChange={(val) => {
                        setCompany((c) => (c ? { ...c, enable_restaurant_mode: val } : null));
                        // Auto-save features on change if preferred, or wait for manual save
                      }}
                    />
                  ) : (
                    <div
                      className={
                        company?.enable_restaurant_mode ? "text-green-600" : "text-muted-foreground"
                      }
                    >
                      {company?.enable_restaurant_mode ? "Enabled" : "Disabled"}
                    </div>
                  )}
                </div>
                {/* Same logic for other switches */}
                <div className="flex items-center justify-between p-6 lg:p-8 hover:bg-muted/5 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Label className="text-lg font-semibold">Retail & POS</Label>
                      {company?.enable_retail_mode && !isEditingFeatures && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Standard shop checkout with barcode scanning.
                    </p>
                  </div>
                  {isEditingFeatures ? (
                    <Switch
                      checked={company?.enable_retail_mode}
                      onCheckedChange={(val) =>
                        setCompany((c) => (c ? { ...c, enable_retail_mode: val } : null))
                      }
                    />
                  ) : (
                    <div
                      className={
                        company?.enable_retail_mode ? "text-green-600" : "text-muted-foreground"
                      }
                    >
                      {company?.enable_retail_mode ? "Enabled" : "Disabled"}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-6 lg:p-8 hover:bg-muted/5 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Label className="text-lg font-semibold">HR Management</Label>
                      {company?.enable_hr_module && !isEditingFeatures && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Employee payroll, attendance, and leave tracking.
                    </p>
                  </div>
                  {isEditingFeatures ? (
                    <Switch
                      checked={company?.enable_hr_module}
                      onCheckedChange={(val) =>
                        setCompany((c) => (c ? { ...c, enable_hr_module: val } : null))
                      }
                    />
                  ) : (
                    <div
                      className={
                        company?.enable_hr_module ? "text-green-600" : "text-muted-foreground"
                      }
                    >
                      {company?.enable_hr_module ? "Enabled" : "Disabled"}
                    </div>
                  )}
                </div>
              </div>
              {isEditingFeatures && (
                <div className="p-6 bg-muted/5 border-t flex justify-end">
                  <Button onClick={handleUpdateCompany} className="gap-2">
                    <Save className="w-4 h-4" /> Save Feature Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Store Locations</h2>
            <Button size="lg" className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Add New Branch
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {branches.map((branch) => (
              <Card
                key={branch.id}
                className="overflow-hidden shadow-md hover:shadow-xl transition-shadow border-muted/40"
              >
                <CardHeader className="bg-muted/10 pb-6 border-b">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold">{branch.name}</CardTitle>
                    <Badge
                      variant={branch.is_active ? "default" : "secondary"}
                      className="rounded-full px-3"
                    >
                      {branch.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription className="font-mono text-xs uppercase tracking-wider">
                    {branch.branch_code}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="p-1.5 bg-muted rounded-full">
                      <MapPin className="w-4 h-4" />
                    </div>
                    {branch.city || "No location set"}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 h-11 border-primary/20 hover:bg-primary/5 transition-colors"
                  >
                    Manage Branch
                  </Button>
                </CardContent>
              </Card>
            ))}
            {branches.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl bg-muted/5">
                <MapPin className="w-16 h-16 mx-auto text-muted-foreground opacity-20" />
                <h3 className="mt-6 text-xl font-bold">No branches found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                  Expand your business by adding your first physical store location or distribution
                  center.
                </p>
                <Button variant="outline" className="mt-8 gap-2">
                  <Plus className="w-4 h-4" /> Initialize First Branch
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">External Integrations</h2>
            <p className="text-muted-foreground">
              Connect your ERP with payment gateways and regulatory authorities.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* M-Pesa Integration */}
            <Card className="border-t-4 border-t-green-600 shadow-lg border-muted/40">
              <CardHeader className="pb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-2xl">
                      <Smartphone className="w-8 h-8 text-green-700" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Lipa na M-Pesa</CardTitle>
                      <CardDescription>Daraja API C2B/STK Push Integration.</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={mpesa?.is_active}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-0 px-6 lg:px-8 pb-10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Shortcode</Label>
                    <Input
                      placeholder="Paybill or Till No"
                      value={mpesa?.shortcode || ""}
                      className="bg-muted/30 border-transparent focus:bg-background transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Environment</Label>
                    <div className="flex items-center gap-2 h-10 px-3 bg-muted/50 rounded-md border border-muted-foreground/10">
                      <Badge
                        variant={mpesa?.is_sandbox ? "outline" : "default"}
                        className={
                          mpesa?.is_sandbox ? "border-yellow-200 text-yellow-700" : "bg-green-600"
                        }
                      >
                        {mpesa?.is_sandbox ? "Sandbox" : "Production"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Consumer Key</Label>
                  <Input
                    type="password"
                    value={mpesa?.consumer_key || ""}
                    className="bg-muted/30 border-transparent focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Consumer Secret</Label>
                  <Input
                    type="password"
                    value={mpesa?.consumer_secret || ""}
                    className="bg-muted/30 border-transparent focus:bg-background transition-all"
                  />
                </div>
                <Button className="w-full h-11 bg-green-600 hover:bg-green-700 text-white shadow-md transition-all mt-4">
                  Update M-Pesa Config
                </Button>
              </CardContent>
            </Card>

            {/* eTIMS Integration */}
            <Card className="border-t-4 border-t-blue-600 shadow-lg border-muted/40">
              <CardHeader className="pb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                      <ShieldCheck className="w-8 h-8 text-blue-700" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">KRA eTIMS</CardTitle>
                      <CardDescription>Tax compliance and electronic invoicing.</CardDescription>
                    </div>
                  </div>
                  <Switch checked={etims?.is_active} className="data-[state=checked]:bg-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-0 px-6 lg:px-8 pb-10">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">KRA PIN</Label>
                  <Input
                    placeholder="P000..."
                    value={etims?.kra_pin || ""}
                    className="bg-muted/30 border-transparent focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Device Serial Number</Label>
                  <Input
                    value={etims?.serial_number || ""}
                    className="bg-muted/30 border-transparent focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">API Key</Label>
                  <Input
                    type="password"
                    value={etims?.api_key || ""}
                    className="bg-muted/30 border-transparent focus:bg-background transition-all"
                  />
                </div>
                <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all mt-4">
                  Verify & Save eTIMS
                </Button>
              </CardContent>
            </Card>

            {/* Bank Integration */}
            <Card className="border-t-4 border-t-indigo-600 shadow-lg border-muted/40">
              <CardHeader className="pb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                      <CreditCard className="w-8 h-8 text-indigo-700" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Bank & Card</CardTitle>
                      <CardDescription>
                        Gateway for direct card and bank processing.
                      </CardDescription>
                    </div>
                  </div>
                  <Switch defaultChecked={false} className="data-[state=checked]:bg-indigo-600" />
                </div>
              </CardHeader>
              <CardContent className="py-14 text-center px-10">
                <div className="p-4 bg-indigo-50/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-10 h-10 text-indigo-400" />
                </div>
                <p className="text-base text-muted-foreground max-w-xs mx-auto">
                  Connect your Equity, KCB, or Pesapal account to receive direct card payments.
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="mt-8 h-12 px-8 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                >
                  Add Bank Gateway
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
