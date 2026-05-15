import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ChevronRight,
  Info,
  ShieldCheck,
  AlertTriangle,
  FileDown,
} from "lucide-react";
import { useBulkUpload, useDownloadTemplate } from "@/lib/api-hooks";
import { toast } from "sonner";
import { cn, exportToCSV } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BulkUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "prepare" | "upload" | "processing" | "results";

export function BulkUploadDialog({ isOpen, onOpenChange }: BulkUploadDialogProps) {
  const [step, setStep] = useState<Step>("prepare");
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkUpload = useBulkUpload();
  const downloadTemplate = useDownloadTemplate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "xlsx" && extension !== "xls") {
      toast.error("Invalid file type. Please upload an Excel file (.xlsx or .xls)");
      return;
    }
    setFile(file);
    setStep("upload");
  };

  const startUpload = async () => {
    if (!file) return;
    setStep("processing");
    setProcessingProgress(10);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const result = await bulkUpload.mutateAsync(file);
      clearInterval(interval);
      setProcessingProgress(100);
      setUploadResult(result);

      setTimeout(() => {
        setStep("results");
      }, 500);

      if (result.success_count > 0) {
        toast.success(`Successfully uploaded ${result.success_count} products`);
      }
    } catch (error: any) {
      setStep("upload");
      toast.error(error.response?.data?.error || "Bulk upload failed");
    }
  };

  const reset = () => {
    setStep("prepare");
    setFile(null);
    setUploadResult(null);
    setProcessingProgress(0);
  };

  const handleDownloadErrors = () => {
    if (!uploadResult?.errors || uploadResult.errors.length === 0) return;

    const errorData = uploadResult.errors.map((err: any) => ({
      Row: err.row,
      Message: err.message,
      ...(err.data || {}),
    }));

    exportToCSV(errorData, `upload_errors_${new Date().getTime()}.csv`);
  };

  const handleDownloadSkipped = () => {
    if (!uploadResult?.skipped_details || uploadResult.skipped_details.length === 0) return;
    exportToCSV(uploadResult.skipped_details, `skipped_items_${new Date().getTime()}.csv`);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) setTimeout(reset, 300);
      }}
    >
      <DialogContent className="sm:max-w-4xl bg-[#0A0D14] border-white/10 text-white p-0 overflow-hidden">
        <DialogHeader className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
          <DialogTitle className="text-2xl font-display flex items-center gap-3">
            <FileSpreadsheet className="size-6 text-brass" />
            Bulk Product Import
          </DialogTitle>
          <DialogDescription className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
            Onboard your inventory catalog efficiently via Excel
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-[600px]">
          {step === "prepare" && (
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brass">
                    Getting Started
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        step: 1,
                        title: "Download Template",
                        desc: "Start with our pre-formatted Excel file containing 'Products' and 'Batches' sheets.",
                      },
                      {
                        step: 2,
                        title: "Populate Data",
                        desc: "Fill in product details. Use the 'Batches' sheet for specific expiry dates and quantities per SKU.",
                      },
                      {
                        step: 3,
                        title: "Upload & Review",
                        desc: "Drop your file here. We'll validate and skip duplicates.",
                      },
                    ].map((s) => (
                      <div
                        key={s.step}
                        className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-brass/20 transition-all"
                      >
                        <div className="size-8 rounded-full bg-brass/10 border border-brass/20 text-brass flex items-center justify-center font-bold text-xs shrink-0">
                          {s.step}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white mb-1">{s.title}</h4>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => downloadTemplate.mutate()}
                    disabled={downloadTemplate.isPending}
                    className="w-full h-12 rounded-xl bg-white/[0.05] border-white/10 text-white hover:bg-brass hover:text-navy transition-all gap-2 uppercase tracking-widest text-[10px] font-bold"
                  >
                    {downloadTemplate.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    Download Template (.xlsx)
                  </Button>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brass">
                    Field Reference
                  </h3>
                  <Tabs defaultValue="required" className="w-full">
                    <TabsList className="w-full bg-white/[0.05] border border-white/5 p-1 rounded-lg">
                      <TabsTrigger
                        value="required"
                        className="flex-1 text-[9px] uppercase tracking-widest data-[state=active]:bg-brass data-[state=active]:text-navy"
                      >
                        Required
                      </TabsTrigger>
                      <TabsTrigger
                        value="recommended"
                        className="flex-1 text-[9px] uppercase tracking-widest data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                      >
                        Recommended
                      </TabsTrigger>
                      <TabsTrigger
                        value="optional"
                        className="flex-1 text-[9px] uppercase tracking-widest data-[state=active]:bg-white/10"
                      >
                        Optional
                      </TabsTrigger>
                    </TabsList>
                    <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-xl p-4 min-h-[220px]">
                      <TabsContent value="required" className="space-y-3 m-0">
                        {["name", "cost_price", "selling_price", "least_unit"].map((f) => (
                          <div key={f} className="flex items-center justify-between">
                            <code className="text-rose-400 font-mono text-[11px] font-bold tracking-tight">
                              {f}
                            </code>
                            <span className="text-[9px] text-muted-foreground italic">
                              Mandatory
                            </span>
                          </div>
                        ))}
                        <p className="text-[9px] text-muted-foreground pt-4 leading-relaxed border-t border-white/5">
                          * Row will be skipped if these fields are missing or invalid.
                        </p>
                      </TabsContent>
                      <TabsContent value="recommended" className="space-y-3 m-0">
                        {["category", "brand", "supplier", "stock_quantity", "min_stock_level"].map(
                          (f) => (
                            <div key={f} className="flex items-center justify-between">
                              <code className="text-blue-400 font-mono text-[11px] font-bold tracking-tight">
                                {f}
                              </code>
                              <span className="text-[9px] text-muted-foreground italic">
                                Important
                              </span>
                            </div>
                          ),
                        )}
                        <p className="text-[9px] text-muted-foreground pt-4 leading-relaxed border-t border-white/5">
                          * Used for analytics, tracking, and low-stock alerts.
                        </p>
                      </TabsContent>
                      <TabsContent value="optional" className="space-y-3 m-0">
                        {["sku", "description", "bulk_unit", "tax_rate", "reorder_point"].map(
                          (f) => (
                            <div key={f} className="flex items-center justify-between">
                              <code className="text-slate-400 font-mono text-[11px] font-bold tracking-tight">
                                {f}
                              </code>
                              <span className="text-[9px] text-muted-foreground italic">
                                Secondary
                              </span>
                            </div>
                          ),
                        )}
                        <p className="text-[9px] text-muted-foreground pt-4 leading-relaxed border-t border-white/5">
                          * SKU will be auto-generated if left blank.
                        </p>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>
            </div>
          )}

          {step === "upload" && (
            <div className="flex-1 p-8 flex flex-col items-center justify-center">
              {!file ? (
                <div
                  className={cn(
                    "w-full h-[350px] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group",
                    dragActive
                      ? "bg-brass/10 border-brass shadow-2xl shadow-brass/5"
                      : "bg-white/[0.02] border-white/10 hover:border-brass/40",
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="size-20 rounded-full bg-brass/10 border border-brass/20 flex items-center justify-center text-brass group-hover:scale-110 transition-transform duration-500">
                    <Upload className="size-8" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-display text-white mb-1">Drag & Drop Excel File</h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                      or click to browse local files
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px]">
                      .XLSX
                    </Badge>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px]">
                      .XLS
                    </Badge>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px]">
                      MAX 10MB
                    </Badge>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept=".xlsx,.xls"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="w-full max-w-md space-y-6">
                  <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <FileSpreadsheet className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{file.name}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for ingestion
                      </p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="size-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all flex items-center justify-center"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3">
                    <Info className="size-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-200/70 leading-relaxed italic">
                      We will automatically check for duplicate SKUs and Names. Similar items will
                      be skipped to prevent data corruption.
                    </p>
                  </div>

                  <Button
                    onClick={startUpload}
                    className="w-full h-14 rounded-2xl bg-brass text-navy font-bold uppercase tracking-widest text-xs hover:bg-brass-light transition-all shadow-2xl shadow-brass/20 gap-3"
                  >
                    <ShieldCheck className="size-5" />
                    Begin Secure Ingestion
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "processing" && (
            <div className="flex-1 p-8 flex flex-col items-center justify-center gap-8">
              <div className="relative">
                <div className="size-32 rounded-full border-4 border-white/5 flex items-center justify-center">
                  <Loader2 className="size-12 text-brass animate-spin" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-display text-white">{processingProgress}%</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h4 className="text-xl font-display text-white">
                  {processingProgress < 40
                    ? "Validating Schema..."
                    : processingProgress < 80
                      ? "Ingesting Product Data..."
                      : "Finalizing Transaction..."}
                </h4>
                <p className="text-xs text-muted-foreground uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                  Please do not close this window while we securely sync your inventory.
                </p>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <Progress value={processingProgress} className="h-1.5 bg-white/5" />
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span className={cn(processingProgress >= 30 && "text-emerald-500")}>SCHEMA</span>
                  <span className={cn(processingProgress >= 60 && "text-emerald-500")}>DATA</span>
                  <span className={cn(processingProgress >= 90 && "text-emerald-500")}>COMMIT</span>
                </div>
              </div>
            </div>
          )}

          {step === "results" && (
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-in zoom-in duration-500">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display text-white">Import Process Complete</h3>
                    <p className="text-sm text-muted-foreground">
                      Detailed report for{" "}
                      <span className="text-white font-medium">{file?.name}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                    <div className="text-3xl font-display text-emerald-500 mb-1">
                      {uploadResult?.success_count || 0}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                      Success
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center">
                    <div className="text-3xl font-display text-amber-500 mb-1">
                      {uploadResult?.skipped_count || 0}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                      Skipped (Dupes)
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-center">
                    <div className="text-3xl font-display text-rose-500 mb-1">
                      {uploadResult?.error_count || 0}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                      Failures
                    </div>
                  </div>
                </div>

                {uploadResult?.skipped_count > 0 && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="size-4 text-amber-500" />
                      <p className="text-[11px] text-amber-200/80 leading-relaxed">
                        <span className="font-bold">{uploadResult.skipped_count} items</span> were
                        skipped because they already exist in your catalog.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadSkipped}
                      className="h-8 px-3 text-[9px] uppercase font-bold tracking-widest text-amber-500 hover:bg-amber-500/10"
                    >
                      Download List
                    </Button>
                  </div>
                )}

                {uploadResult?.error_count > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-rose-500 flex items-center gap-2">
                        <AlertCircle className="size-4" />
                        Failure Diagnostics
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadErrors}
                        className="h-9 px-4 rounded-lg bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all gap-2"
                      >
                        <FileDown className="size-3.5" />
                        Download Failure Sheet
                      </Button>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
                      <ScrollArea className="h-[200px]">
                        <Table>
                          <TableHeader className="bg-white/[0.02]">
                            <TableRow className="border-white/5 hover:bg-transparent">
                              <TableHead className="text-[9px] uppercase tracking-widest h-10 text-muted-foreground w-16">
                                Row
                              </TableHead>
                              <TableHead className="text-[9px] uppercase tracking-widest h-10 text-muted-foreground">
                                Description
                              </TableHead>
                              <TableHead className="text-[9px] uppercase tracking-widest h-10 text-muted-foreground text-right">
                                Diagnosis
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {uploadResult.errors.map((err: any, i: number) => (
                              <TableRow
                                key={i}
                                className="border-white/5 hover:bg-white/[0.02] transition-colors"
                              >
                                <TableCell className="py-3 text-[11px] font-mono text-muted-foreground">
                                  {err.row}
                                </TableCell>
                                <TableCell className="py-3 text-[11px] text-white font-medium">
                                  {err.data?.name || "N/A"}
                                </TableCell>
                                <TableCell className="py-3 text-right">
                                  <span className="text-[10px] text-rose-400/80 font-medium italic">
                                    {err.message}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-8 py-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="size-3.5 text-brass/60" />
            <span className="text-[9px] uppercase tracking-widest font-bold">
              Encrypted Ingestion Active
            </span>
          </div>
          <div className="flex gap-3">
            {step === "prepare" && (
              <Button
                onClick={() => setStep("upload")}
                className="h-10 px-6 rounded-lg bg-brass text-navy font-bold uppercase tracking-widest text-[10px] hover:bg-brass-light transition-all gap-2"
              >
                Next: Upload File
                <ChevronRight className="size-4" />
              </Button>
            )}
            {step === "upload" && file && (
              <Button
                onClick={reset}
                variant="ghost"
                className="h-10 px-6 text-muted-foreground hover:text-white text-[10px] font-bold uppercase tracking-widest"
              >
                Back
              </Button>
            )}
            {step === "results" && (
              <Button
                onClick={() => onOpenChange(false)}
                className="h-10 px-6 rounded-lg bg-brass text-navy font-bold uppercase tracking-widest text-[10px] hover:bg-brass-light transition-all"
              >
                Close Report
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
