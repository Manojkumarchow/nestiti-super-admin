import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminPortalApi, Complaint } from "@/services/adminPortalApi";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED"];

const ComplaintsPage = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);
  const [status, setStatus] = useState("OPEN");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const complaintsQuery = useQuery({
    queryKey: ["admin-complaints", debouncedQuery, page],
    queryFn: () => adminPortalApi.listComplaints({ q: debouncedQuery, page, size: PAGE_SIZE }),
  });

  const complaintDetailQuery = useQuery({
    queryKey: ["admin-complaint", selectedComplaintId],
    queryFn: () => adminPortalApi.getComplaint(selectedComplaintId as number),
    enabled: selectedComplaintId !== null,
  });

  useEffect(() => {
    if (complaintDetailQuery.data?.status) {
      setStatus(complaintDetailQuery.data.status);
    }
  }, [complaintDetailQuery.data?.status]);

  const updateStatusMutation = useMutation({
    mutationFn: () => adminPortalApi.updateComplaintStatus(selectedComplaintId as number, status),
    onSuccess: () => {
      toast.success("Complaint status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["admin-complaint", selectedComplaintId] });
    },
    onError: () => {
      toast.error("Failed to update complaint status.");
    },
  });

  const complaints = complaintsQuery.data?.content ?? [];
  const totalPages = complaintsQuery.data?.totalPages ?? 0;
  const currentPage = (complaintsQuery.data?.number ?? 0) + 1;
  const canGoPrev = page > 0;
  const canGoNext = page + 1 < totalPages;

  const selectedComplaint = complaintDetailQuery.data;

  const extractImageId = (url: string) => {
    const match = url.match(/\/issues\/images\/(\d+)$/);
    return match ? match[1] : null;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Issues</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track complaints from all buildings and resolve them.
        </p>
      </header>

      <div className="mb-4">
        <FormInput
          label="Search complaints"
          placeholder="Search by complaint, title, profile, building, status..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Raised By</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaintsQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading complaints...</TableCell>
              </TableRow>
            ) : complaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No complaints found.</TableCell>
              </TableRow>
            ) : (
              complaints.map((complaint: Complaint) => (
                <TableRow
                  key={complaint.complaintId}
                  className="cursor-pointer"
                  onClick={() => setSelectedComplaintId(complaint.complaintId)}
                >
                  <TableCell>{complaint.complaintId}</TableCell>
                  <TableCell>{complaint.title}</TableCell>
                  <TableCell>{complaint.raisedBy || complaint.profileId}</TableCell>
                  <TableCell>{complaint.buildingId}</TableCell>
                  <TableCell>{complaint.status}</TableCell>
                  <TableCell>{complaint.createdAt?.slice(0, 10) || "-"}</TableCell>
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

      <Dialog open={selectedComplaintId !== null} onOpenChange={(open) => !open && setSelectedComplaintId(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>View complete issue information and update status.</DialogDescription>
          </DialogHeader>

          {complaintDetailQuery.isLoading ? (
            <p>Loading complaint details...</p>
          ) : !selectedComplaint ? (
            <p>No complaint selected.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded border p-3">
                  <p className="text-xs text-muted-foreground">Complaint ID</p>
                  <p className="font-medium">{selectedComplaint.complaintId}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-xs text-muted-foreground">Building</p>
                  <p className="font-medium">{selectedComplaint.buildingId}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-xs text-muted-foreground">Raised By</p>
                  <p className="font-medium">{selectedComplaint.raisedBy || selectedComplaint.profileId}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-xs text-muted-foreground">Flat</p>
                  <p className="font-medium">{selectedComplaint.flatNumber || "-"}</p>
                </div>
                <div className="rounded border p-3 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedComplaint.title}</p>
                </div>
                <div className="rounded border p-3 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="font-medium whitespace-pre-wrap">{selectedComplaint.description}</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Update status</label>
                <div className="flex gap-3">
                  <select
                    className="px-3 py-2 border rounded-md bg-background"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Button onClick={() => updateStatusMutation.mutate()} disabled={updateStatusMutation.isPending}>
                    {updateStatusMutation.isPending ? "Saving..." : "Save Status"}
                  </Button>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="font-medium mb-3">Complaint Images</h3>
                {selectedComplaint.imageUrls?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedComplaint.imageUrls.map((url) => {
                      const imageId = extractImageId(url);
                      const downloadUrl = imageId
                        ? `/whistleup/admin-portal/v1/complaints/images/${imageId}/download`
                        : url;

                      return (
                        <div key={url} className="border rounded-lg p-3">
                          <img src={url} alt="Complaint" className="w-full h-40 object-cover rounded" />
                          <a
                            href={downloadUrl}
                            className="inline-block text-sm text-primary mt-2 underline"
                            download
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download image
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No images available.</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintsPage;
