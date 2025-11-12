import { Component } from '@angular/core';
import { ChatSidebarComponent } from '../chat-sidebar/chat-sidebar';
import { ChatWindow } from '../chat-window/chat-window';
import { ChatDto } from '../../../dtos/ChatDto';
import { SignalRService } from '../../../services/signal-r.service';

@Component({
  selector: 'app-chat-layout',
  imports: [ChatSidebarComponent, ChatWindow],
  templateUrl: './chat-layout.html',
  styleUrl: './chat-layout.css',
})
export class ChatLayoutComponent {
  selectedChat?: ChatDto;

  constructor(private signalr: SignalRService) {}

  onChatSelected(chat: ChatDto) {
    if (this.selectedChat) {
      this.signalr.leaveChat(this.selectedChat.id);
    }
    this.selectedChat = chat;
    this.signalr.joinChat(chat.id);
  }
}
