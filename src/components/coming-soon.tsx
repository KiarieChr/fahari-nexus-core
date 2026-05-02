import { Sparkles } from "lucide-react";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 md:px-10 py-12 max-w-[1400px] mx-auto">
      <div className="rounded-xl border border-dashed border-brass/40 bg-card p-12 text-center">
        <div className="size-14 mx-auto rounded-full bg-brass/10 border border-brass/30 grid place-items-center text-brass mb-5">
          <Sparkles className="size-6" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-brass font-display mb-3">
          Coming Next
        </p>
        <h1 className="font-display text-3xl text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground italic font-serif max-w-md mx-auto">{description}</p>
      </div>
    </div>
  );
}