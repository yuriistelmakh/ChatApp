import { Component, EventEmitter, Output } from '@angular/core';
import { ChatSidebarItem } from "../chat-sidebar-item/chat-sidebar-item";
import { UserDto } from '../../../dtos/UserDto';
import { ChatDto } from '../../../dtos/ChatDto';
import { MessageDto } from '../../../dtos/MessageDto';
import { SignalRService } from '../../../services/signal-r.service';

@Component({
  selector: 'app-chat-sidebar',
  imports: [ChatSidebarItem],
  templateUrl: './chat-sidebar.html',
  styleUrl: './chat-sidebar.css',
})
export class ChatSidebarComponent {
  @Output() chatSelected = new EventEmitter<ChatDto>();

  onChatSelected(chat: ChatDto) {
    this.chatSelected.emit(chat);
  }

  chats: ChatDto[] = [
    {
      id: 1,
      name: "Chat1",
      isGroup: false,
      createdAt: new Date(Date.now())
    },
    {
      id: 2,
      name: "Chat2",
      isGroup: false,
      createdAt: new Date(Date.now())
    },
    {
      id: 3,
      name: "Chat3",
      isGroup: false,
      createdAt: new Date(Date.now())
    },
  ];
}
