import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr'
import { MessageDto } from '../dtos/MessageDto';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ChatDto } from '../dtos/ChatDto';
import { ChatService } from './chat.service';
import { Subject } from 'rxjs';
import { UserDto } from '../dtos/UserDto';
import { UserService } from './user.service';
import { AddUserToChatDto } from '../dtos/AddUserToChatDto';
import { CreateChatDto } from '../dtos/CreateChatDto';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  messages: MessageDto[] = [];
  chats: ChatDto[] = [];
  users: UserDto[] = [];
  private _newMessageReceived = new Subject<void>();
  $newMessageReceived = this._newMessageReceived.asObservable();

  constructor(private auth: AuthService, private chatService: ChatService, private userService: UserService) {}

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
      const normalized = this.normalizeMessage(msg, this.auth.getUserName() != msg.senderName);
      this.messages.push(normalized);
      this._newMessageReceived.next();
    });

    this.hubConnection.on('ChatCreated', (createChatDto: CreateChatDto) => {
      if (createChatDto.memberIds.includes(this.auth.getUserId()!)) {
        this.chats.push(this.normalizeChat(createChatDto.chat));
      }
    });

    this.hubConnection.on('NewMemberAdded', (dto: AddUserToChatDto) => {
      const normalizedUser = this.normalizeUser(dto.user);
      this.users.push(normalizedUser);

      if (this.auth.getUserId() === normalizedUser.id) {
        this.chats.push(this.normalizeChat(dto.chat));
      }
    });
  }

  sendMessage(chatId: number, message: MessageDto) {
    const normalized = this.normalizeMessage(message, false);

    this.hubConnection
      .invoke('SendMessageToGroup', chatId, this.auth.getUserId(), normalized)
      .catch((err) => console.error(err));
  }

  joinChat(chatId: number) {
    this.hubConnection
      .invoke<MessageDto[]>('JoinChat', chatId)
      .then(() => {
        const userName = this.auth.getUserName();
        this.chatService.getMessages(chatId).subscribe({
          next: messages => {
            const normalized = messages.map((m: MessageDto) =>
              this.normalizeMessage(m, m.senderName !== userName)
            );

            this.messages = normalized;
          },
          error: err => {
            console.error("Error ocurred fetching messages: ", err);
          }
        });

        this.userService.getChatUsers(chatId).subscribe({
          next: users => {
            this.users = users.map(user => this.normalizeUser(user));
          },
          error: err => console.error(err)
        });
      })
      .catch((err) => console.error('JoinChat error:', err));
  }

  addUserToChat(chatId: number, userId: number) {
    this.hubConnection.invoke("NewMember", chatId, userId)
      .catch((err) => console.error(err));
  }

  leaveChat(chatId: number) {
    this.hubConnection.invoke('LeaveChat', chatId).catch((err) => console.error(err));
  }

  private normalizeMessage(message: MessageDto, isIncoming: boolean): MessageDto {
    return {
      ...message,
      createdAt: this.toUtcString(message.createdAt),
      isIncoming,
    };
  }

  private normalizeChat(chat: ChatDto): ChatDto {
    return {
      ...chat,
      createdAt: this.toUtcString(chat.createdAt),
    };
  }

  private normalizeUser(user: UserDto): UserDto {
    return {
      ...user,
      createdAt: this.toUtcString(user.createdAt),
    };
  }

  private toUtcString(value: string | Date | undefined | null): string {
    if (!value) {
      return new Date().toISOString();
    }

    const date = typeof value === 'string' ? new Date(value) : value;

    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }

    return date.toISOString();
  }
}
