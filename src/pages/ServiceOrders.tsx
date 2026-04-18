import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminPortalApi, ServiceOrder } from "@/services/adminPortalApi";
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

const ServiceOrdersPage = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const ordersQuery = useQuery({
    queryKey: ["admin-service-orders", debouncedQuery, page],
    queryFn: () => adminPortalApi.listServiceOrders({ q: debouncedQuery, page, size: PAGE_SIZE }),
  });

  const orderDetailQuery = useQuery({
    queryKey: ["admin-service-order", selectedOrderId],
    queryFn: () => adminPortalApi.getServiceOrder(selectedOrderId as number),
    enabled: selectedOrderId !== null,
  });

  const orders = ordersQuery.data?.content ?? [];
  const totalPages = ordersQuery.data?.totalPages ?? 0;
  const currentPage = (ordersQuery.data?.number ?? 0) + 1;
  const canGoPrev = page > 0;
  const canGoNext = page + 1 < totalPages;

  const detailRows = useMemo(() => {
    const order = orderDetailQuery.data;
    if (!order) return [];
    return [
      ["Order ID", order.orderId],
      ["Profile ID", order.profileId],
      ["Building ID", order.buildingId],
      ["Order Type", order.orderType],
      ["Date", order.date],
      ["Time Slot", order.timeSlot],
      ["Status", order.orderStatus],
      ["Issue Status", order.issueStatus],
      ["Issue Text", order.issueText],
      ["Option", order.optionTitle],
      ["Amount", order.amount],
      ["Notes", order.notes],
      ["Service Person", order.servicePersonName ?? order.vhsServicePersonName],
      ["Service Person Phone", order.servicePersonPhone ?? order.vhsServicePersonPhone],
      ["VHS Booking ID", order.vhsBookingId],
      ["VHS Status", order.vhsStatus],
      ["Created On", order.orderCreationDate],
    ];
  }, [orderDetailQuery.data]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Booking Details</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all service orders across buildings.
        </p>
      </header>

      <div className="mb-4">
        <FormInput
          label="Search bookings"
          placeholder="Search by order, profile, building, status, service person..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>Loading booking details...</TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>No booking details found.</TableCell>
              </TableRow>
            ) : (
              orders.map((order: ServiceOrder) => (
                <TableRow
                  key={order.orderId}
                  className="cursor-pointer"
                  onClick={() => setSelectedOrderId(order.orderId)}
                >
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{order.profileId}</TableCell>
                  <TableCell>{order.buildingId}</TableCell>
                  <TableCell>{order.optionTitle || order.orderType}</TableCell>
                  <TableCell>{order.orderStatus}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.amount ?? "-"}</TableCell>
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

      <Dialog open={selectedOrderId !== null} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Service Order Details</DialogTitle>
            <DialogDescription>
              Read-only details for the selected booking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm max-h-[65vh] overflow-auto">
            {orderDetailQuery.isLoading ? (
              <p>Loading details...</p>
            ) : (
              detailRows.map(([label, value]) => (
                <div key={label} className="rounded border border-border p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium break-all">{value ? String(value) : "-"}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceOrdersPage;
