import API from "@/services/api";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ServiceOrder {
  orderId: number;
  orderType: string;
  profileId: string;
  buildingId: string;
  date: string;
  timeSlot: string;
  optionId: string;
  optionTitle: string;
  notes: string;
  amount: number;
  vhsBookingId: string;
  vhsStatus: string;
  vhsServicePersonName: string;
  vhsServicePersonPhone: string;
  orderCreationDate: string;
  servicePersonId?: string;
  servicePersonName?: string;
  servicePersonPhone?: string;
  servicePersonRating?: string;
  orderStatus: string;
  issueStatus?: string;
  issueText?: string;
  issueRaisedAt?: string;
}

export interface Complaint {
  complaintId: number;
  username: string;
  profileId: string;
  type: string;
  title: string;
  description: string;
  status: string;
  assigneeProfile?: string;
  buildingId: string;
  raisedBy: string;
  flatNumber: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfile {
  phone: string;
  name: string;
  email: string;
  role: string;
  upiId: string;
  buildingId: string;
  floor: string;
  flatNo: string;
  isAssigned: boolean;
  contacts: { name: string; phone: string }[];
}

export interface BuildingAddress {
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
  landmark: string;
  streetName: string;
}

export interface ServiceContact {
  name: string;
  phone: string;
}

export interface BuildingDetails {
  buildingId: number;
  buildingName: string;
  buildingAddress: BuildingAddress;
  floors: number;
  flatStartNumber: number;
  flatEndNumber: number;
  totalFlats: number;
  totalResidents: number;
  profileId: string;
  adminName: string;
  adminPhone: string;
  adminEmail: string;
  upiId: string;
  isWaterBillRequired: boolean;
  plumbingService?: ServiceContact;
  electricService?: ServiceContact;
  carpenterService?: ServiceContact;
  cleaningService?: ServiceContact;
  watchmen?: ServiceContact;
}

interface ListParams {
  q?: string;
  page?: number;
  size?: number;
}

export const adminPortalApi = {
  listServiceOrders: async (params: ListParams) => {
    const { data } = await API.get<PageResponse<ServiceOrder>>("/admin-portal/v1/service-orders", { params });
    return data;
  },
  getServiceOrder: async (orderId: number) => {
    const { data } = await API.get<ServiceOrder>(`/admin-portal/v1/service-orders/${orderId}`);
    return data;
  },
  listComplaints: async (params: ListParams) => {
    const { data } = await API.get<PageResponse<Complaint>>("/admin-portal/v1/complaints", { params });
    return data;
  },
  getComplaint: async (complaintId: number) => {
    const { data } = await API.get<Complaint>(`/admin-portal/v1/complaints/${complaintId}`);
    return data;
  },
  updateComplaintStatus: async (complaintId: number, status: string) => {
    const { data } = await API.patch<Complaint>(`/admin-portal/v1/complaints/${complaintId}/status`, { status });
    return data;
  },
  listProfiles: async (params: ListParams & { buildingId?: string }) => {
    const { data } = await API.get<PageResponse<AdminProfile>>("/admin-portal/v1/profiles", { params });
    return data;
  },
  getProfile: async (phone: string) => {
    const { data } = await API.get<AdminProfile>(`/admin-portal/v1/profiles/${phone}`);
    return data;
  },
  updateProfile: async (phone: string, payload: Partial<AdminProfile> & { pin?: string }) => {
    const { data } = await API.put<AdminProfile>(`/admin-portal/v1/profiles/${phone}`, payload);
    return data;
  },
  listBuildings: async (params: ListParams) => {
    const { data } = await API.get<PageResponse<BuildingDetails>>("/admin-portal/v1/buildings", { params });
    return data;
  },
  getBuilding: async (buildingId: number) => {
    const { data } = await API.get<BuildingDetails>(`/admin-portal/v1/buildings/${buildingId}`);
    return data;
  },
  updateBuilding: async (buildingId: number, payload: Partial<BuildingDetails>) => {
    const { data } = await API.put<BuildingDetails>(`/admin-portal/v1/buildings/${buildingId}`, payload);
    return data;
  },
  notifyBuilding: async (payload: {
    buildingId: string;
    title: string;
    description: string;
    type?: string;
  }) => {
    const { data } = await API.post<{ message: string; recipients: number }>(
      "/admin-portal/v1/notifications/building",
      payload,
    );
    return data;
  },
};
