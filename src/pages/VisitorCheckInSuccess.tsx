import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRIMARY_CLASS = "bg-[#1C98ED] hover:bg-[#1685d4] text-white";

const VisitorCheckInSuccess = () => {
  const [searchParams] = useSearchParams();
  const buildingId = searchParams.get("buildingId");

  const backHref = useMemo(() => {
    const q = new URLSearchParams();
    if (buildingId) q.set("buildingId", buildingId);
    const s = q.toString();
    return s ? `/visitor-check-in?${s}` : "/visitor-check-in";
  }, [buildingId]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center px-6 pt-12 pb-8 max-w-md mx-auto">
      <div className="mb-5 text-green-600">
        <CheckCircle2 className="w-[72px] h-[72px]" strokeWidth={1.25} />
      </div>
      <h1 className="text-[22px] font-bold text-[#0F172A] text-center mb-3">{"You're all checked in!"}</h1>
      <p className="text-[15px] text-[#64748B] text-center leading-relaxed mb-6">
        Your visit has been logged. Please follow society rules and respect residents&apos; privacy.
      </p>
      <div className="flex gap-2.5 w-full items-start rounded-xl border border-amber-300/50 bg-amber-400/15 p-3.5 mb-auto text-left">
        <ShieldAlert className="w-5 h-5 text-[#A16207] shrink-0 mt-0.5" />
        <p className="text-[13px] text-[#854D0E] leading-snug">
          Show this screen at the security desk if asked. You can close this page after leaving.
        </p>
      </div>
      <Button asChild className={`w-full mt-8 rounded-[14px] py-6 text-base font-semibold ${PRIMARY_CLASS}`}>
        <Link to={backHref} replace>
          Done
        </Link>
      </Button>
    </div>
  );
};

export default VisitorCheckInSuccess;
