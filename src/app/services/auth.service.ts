import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthRequest } from '../dtos/AuthRequest';
import { AuthResult } from '../dtos/AuthResult';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  nameid: string,
  unique_name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  signUp(request: AuthRequest) : Observable<AuthResult>  {
    return this.http.post<AuthResult>(
      `${environment.apiUrl}/Auth/register`, request
    );
  }

  signIn(request: AuthRequest) : Observable<AuthResult> {
    return this.http.post<AuthResult>(
      `${environment.apiUrl}/Auth/login`, request
    );
  }

  getUserId(): number | null {
    const token = localStorage.getItem("token");
    if(token)
    {
      const decoded = jwtDecode<JwtPayload>(token);
      return parseInt(decoded.nameid);
    }

    return null;
  }
}
