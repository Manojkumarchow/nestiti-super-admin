import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "@/services/api";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormCard } from "@/components/ui/FormCard";
import { SubmitButton } from "@/components/ui/SubmitButton";

const Alert = {
  alert: (message: string) => window.alert(message),
};

const cityOptions = [
  { value: "Hyderabad", label: "Hyderabad" },
  { value: "Khammam", label: "Khammam" },
];

interface ServiceContact {
  name: string;
  phone: string;
}

interface BuildingForm {
  buildingName: string;
  buildingAddress: {
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
    landmark: string;
    streetName: string;
  };
  floors: string;
  totalFlats: string;
  flatStartNumber: string;
  flatEndNumber: string;
  plumbingService: ServiceContact;
  electricService: ServiceContact;
  carpenterService: ServiceContact;
  cleaningService: ServiceContact;
  watchmen: ServiceContact;
  profileId: string;
  adminName: string;
  adminPhone: string;
  adminEmail: string;
  totalResidents: string;
  upiId: string;
  isWaterBillRequired: boolean;
}

const initialForm: BuildingForm = {
  buildingName: "",
  buildingAddress: {
    city: "Hyderabad",
    state: "",
    pincode: "",
    fullAddress: "",
    landmark: "",
    streetName: "",
  },
  floors: "",
  totalFlats: "",
  flatStartNumber: "",
  flatEndNumber: "",
  plumbingService: { name: "", phone: "" },
  electricService: { name: "", phone: "" },
  carpenterService: { name: "", phone: "" },
  cleaningService: { name: "", phone: "" },
  watchmen: { name: "", phone: "" },
  profileId: "",
  adminName: "",
  adminPhone: "",
  adminEmail: "",
  totalResidents: "",
  upiId: "",
  isWaterBillRequired: false,
};

