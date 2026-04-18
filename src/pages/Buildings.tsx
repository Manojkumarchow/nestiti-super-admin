import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminPortalApi, BuildingDetails } from "@/services/adminPortalApi";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 15;

const emptyAddress = {
  city: "",
  state: "",
  pincode: "",
  fullAddress: "",
  landmark: "",
  streetName: "",
};

const BuildingsPage = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<BuildingDetails>>({
    buildingName: "",
    buildingAddress: emptyAddress,
    floors: 0,
    totalFlats: 0,
    flatStartNumber: 0,
    flatEndNumber: 0,
    totalResidents: 0,
    profileId: "",
    adminName: "",
    adminPhone: "",
    adminEmail: "",
    upiId: "",
    isWaterBillRequired: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const buildingsQuery = useQuery({
    queryKey: ["admin-buildings", debouncedQuery, page],
    queryFn: () => adminPortalApi.listBuildings({ q: debouncedQuery, page, size: PAGE_SIZE }),
  });

  const buildingDetailQuery = useQuery({
    queryKey: ["admin-building-detail", selectedBuildingId],
    queryFn: () => adminPortalApi.getBuilding(selectedBuildingId as number),
    enabled: selectedBuildingId !== null,
  });

  useEffect(() => {
    if (!buildingDetailQuery.data) return;
    setForm(buildingDetailQuery.data);
  }, [buildingDetailQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () => adminPortalApi.updateBuilding(selectedBuildingId as number, form),
    onSuccess: () => {
      toast.success("Building updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-buildings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-building-detail", selectedBuildingId] });
      setSelectedBuildingId(null);
    },
    onError: () => toast.error("Failed to update building."),
  });

  const buildings = buildingsQuery.data?.content ?? [];
  const totalPages = buildingsQuery.data?.totalPages ?? 0;
  const currentPage = (buildingsQuery.data?.number ?? 0) + 1;
  const canGoPrev = page > 0;
  const canGoNext = page + 1 < totalPages;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Buildings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search and edit building data across the platform.
        </p>
      </header>

      <div className="mb-4">
        <FormInput
          label="Search buildings"
          placeholder="Search by id, name, admin, city, address..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Admin Phone</TableHead>
              <TableHead>Total Flats</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buildingsQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading buildings...</TableCell>
              </TableRow>
            ) : buildings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No buildings found.</TableCell>
              </TableRow>
            ) : (
              buildings.map((building: BuildingDetails) => (
                <TableRow
                  key={building.buildingId}
                  className="cursor-pointer"
                  onClick={() => setSelectedBuildingId(building.buildingId)}
                >
                  <TableCell>{building.buildingId}</TableCell>
                  <TableCell>{building.buildingName}</TableCell>
                  <TableCell>{building.buildingAddress?.city || "-"}</TableCell>
                  <TableCell>{building.adminName || "-"}</TableCell>
                  <TableCell>{building.adminPhone || "-"}</TableCell>
                  <TableCell>{building.totalFlats || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Page {Math.max(currentPage, 1)} of {Math.max(totalPages, 1)}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={!canGoPrev} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="secondary" disabled={!canGoNext} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>

      <Dialog open={selectedBuildingId !== null} onOpenChange={(open) => !open && setSelectedBuildingId(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Building</DialogTitle>
            <DialogDescription>Update building details from the super admin portal.</DialogDescription>
          </DialogHeader>

          {buildingDetailQuery.isLoading ? (
            <p>Loading building details...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Building Name"
                value={form.buildingName || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, buildingName: e.target.value }))}
              />
              <FormInput
                label="Floors"
                type="number"
                value={String(form.floors ?? 0)}
                onChange={(e) => setForm((prev) => ({ ...prev, floors: Number(e.target.value) || 0 }))}
              />
              <FormInput
                label="Total Flats"
                type="number"
                value={String(form.totalFlats ?? 0)}
                onChange={(e) => setForm((prev) => ({ ...prev, totalFlats: Number(e.target.value) || 0 }))}
              />
              <FormInput
                label="Total Residents"
                type="number"
                value={String(form.totalResidents ?? 0)}
                onChange={(e) => setForm((prev) => ({ ...prev, totalResidents: Number(e.target.value) || 0 }))}
              />
              <FormInput
                label="Admin Name"
                value={form.adminName || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, adminName: e.target.value }))}
              />
              <FormInput
                label="Admin Phone"
                value={form.adminPhone || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, adminPhone: e.target.value }))}
              />
              <FormInput
                label="Admin Email"
                value={form.adminEmail || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
              />
              <FormInput
                label="Profile ID"
                value={form.profileId || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, profileId: e.target.value }))}
              />
              <FormInput
                label="UPI ID"
                value={form.upiId || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, upiId: e.target.value }))}
              />
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={Boolean(form.isWaterBillRequired)}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isWaterBillRequired: e.target.checked }))
                  }
                />
                Water bill required
              </label>

              <FormInput
                label="City"
                value={form.buildingAddress?.city || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    buildingAddress: { ...emptyAddress, ...prev.buildingAddress, city: e.target.value },
                  }))
                }
              />
              <FormInput
                label="State"
                value={form.buildingAddress?.state || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    buildingAddress: { ...emptyAddress, ...prev.buildingAddress, state: e.target.value },
                  }))
                }
              />
              <FormInput
                label="Pincode"
                value={form.buildingAddress?.pincode || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    buildingAddress: { ...emptyAddress, ...prev.buildingAddress, pincode: e.target.value },
                  }))
                }
              />
              <FormInput
                label="Street Name"
                value={form.buildingAddress?.streetName || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    buildingAddress: { ...emptyAddress, ...prev.buildingAddress, streetName: e.target.value },
                  }))
                }
              />
              <FormInput
                label="Landmark"
                value={form.buildingAddress?.landmark || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    buildingAddress: { ...emptyAddress, ...prev.buildingAddress, landmark: e.target.value },
                  }))
                }
              />
              <div className="sm:col-span-2">
                <FormInput
                  label="Full Address"
                  value={form.buildingAddress?.fullAddress || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      buildingAddress: { ...emptyAddress, ...prev.buildingAddress, fullAddress: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setSelectedBuildingId(null)}>
              Cancel
            </Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuildingsPage;
