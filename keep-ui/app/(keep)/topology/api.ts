import { ApiClient } from "@/shared/api/client";
import { TopologyApplication, TopologyService } from "./model";

export async function getTopology(
  api: ApiClient,
  params?: {
    providerIds?: string[];
    services?: string[];
    environment?: string;
  }
): Promise<TopologyService[]> {
  const searchParams = new URLSearchParams();
  if (params?.providerIds) {
    searchParams.append("provider_ids", params.providerIds.join(","));
  }
  if (params?.services) {
    searchParams.append("services", params.services.join(","));
  }
  if (params?.environment) {
    searchParams.append("environment", params.environment);
  }
  const response = await api.get<TopologyService[]>(
    `/topology?${searchParams.toString()}`
  );
  return response;
}

export async function getApplications(
  api: ApiClient
): Promise<TopologyApplication[]> {
  const response = await api.get<TopologyApplication[]>("/topology/applications");
  return response;
}

export async function pullTopology(api: ApiClient): Promise<TopologyService[]> {
  const response = await api.post<TopologyService[]>("/topology/pull");
  return response;
}

export async function createService(
  api: ApiClient,
  service: Partial<TopologyService>
): Promise<TopologyService> {
  const response = await api.post<TopologyService>("/topology/services", service);
  return response;
}

export async function updateService(
  api: ApiClient,
  serviceId: number,
  service: Partial<TopologyService>
): Promise<TopologyService> {
  const response = await api.put<TopologyService>(
    `/topology/services/${serviceId}`,
    service
  );
  return response;
}

export async function deleteService(
  api: ApiClient,
  serviceId: number
): Promise<void> {
  await api.delete(`/topology/services/${serviceId}`);
}

export async function createDependency(
  api: ApiClient,
  serviceId: number,
  targetServiceId: number,
  protocol?: string
): Promise<TopologyService> {
  const response = await api.post<TopologyService>(
    `/topology/services/${serviceId}/dependencies/${targetServiceId}`,
    { protocol }
  );
  return response;
}

export async function deleteDependency(
  api: ApiClient,
  serviceId: number,
  targetServiceId: number
): Promise<void> {
  await api.delete(
    `/topology/services/${serviceId}/dependencies/${targetServiceId}`
  );
} 