import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminPortalApi, AdminProfile } from "@/services/adminPortalApi";
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

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    upiId: "",
    buildingId: "",
    floor: "",
    flatNo: "",
    isAssigned: false,
    pin: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const usersQuery = useQuery({
    queryKey: ["admin-users", debouncedQuery, page],
    queryFn: () => adminPortalApi.listProfiles({ q: debouncedQuery, page, size: PAGE_SIZE }),
  });

  const userDetailQuery = useQuery({
    queryKey: ["admin-user-detail", selectedPhone],
    queryFn: () => adminPortalApi.getProfile(selectedPhone as string),
    enabled: !!selectedPhone,
  });

  useEffect(() => {
    if (!userDetailQuery.data) return;
    const user = userDetailQuery.data;
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      upiId: user.upiId || "",
      buildingId: user.buildingId || "",
      floor: user.floor || "",
      flatNo: user.flatNo || "",
      isAssigned: Boolean(user.isAssigned),
      pin: "",
    });
  }, [userDetailQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      adminPortalApi.updateProfile(selectedPhone as string, {
        ...form,
        pin: form.pin || undefined,
      }),
    onSuccess: () => {
      toast.success("User updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", selectedPhone] });
      setSelectedPhone(null);
    },
    onError: () => {
      toast.error("Failed to update user.");
    },
  });

  const users = usersQuery.data?.content ?? [];
  const totalPages = usersQuery.data?.totalPages ?? 0;
  const currentPage = (usersQuery.data?.number ?? 0) + 1;
  const canGoPrev = page > 0;
  const canGoNext = page + 1 < totalPages;

  const handleSave = () => {
    if (!selectedPhone) return;
    updateMutation.mutate();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage user records across all buildings. Phone number is read-only.
        </p>
      </header>

      <div className="mb-4">
        <FormInput
          label="Search users"
          placeholder="Search by name, phone, email, role, building, flat..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Flat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading users...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No users found.</TableCell>
              </TableRow>
            ) : (
              users.map((user: AdminProfile) => (
                <TableRow key={user.phone} className="cursor-pointer" onClick={() => setSelectedPhone(user.phone)}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.buildingId || "-"}</TableCell>
                  <TableCell>{user.flatNo || "-"}</TableCell>
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

      <Dialog open={!!selectedPhone} onOpenChange={(open) => !open && setSelectedPhone(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details. Phone number cannot be edited.</DialogDescription>
          </DialogHeader>
          {userDetailQuery.isLoading ? (
            <p>Loading user...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput label="Phone (read-only)" value={selectedPhone || ""} disabled />
              <FormInput label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <FormInput label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground/80 ml-0.5">Role</label>
                <select
                  className="px-3 py-2 bg-card border border-input rounded-lg"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                  <option value="OWNER">OWNER</option>
                  <option value="VISITOR">VISITOR</option>
                  <option value="SERVICE_PERSON">SERVICE_PERSON</option>
                </select>
              </div>
              <FormInput
                label="Building ID"
                value={form.buildingId}
                onChange={(e) => setForm((f) => ({ ...f, buildingId: e.target.value }))}
              />
              <FormInput label="Floor" value={form.floor} onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))} />
              <FormInput label="Flat No" value={form.flatNo} onChange={(e) => setForm((f) => ({ ...f, flatNo: e.target.value }))} />
              <FormInput label="UPI ID" value={form.upiId} onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))} />
              <FormInput
                label="New PIN (optional)"
                type="password"
                value={form.pin}
                onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))}
              />
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={form.isAssigned}
                  onChange={(e) => setForm((f) => ({ ...f, isAssigned: e.target.checked }))}
                />
                Assigned
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setSelectedPhone(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
