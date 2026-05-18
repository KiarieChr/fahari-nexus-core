import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  CheckCircle2, 
  Clock,
  ArrowRight,
  Truck,
  Calendar,
  AlertCircle,
  Building2,
  Tag,
  Users,
  ChevronRight,
  ClipboardList,
  Trophy,
  Link2
} from "lucide-react";
import { useRFQs, useQuotations } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RFQCreationDialog } from "@/components/inventory/RFQCreationDialog";
import { QuotationAwardDialog } from "@/components/procurement/QuotationAwardDialog";

export const Route = createFileRoute("/procurement/rfq")({
  component: RFQManagementPage,
});

function RFQManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAwardOpen, setIsAwardOpen] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const { data: rfqData, isLoading } = useRFQs();
  const { data: quoteData } = useQuotations();

  const rfqs = Array.isArray(rfqData) ? rfqData : (rfqData?.results || []);
  const quotations = Array.isArray(quoteData) ? quoteData : (quoteData?.results || []);

  const handleAcceptBid = (quote: any) => {
    setSelectedQuote(quote);
    setIsAwardOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLOSED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'RECEIVED': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'SENT': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-[#0A0D14] min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-display tracking-tight text-white flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-brass/10 border border-brass/20 flex items-center justify-center text-brass">
               <FileText className="size-6" />
            </div>
            Sourcing Center
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-bold">
            Requests for Quotation & Supplier Bidding
          </p>
        </div>
        
        <Button 
          className="bg-brass text-navy font-bold uppercase tracking-widest text-[10px] h-11 px-6 hover:bg-brass-light transition-all shadow-lg shadow-brass/20"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="size-4 mr-2" />
          New RFQ Request
        </Button>
      </div>

      <RFQCreationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <QuotationAwardDialog 
        open={isAwardOpen} 
        onOpenChange={setIsAwardOpen} 
        quotations={selectedRFQ ? quotations.filter((q: any) => q.rfq === selectedRFQ.id) : []} 
        rfq={selectedRFQ} 
      />

      <div className="grid gap-6 md:grid-cols-4">
         {[
           { label: "Active RFQs", value: rfqs.filter((r:any) => r.status === 'SENT').length, icon: ClipboardList, color: "text-amber-500" },
           { label: "Quotes Received", value: quotations.length, icon: Building2, color: "text-blue-500" },
           { label: "Average Savings", value: "12.4%", icon: Tag, color: "text-emerald-500" },
           { label: "Suppliers Contacted", value: "8", icon: Users, color: "text-slate-500" },
         ].map((stat, i) => (
           <Card key={i} className="bg-white/[0.02] border-white/5 group hover:border-white/10 transition-all">
             <CardContent className="p-6 flex items-center gap-4">
                <div className={cn("size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5", stat.color)}>
                   <stat.icon className="size-5" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                   <h3 className="text-2xl font-display text-white">{stat.value}</h3>
                </div>
             </CardContent>
           </Card>
         ))}
      </div>

      <Tabs defaultValue="rfqs" className="space-y-6">
         <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
           <TabsTrigger value="rfqs" className="rounded-lg data-[state=active]:bg-brass data-[state=active]:text-navy text-[10px] uppercase font-bold tracking-widest px-6 py-2">
             Requests (RFQs)
           </TabsTrigger>
           <TabsTrigger value="quotes" className="rounded-lg data-[state=active]:bg-brass data-[state=active]:text-navy text-[10px] uppercase font-bold tracking-widest px-6 py-2">
             Supplier Bids
           </TabsTrigger>
         </TabsList>

         <TabsContent value="rfqs" className="space-y-6">
            <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
               <Table>
                  <TableHeader className="bg-white/[0.01]">
                     <TableRow className="border-white/5">
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest">RFQ #</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest">Deadline</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest">Volume</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest">Status</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-right">Actions</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i} className="border-white/5">
                             <TableCell colSpan={5}><Skeleton className="h-12 w-full bg-white/5" /></TableCell>
                          </TableRow>
                        ))
                     ) : rfqs.map((rfq: any) => (
                       <TableRow key={rfq.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                          <TableCell>
                             <div className="flex flex-col">
                                <span className="text-xs font-bold text-white uppercase tracking-tighter">#{rfq.rfq_number}</span>
                                <span className="text-[9px] text-muted-foreground uppercase font-bold mt-1">Created: {new Date(rfq.created_at).toLocaleDateString()}</span>
                             </div>
                          </TableCell>
                          <TableCell>
                             <div className="flex items-center gap-2 text-[10px] text-white font-medium">
                                <Clock className="size-3.5 text-amber-500" />
                                {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'N/A'}
                             </div>
                          </TableCell>
                          <TableCell>
                             <span className="text-xs font-bold text-white">{rfq.items?.length || 0} Line Items</span>
                          </TableCell>
                          <TableCell>
                             <Badge variant="outline" className={cn("text-[9px] font-bold px-2.5 py-0.5 rounded-full border-none uppercase tracking-widest", getStatusColor(rfq.status))}>
                                {rfq.status_display}
                             </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="h-8 group hover:bg-brass hover:text-navy transition-all px-4 text-[10px] uppercase font-bold tracking-widest"
                               onClick={() => {
                                 setSelectedRFQ(rfq);
                                 setIsAwardOpen(true);
                               }}
                             >
                                Manage <ChevronRight className="size-4 ml-2" />
                             </Button>
                          </TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         </TabsContent>

         <TabsContent value="quotes" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
               {quotations.map((quote: any) => (
                 <Card key={quote.id} className="bg-white/[0.02] border-white/5 overflow-hidden group hover:border-white/10 transition-all">
                    <CardHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-brass">Supplier Quote</p>
                             <h4 className="text-lg font-display text-white">{quote.supplier_name}</h4>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-bold uppercase">
                             {quote.status}
                          </Badge>
                       </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <p className="text-[9px] text-muted-foreground uppercase font-bold">Total Bid</p>
                             <p className="text-xl font-display text-white">${Number(quote.total_amount).toLocaleString()}</p>
                          </div>
                          <div className="space-y-1 text-right">
                             <p className="text-[9px] text-muted-foreground uppercase font-bold">Expires</p>
                             <p className="text-sm font-bold text-white">{quote.expiry_date || 'N/A'}</p>
                          </div>
                       </div>

                       <div className="space-y-3">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Offer Details</p>
                          {quote.items?.slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-[11px]">
                               <span className="text-muted-foreground">{item.product_name}</span>
                               <span className="text-white font-bold">${item.unit_cost}/unit</span>
                            </div>
                          ))}
                          {quote.items?.length > 3 && (
                            <p className="text-[9px] text-brass text-center font-bold uppercase tracking-tighter">+{quote.items.length - 3} more items</p>
                          )}
                       </div>
                    </CardContent>
                    <div className="p-4 bg-white/[0.02] border-t border-white/5 flex flex-col gap-2">
                       <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="flex-1 text-[9px] font-bold uppercase tracking-widest border border-white/10">
                             Decline
                          </Button>
                          <Button 
                           size="sm" 
                           className="flex-1 bg-brass text-navy text-[9px] font-bold uppercase tracking-widest hover:bg-brass-light"
                           onClick={() => handleAcceptBid(quote)}
                          >
                             Accept Bid
                          </Button>
                       </div>
                       {quote.public_token && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="w-full text-[9px] font-bold uppercase tracking-widest border border-dashed border-white/10 hover:border-brass hover:text-brass flex items-center justify-center gap-1.5"
                            onClick={() => {
                              const link = `${window.location.origin}/quote/${quote.public_token}`;
                              navigator.clipboard.writeText(link);
                              toast.success("Supplier bidding portal link copied to clipboard!");
                            }}
                          >
                             <Link2 className="size-3" /> Copy Portal Link
                          </Button>
                       )}
                    </div>
                 </Card>
               ))}
            </div>
         </TabsContent>
      </Tabs>
    </div>
  );
}
