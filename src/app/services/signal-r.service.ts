import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr'
import { MessageDto } from '../dtos/MessageDto';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  messages: MessageDto[] = [];

  constructor(private auth: AuthService) {}

  startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/chat`, {
        withCredentials: true,
        accessTokenFactory: () => localStorage.getItem("token") ?? ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.log('Error ocurred! ', err))

    this.hubConnection.on('RecieveMessage', (userId: number, msg: MessageDto) => {
      if (userId != this.auth.getUserId())
      {
        msg.isIncoming = true;
      }

      this.messages.push(msg);
    });
  }

  sendMessage(message: MessageDto) {
    this.hubConnection.invoke('SendMessage', this.auth.getUserId(), message)
      .catch(err => console.error(err));
  }
}
