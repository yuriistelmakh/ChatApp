import {
  Component,
  ElementRef,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ChatDto } from '../../../dtos/ChatDto';
import { MessageDto } from '../../../dtos/MessageDto';
import { Message } from '../message/message';
import { NgClass } from '@angular/common';
import { MatAnchor, MatFabAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormsModule, NgModel } from '@angular/forms';
import { SignalRService } from '../../../services/signal-r.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-chat-window',
  imports: [Message, NgClass, MatIcon, MatFabAnchor, FormsModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css',
})
export class ChatWindow implements OnInit {
  @Input() selectedChat?: ChatDto;

  messageText: string = '';

  @ViewChild('bottomAnchor')
  private bottom?: ElementRef<HTMLDivElement>;

  @ViewChild('messagesList')
  private list?: ElementRef<HTMLUListElement>;

  constructor(public signalr: SignalRService, private auth: AuthService) {}

  private scrollToBottom() {
    const el = this.list?.nativeElement;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });
      return;
    }
    this.bottom?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  ngOnInit(): void {
    this.signalr.startConnection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['selectedChat']) {
      if (!changes['selectedChat'].firstChange)
      {
        
      }
    }
  }

  onSend() {
    if (this.messageText.trim()) {
      this.signalr.sendMessage(
      this.selectedChat!.id,
      {
        id: this.signalr.messages.length + 1,
        content: this.messageText,
        createdAt: new Date(Date.now()),
        senderName: this.auth.getUserName()!,
        isIncoming: false
      });

      this.messageText = '';
      queueMicrotask(() => this.scrollToBottom());
    }
  }
}
