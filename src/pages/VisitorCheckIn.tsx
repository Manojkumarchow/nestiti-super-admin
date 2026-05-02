import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import API from "@/services/api";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PURPOSE_OPTIONS, type VisitorPurposeCode } from "@/constants/visitorCheckIn";
import { VISITOR_STORAGE_KEYS } from "@/constants/visitorStorage";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

const PRIMARY_CLASS = "bg-[#1C98ED] hover:bg-[#1685d4] text-white";

type BuildingSummary = {
  buildingId: number;
  buildingName: string;
};

const emptyBuildingOption = { value: "", label: "Select building" };
const emptyFlatOption = { value: "", label: "Select flat" };
const emptyPurposeOption = { value: "", label: "Select type of visit" };

const VisitorCheckIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeBuildingId = searchParams.get("buildingId") ?? "";
  const mode = searchParams.get("mode") ?? "guest";

  const [fullName, setFullName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [buildings, setBuildings] = useState<BuildingSummary[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState(true);
  const [buildingsError, setBuildingsError] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [flat, setFlat] = useState("");
  const [purpose, setPurpose] = useState<VisitorPurposeCode | "">("");
  const [notes, setNotes] = useState("");
  const [flats, setFlats] = useState<string[]>([]);
  const [flatsLoading, setFlatsLoading] = useState(false);
  const [flatsError, setFlatsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem(VISITOR_STORAGE_KEYS.LAST_NAME);
      const savedPhone = localStorage.getItem(VISITOR_STORAGE_KEYS.LAST_PHONE);
      if (savedName?.trim()) setFullName(savedName.trim());
      const p = savedPhone?.replace(/\D/g, "") ?? "";
      if (p.length === 10) setPhoneDigits(p);
    } catch {
      // non-blocking
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setBuildingsLoading(true);
      setBuildingsError(null);
      try {
        const res = await API.get<BuildingSummary[]>("/building/all");
        const rows = Array.isArray(res.data) ? res.data : [];
        if (!mounted) return;
        setBuildings(rows);
        if (rows.length === 0) {
          setSelectedBuildingId("");
          return;
        }
        if (routeBuildingId) {
          const matched = rows.find((item) => String(item.buildingId) === routeBuildingId);
          if (matched) {
            setSelectedBuildingId(String(matched.buildingId));
            return;
          }
        }
        if (rows.length === 1) {
          setSelectedBuildingId(String(rows[0].buildingId));
        }
      } catch (error) {
        if (!mounted) return;
        setBuildings([]);
        setSelectedBuildingId("");
        setBuildingsError(getApiErrorMessage(error, "Unable to load buildings."));
      } finally {
        if (mounted) setBuildingsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [routeBuildingId]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!selectedBuildingId) {
        setFlat("");
        setFlats([]);
        setFlatsError(null);
        setFlatsLoading(false);
        return;
      }
      setFlat("");
      setFlatsLoading(true);
      setFlatsError(null);
      try {
        const res = await API.get(`/residents/building/${selectedBuildingId}`);
        const rows = Array.isArray(res.data) ? res.data : [];
        const set = new Set<string>();
        rows.forEach((r: { flatNo?: string }) => {
          const f = String(r?.flatNo ?? "").trim();
          if (f) set.add(f);
        });
        const list = Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        if (!mounted) return;
        setFlats(list);
      } catch (e) {
        if (!mounted) return;
        setFlats([]);
        setFlatsError(getApiErrorMessage(e, "Unable to load flats."));
      } finally {
        if (mounted) setFlatsLoading(false);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [selectedBuildingId]);

  const selectedBuilding = useMemo(
    () => buildings.find((item) => String(item.buildingId) === selectedBuildingId) ?? null,
    [buildings, selectedBuildingId],
  );

  const phoneOk = useMemo(() => phoneDigits.replace(/\D/g, "").length === 10, [phoneDigits]);

  const onPhoneChange = (t: string) => {
    const d = t.replace(/\D/g, "").slice(0, 10);
    setPhoneDigits(d);
  };

  const buildingOptions = useMemo(
    () => [
      emptyBuildingOption,
      ...buildings.map((b) => ({ value: String(b.buildingId), label: b.buildingName })),
    ],
    [buildings],
  );

  const flatOptions = useMemo(() => {
    if (flatsLoading) return [{ value: "", label: "Loading flats…" }];
    if (flatsError) return [{ value: "", label: "Failed to load" }];
    return [emptyFlatOption, ...flats.map((f) => ({ value: f, label: f }))];
  }, [flats, flatsLoading, flatsError]);

  const purposeOptions = useMemo(
    () => [
      emptyPurposeOption,
      ...PURPOSE_OPTIONS.map((p) => ({ value: p.value, label: p.label })),
    ],
    [],
  );

  const submitDisabled =
    submitting ||
    buildingsLoading ||
    !selectedBuildingId ||
    flatsLoading ||
    !!flatsError ||
    flats.length === 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const name = fullName.trim();
    if (!name) {
      toast.error("Enter your full name");
      return;
    }
    if (!phoneOk) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (!selectedBuildingId) {
      toast.error("Select building");
      return;
    }
    if (!flat) {
      toast.error("Select the flat you are visiting");
      return;
    }
    if (!purpose) {
      toast.error("Select type of visit");
      return;
    }
    const digits = phoneDigits.replace(/\D/g, "");
    const visitorPhone = `+91${digits}`;
    try {
      setSubmitting(true);
      await API.post(`/visitors/building/${selectedBuildingId}`, {
        visitorName: name,
        visitorPhone,
        purpose,
        visitedFlatNo: flat,
        notes: notes.trim() || undefined,
      });
      try {
        localStorage.setItem(VISITOR_STORAGE_KEYS.LAST_NAME, name);
        localStorage.setItem(VISITOR_STORAGE_KEYS.LAST_PHONE, digits);
      } catch {
        // still navigate if persistence fails
      }
      const q = routeBuildingId ? `?buildingId=${encodeURIComponent(routeBuildingId)}` : "";
      navigate(`/visitor-check-in/success${q}`, { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not register visit. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-md mx-auto px-5 py-8 pb-12">
        <div className="flex items-center gap-2 text-[#0F172A] mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${PRIMARY_CLASS}`}>
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Check in</h1>
            <p className="text-sm text-muted-foreground">
              {mode === "register" ? "Register with us" : "Guest check-in"}
            </p>
          </div>
        </div>

        <p className="text-base font-semibold text-[#0F172A] mb-1">
          {buildingsLoading
            ? "Loading buildings…"
            : selectedBuilding
              ? `Building name: ${selectedBuilding.buildingName}`
              : "Select building below"}
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-6">
          <FormInput
            label="Full name"
            value={fullName}
            onChange={(ev) => setFullName(ev.target.value)}
            placeholder="As on ID"
            autoComplete="name"
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-foreground/80 ml-0.5">Phone</label>
            <div className="flex gap-2.5 items-stretch">
              <span className="flex items-center px-3 py-2 text-sm font-semibold border rounded-lg bg-muted/50 text-foreground shrink-0 border-input">
                +91
              </span>
              <input
                value={phoneDigits}
                onChange={(ev) => onPhoneChange(ev.target.value)}
                placeholder="10-digit mobile"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel-national"
                className="flex-1 px-3 py-2 bg-card border border-input rounded-lg outline-none text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <FormSelect
            label="Building"
            value={selectedBuildingId}
            onChange={(ev) => setSelectedBuildingId(ev.target.value)}
            disabled={buildingsLoading || buildings.length === 0}
            options={buildingOptions}
          />
          {buildingsError ? <p className="text-sm text-destructive">{buildingsError}</p> : null}

          <FormSelect
            label="Visiting flat"
            value={flat}
            onChange={(ev) => setFlat(ev.target.value)}
            disabled={!selectedBuildingId || flatsLoading || !!flatsError || flats.length === 0}
            options={flatOptions}
          />
          {flatsError ? <p className="text-sm text-destructive">{flatsError}</p> : null}

          <FormSelect
            label="Type of visit"
            value={purpose}
            onChange={(ev) => setPurpose(ev.target.value as VisitorPurposeCode | "")}
            options={purposeOptions}
          />

          <div className="flex flex-col gap-1.5 w-full">
            <Label className="text-sm font-medium text-foreground/80">Description (optional)</Label>
            <Textarea
              value={notes}
              onChange={(ev) => setNotes(ev.target.value)}
              placeholder="Vehicle no., package details…"
              className="resize-y min-h-[88px] bg-card"
            />
          </div>

          <SubmitButton
            type="submit"
            loading={submitting}
            disabled={submitDisabled}
            fullWidth
            className={`mt-2 ${PRIMARY_CLASS} disabled:opacity-55`}
          >
            Register visit
          </SubmitButton>
        </form>
      </div>
    </div>
  );
};

export default VisitorCheckIn;
