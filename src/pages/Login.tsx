import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FormInput } from "@/components/ui/FormInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormCard } from "@/components/ui/FormCard";
import { Building2 } from "lucide-react";
import API from "@/services/api";

const Alert = {
  alert: (message: string) => window.alert(message),
};

const AUTH_KEY = "super_admin_authenticated";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !pin.trim()) {
      Alert.alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await API.post("/users/login", {
        phone: phone,
        pin: pin,
      });
      if (response.status == 200) {
        localStorage.setItem(AUTH_KEY, "true");
        toast.success("Welcome back!");
        const redirectPath = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/building";
        navigate(redirectPath, { replace: true });
      } else {
        Alert.alert("Login failed!");
      }
    } catch (err: any) {
      Alert.alert(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Nestiti
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Super Admin Portal
          </p>
        </div>

        <FormCard
          title="Sign In"
          description="Enter your credentials to continue"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormInput
              label="phone"
              type="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9706458970"
            />
            <FormInput
              label="Pin"
              type="password"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••••"
            />
            <SubmitButton
              type="submit"
              loading={loading}
              fullWidth
              className="mt-2"
            >
              Sign In
            </SubmitButton>
          </form>
        </FormCard>
      </div>
    </div>
  );
};

export default Login;
