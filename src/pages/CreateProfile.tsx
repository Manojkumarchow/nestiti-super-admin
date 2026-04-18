import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "@/services/api";

const Alert = {
  alert: (message: string) => window.alert(message),
};
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormCard } from "@/components/ui/FormCard";
import { SubmitButton } from "@/components/ui/SubmitButton";

const roleOptions = [
  { value: "OWNER", label: "Owner" },
  { value: "USER", label: "Tenant" },
  { value: "ADMIN", label: "Admin" },
];

interface ProfileForm {
  name: string;
  phone: string;
  pin: string;
  role: string;
  flatNo: string;
  buildingId: string;
}

const initialForm: ProfileForm = {
  name: "",
  phone: "",
  pin: "",
  role: "OWNER",
  flatNo: "",
  buildingId: "",
};

const CreateProfile = () => {
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone))
      e.phone = "Enter valid 10-digit phone";
    if (!form.pin.trim()) e.pin = "PIN is required";
    else if (!/^\d{4}$/.test(form.pin)) e.pin = "PIN must be 4 digits";
    if (!form.flatNo.trim()) e.flatNo = "Flat number is required";
    if (!form.buildingId.trim()) e.buildingId = "Building ID is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post("/profile/create", form);
      toast.success("Profile created successfully!");
      setForm(initialForm);
      // navigate("/upload");
    } catch (err: any) {
      Alert.alert(err?.response?.data?.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <header className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          Create Profile
        </h1>
        <p className="text-muted-foreground mt-1.5">
          Register a new resident or owner for a building.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <FormCard title="Resident Information">
          <div className="flex flex-col gap-4">
            <FormInput
              label="Full Name"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              error={errors.name}
            />
            <FormInput
              label="Phone Number"
              maxLength={10}
              minLength={10}
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              error={errors.phone}
              placeholder="10-digit number"
            />
            <FormInput
              label="PIN"
              required
              type="password"
              value={form.pin}
              onChange={(e) => update("pin", e.target.value)}
              error={errors.pin}
              placeholder="4 digit PIN"
            />
            <FormSelect
              label="Role"
              options={roleOptions}
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Flat Number"
                required
                value={form.flatNo}
                onChange={(e) => update("flatNo", e.target.value)}
                error={errors.flatNo}
              />
              <FormInput
                label="Building ID"
                required
                value={form.buildingId}
                onChange={(e) => update("buildingId", e.target.value)}
                error={errors.buildingId}
              />
            </div>
          </div>
        </FormCard>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <SubmitButton
            variant="secondary"
            type="button"
            onClick={() => setForm(initialForm)}
          >
            Reset
          </SubmitButton>
          <SubmitButton type="submit" loading={loading}>
            Create Profile
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default CreateProfile;
