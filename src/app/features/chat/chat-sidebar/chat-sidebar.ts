import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ChatSidebarItem } from "../chat-sidebar-item/chat-sidebar-item";
import { UserDto } from '../../../dtos/UserDto';
import { ChatDto } from '../../../dtos/ChatDto';
import { MessageDto } from '../../../dtos/MessageDto';
import { SignalRService } from '../../../services/signal-r.service';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { MatAnchor } from "@angular/material/button";
import { MatDialog } from '@angular/material/dialog';
import { NewChatDialog } from '../new-chat-dialog/new-chat-dialog';

@Component({
  selector: 'app-chat-sidebar',
  imports: [ChatSidebarItem, MatAnchor],
  templateUrl: './chat-sidebar.html',
  styleUrl: './chat-sidebar.css',
})
export class ChatSidebarComponent implements OnInit {
  @Output() chatSelected = new EventEmitter<ChatDto>();

  constructor(private chatService: ChatService, 
    private auth: AuthService, 
    private dialog: MatDialog,
    public signalr: SignalRService) {}

  onChatSelected(chat: ChatDto) {
    this.chatSelected.emit(chat);
  }

  ngOnInit(): void {
    this.chatService.getChats(this.auth.getUserId()!).subscribe({
      next: chats => {
        const toUtc = (value: string) => {
          const parsed = new Date(value);
          return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
        };

        this.signalr.chats = chats.map(chat => ({
          ...chat,
          createdAt: toUtc(chat.createdAt),
        }));
      },
      error: err => console.error(err)
    });
  }

  openCreateChatDialog() {
    const dialogRef = this.dialog.open(NewChatDialog, {
      width: '800px',
      height: '500px'
    })
  }
}
