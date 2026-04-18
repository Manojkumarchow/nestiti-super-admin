import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminPortalApi } from "@/services/adminPortalApi";
import { FormInput } from "@/components/ui/FormInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormCard } from "@/components/ui/FormCard";

const NotificationsPage = () => {
  const [buildingId, setBuildingId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const buildingsQuery = useQuery({
    queryKey: ["admin-notification-buildings"],
    queryFn: () => adminPortalApi.listBuildings({ page: 0, size: 200 }),
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      adminPortalApi.notifyBuilding({
        buildingId,
        title,
        description,
      }),
    onSuccess: (data) => {
      toast.success(`Notification sent to ${data.recipients} users.`);
      setTitle("");
      setDescription("");
    },
    onError: () => {
      toast.error("Failed to send notification.");
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!buildingId.trim() || !title.trim() || !description.trim()) {
      toast.error("Building ID, title, and description are required.");
      return;
    }
    sendMutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Send Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send building-specific push notifications from the super admin portal.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <FormCard title="Notification details">
          <div className="flex flex-col gap-4">
            <FormInput
              label="Building ID (selected)"
              value={buildingId}
              readOnly
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-0.5">Select building</label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="px-3 py-2 bg-card border border-input rounded-lg outline-none transition-base text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              >
                <option value="">Select a building</option>
                {(buildingsQuery.data?.content ?? []).map((building) => (
                  <option key={building.buildingId} value={String(building.buildingId)}>
                    {building.buildingId} - {building.buildingName}
                  </option>
                ))}
              </select>
              {buildingsQuery.isLoading ? (
                <p className="text-xs text-muted-foreground">Loading buildings...</p>
              ) : null}
            </div>
            <FormInput
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-0.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write the notification description"
                className="min-h-28 px-3 py-2 bg-card border border-input rounded-lg outline-none transition-base text-foreground placeholder:text-muted-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>
          </div>
        </FormCard>

        <div className="flex justify-end mt-5">
          <SubmitButton type="submit" loading={sendMutation.isPending}>
            Send Notification
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default NotificationsPage;
