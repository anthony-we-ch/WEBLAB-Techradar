import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:3000/api';
  constructor(private http: HttpClient) {}

  health() {
    return this.http.get<{ ok: boolean; time: string }>(`${this.base}/health`);
  }
  
  secureMe() {
    return this.http.get<{ ok: boolean }>(`${this.base}/secure/me`);
  }
  
  listRadar() {
    return this.http.get<any[]>(`${this.base}/radar`);
  }
  
  createRadar(body: any) {
    return this.http.post(`${this.base}/radar`, body);
  }
}