import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { useVerifyMagicLink } from "@/lib/api-hooks";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-link")({
  component: VerifyLinkPage,
});

function VerifyLinkPage() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/verify-link" }) as any;
  const verifyMutation = useVerifyMagicLink();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.token;
    const email = searchParams.email;

    if (token && email) {
      verifyMutation.mutate(
        { token, email },
        {
          onSuccess: () => {
            setStatus("success");
            toast.success("Magic link verified! Logging you in...");
            setTimeout(() => {
              navigate({ to: "/" });
            }, 2000);
          },
          onError: () => {
            setStatus("error");
            toast.error("Invalid or expired magic link.");
          },
        },
      );
    } else {
      setStatus("error");
    }
  }, [searchParams.token, searchParams.email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-6 font-inter">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-10 text-center space-y-6">
        <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-navy/5 text-navy mb-4">
          {status === "loading" && <Loader2 className="size-10 animate-spin" />}
          {status === "success" && <CheckCircle2 className="size-10 text-green-500" />}
          {status === "error" && <AlertCircle className="size-10 text-red-500" />}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display text-navy tracking-tight">
            {status === "loading" && "Verifying Link..."}
            {status === "success" && "Success!"}
            {status === "error" && "Verification Failed"}
          </h1>
          <p className="text-muted-foreground">
            {status === "loading" && "Please wait while we secure your session."}
            {status === "success" && "Your magic link has been verified. Redirecting..."}
            {status === "error" && "The link is invalid, expired, or has already been used."}
          </p>
        </div>

        {status === "error" && (
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full h-14 bg-navy-deep text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}
