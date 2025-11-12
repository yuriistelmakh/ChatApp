import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr'
import { MessageDto } from '../dtos/MessageDto';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ChatDto } from '../dtos/ChatDto';

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
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch((err) => console.log('Error ocurred! ', err));

    this.hubConnection.on('ReceiveMessage', (userId: number, msg: MessageDto) => {
      if (userId != this.auth.getUserId()) {
        msg.isIncoming = true;
        this.messages.push(msg);
      }
    });
  }

  sendMessage(chatId: number, message: MessageDto) {
    this.hubConnection
      .invoke('SendMessageToGroup', chatId, this.auth.getUserId(), message)
      .catch((err) => console.error(err));

    this.messages.push(message);
  }

  joinChat(chatId: number) {
    this.hubConnection
      .invoke<MessageDto[]>('JoinChat', chatId)
      .then((messages) => {
        messages.forEach((m) => {
          if (m.senderName !== this.auth.getUserName()) {
            m.isIncoming = true;
          }
        });

        this.messages = messages;
      })
      .catch((err) => console.error('JoinChat error:', err));
  }

  leaveChat(chatId: number) {
    this.hubConnection.invoke('LeaveChat', chatId).catch((err) => console.error(err));
  }
}
