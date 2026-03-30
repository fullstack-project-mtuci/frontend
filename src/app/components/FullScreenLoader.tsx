import { Loader2 } from "lucide-react";

export function FullScreenLoader({ label = "Loading workspace..." }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] text-[#0F172A]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white shadow flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        </div>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );
}
