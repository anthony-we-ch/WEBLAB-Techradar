import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

export interface HealthResponse {
  ok: boolean;
  time: string;
}

export interface SecureMeResponse {
  ok: boolean;
}

export type RadarStatus = "adopt" | "trial" | "assess" | "hold";
export type RadarQuadrant = "languages-frameworks" | "techniques" | "tools" | "platforms";

export interface RadarItem {
  id?: string;
  title: string;
  private?: boolean;
  status: RadarStatus;
  quadrant: RadarQuadrant;
  reason: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateClassificationDto {
  status?: RadarStatus;
  quadrant?: RadarQuadrant;
  reason: string;
}

export interface UpdateTechnologyDto {
  title?: string;
  description?: string;
  quadrant?: RadarQuadrant;
}


@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = "http://localhost:3000/api";

  health() {
    return this.http.get<HealthResponse>(`${this.base}/health`);
  }

  secureMe() {
    return this.http.get<SecureMeResponse>(`${this.base}/secure/me`);
  }

  listRadar() {
    return this.http.get<RadarItem[]>(`${this.base}/radar`);
  }

  createRadar(body: RadarItem) {
    return this.http.post<RadarItem>(`${this.base}/radar`, body);
  }

  deleteRadar(id: string) {
    return this.http.delete<void>(`${this.base}/radar/${id}`);
  }

  updateClassification(id: string, body: UpdateClassificationDto) {
    return this.http.patch<RadarItem>(`${this.base}/radar/${id}/classification`, body);
  }

  updateTechnology(id: string, body: UpdateTechnologyDto) {
    return this.http.patch<RadarItem>(`${this.base}/radar/${id}/technology`, body);
  }

  debugHeaders() {
    return this.http.get<{ authorization: string | null; userAgent: string | null }>(
      "http://localhost:3000/api/debug/headers"
    );
  }
}
