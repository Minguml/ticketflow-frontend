import axios from "axios";
import { apiClient } from "@/lib/api-client";

export type Driver = {
  id: string;
  profile_picture_key?: string;
  profile_picture_content_type?: string;
  profile_picture_size_bytes?: number;
  personal_id: string;
  phone_number: string;
  name: string;
  status: "active" | "suspended" | "retired";
  created_at: string;
  updated_at: string;
};

type UploadTicket = {
  key: string;
  upload_url: string;
  content_type: string;
  size_bytes: number;
};

type UploadResult = {
  key: string;
  content_type: string;
  size_bytes: number;
  download_url?: string;
};

const driverInput = {
  create: (input: { name: string; phone_number: string; personal_id: string }) => input,
};

export const driversApi = {
  list: () => apiClient.get<Driver[]>("/drivers").then(({ data }) => data),
  create: (input: { name: string; phone_number: string; personal_id: string }) =>
    apiClient
      .post<Driver>("/drivers", driverInput.create(input))
      .then(({ data }) => data),
  patch: (
    id: string,
    input: Partial<{ name: string; phone_number: string; personal_id: string; status: Driver["status"] }>,
  ) =>
    apiClient
      .patch<Driver>(`/drivers/${id}`, input)
      .then(({ data }) => data),
  uploadProfile: async (driverId: string, file: File) => {
    const { data: ticket } = await apiClient.post<UploadTicket>(
      "/uploads/driver-profile/presign",
      {
        driver_id: driverId,
        content_type: file.type,
        size_bytes: file.size,
      },
    );
    const response = await axios.put(ticket.upload_url, file, {
      headers: { "Content-Type": file.type },
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error("S3 upload failed");
    }
    const { data: completed } = await apiClient.post<UploadResult>(
      "/uploads/driver-profile/complete",
      {
        driver_id: driverId,
        key: ticket.key,
        content_type: file.type,
        size_bytes: file.size,
      },
    );
    return completed;
  },
};