const CreateBuilding = () => {
  const [form, setForm] = useState<BuildingForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateAddress = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      buildingAddress: { ...prev.buildingAddress, [field]: value },
    }));
    setErrors((prev) => ({ ...prev, [`address.${field}`]: "" }));
  };

  const updateService = (
    category: keyof BuildingForm,
    field: string,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [category]: { ...(prev[category] as ServiceContact), [field]: value },
    }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.buildingName.trim()) e.buildingName = "Building name is required";
    if (!form.buildingAddress.state.trim())
      e["address.state"] = "State is required";
    if (!form.buildingAddress.pincode.trim())
      e["address.pincode"] = "Pincode is required";
    if (!form.buildingAddress.fullAddress.trim())
      e["address.fullAddress"] = "Full address is required";
    if (!form.floors) e.floors = "Required";
    if (!form.totalFlats) e.totalFlats = "Required";
    if (!form.adminName.trim()) e.adminName = "Admin name is required";
    if (!form.adminPhone.trim()) e.adminPhone = "Admin phone is required";
    if (!form.adminEmail.trim()) e.adminEmail = "Admin email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail))
      e.adminEmail = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post("/building/create", form);
      toast.success("Building created successfully!");
      setForm(initialForm);
    } catch (err: any) {
      Alert.alert(err?.response?.data?.message || "Failed to create building");
    } finally {
      setLoading(false);
    }
  };

  const serviceFields: { key: keyof BuildingForm; label: string }[] = [
    { key: "plumbingService", label: "Plumbing" },
    { key: "electricService", label: "Electrical" },
    { key: "carpenterService", label: "Carpenter" },
    { key: "cleaningService", label: "Cleaning" },
    { key: "watchmen", label: "Watchmen" },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <header className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          Onboard New Building
        </h1>
        <p className="text-muted-foreground mt-1.5">
          Configure the core infrastructure and service contacts.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <FormCard title="General Information" className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FormInput
              label="Building Name"
              required
              value={form.buildingName}
              onChange={(e) => updateField("buildingName", e.target.value)}
              error={errors.buildingName}
            />
            <FormInput
              label="Total Floors"
              type="number"
              value={form.floors}
              onChange={(e) => updateField("floors", e.target.value)}
              error={errors.floors}
            />
            <FormInput
              label="Total Flats"
              type="number"
              value={form.totalFlats}
              onChange={(e) => updateField("totalFlats", e.target.value)}
              error={errors.totalFlats}
            />
            <FormInput
              label="Flat Start Number"
              type="number"
              value={form.flatStartNumber}
              onChange={(e) => updateField("flatStartNumber", e.target.value)}
            />
            <FormInput
              label="Flat End Number"
              type="number"
              value={form.flatEndNumber}
              onChange={(e) => updateField("flatEndNumber", e.target.value)}
            />
            <FormInput
              label="Total Residents"
              type="number"
              value={form.totalResidents}
              onChange={(e) => updateField("totalResidents", e.target.value)}
            />
          </div>
        </FormCard>

        <FormCard title="Address Details">
          <div className="flex flex-col gap-4">
            <FormSelect
              label="City"
              options={cityOptions}
              value={form.buildingAddress.city}
              onChange={(e) => updateAddress("city", e.target.value)}
            />
            <FormInput
              label="State"
              value={form.buildingAddress.state}
              onChange={(e) => updateAddress("state", e.target.value)}
              error={errors["address.state"]}
            />
            <FormInput
              label="Pincode"
              value={form.buildingAddress.pincode}
              onChange={(e) => updateAddress("pincode", e.target.value)}
              error={errors["address.pincode"]}
            />
            <FormInput
              label="Street Name"
              value={form.buildingAddress.streetName}
              onChange={(e) => updateAddress("streetName", e.target.value)}
            />
            <FormInput
              label="Landmark"
              value={form.buildingAddress.landmark}
              onChange={(e) => updateAddress("landmark", e.target.value)}
            />
            <FormInput
              label="Full Address"
              value={form.buildingAddress.fullAddress}
              onChange={(e) => updateAddress("fullAddress", e.target.value)}
              error={errors["address.fullAddress"]}
            />
          </div>
        </FormCard>

        <FormCard title="Admin & Billing">
          <div className="flex flex-col gap-4">
            <FormInput
              label="Profile ID"
              value={form.profileId}
              onChange={(e) => updateField("profileId", e.target.value)}
            />
            <FormInput
              label="Admin Name"
              required
              value={form.adminName}
              onChange={(e) => updateField("adminName", e.target.value)}
              error={errors.adminName}
            />
            <FormInput
              label="Admin Phone"
              value={form.adminPhone}
              onChange={(e) => updateField("adminPhone", e.target.value)}
              error={errors.adminPhone}
            />
            <FormInput
              label="Admin Email"
              type="email"
              value={form.adminEmail}
              onChange={(e) => updateField("adminEmail", e.target.value)}
              error={errors.adminEmail}
            />
            <FormInput
              label="UPI ID"
              value={form.upiId}
              onChange={(e) => updateField("upiId", e.target.value)}
              placeholder="name@upi"
            />
            <label className="flex items-center gap-2.5 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={form.isWaterBillRequired}
                onChange={(e) =>
                  updateField("isWaterBillRequired", e.target.checked)
                }
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20 cursor-pointer"
              />
              <span className="text-sm text-foreground/80">
                Water bill required
              </span>
            </label>
          </div>
        </FormCard>

        <FormCard title="Service Contacts" className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceFields.map(({ key, label }) => (
              <div
                key={key}
                className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/40 border border-border/50"
              >
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {label}
                </span>
                <FormInput
                  label="Name"
                  value={(form[key] as ServiceContact).name}
                  onChange={(e) => updateService(key, "name", e.target.value)}
                />
                <FormInput
                  label="Phone"
                  value={(form[key] as ServiceContact).phone}
                  onChange={(e) => updateService(key, "phone", e.target.value)}
                />
              </div>
            ))}
          </div>
        </FormCard>

        <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
          <SubmitButton
            variant="secondary"
            type="button"
            onClick={() => setForm(initialForm)}
          >
            Reset
          </SubmitButton>
          <SubmitButton type="submit" loading={loading}>
            Create Building
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default CreateBuilding;
