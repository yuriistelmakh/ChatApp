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

  @ViewChild('messageInput')
  private messageInput?: ElementRef<HTMLInputElement>;

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
    this.signalr.$newMessageReceived.subscribe(() => this.scrollToBottom());
  }

  onSend() {
    if (!this.messageText.trim()) {
      this.messageInput?.nativeElement.focus();
      return;
    }

    this.signalr.sendMessage(this.selectedChat!.id, {
      id: this.signalr.messages.length + 1,
      content: this.messageText,
      createdAt: new Date().toISOString(),
      senderName: this.auth.getUserName()!,
      isIncoming: false,
      sentiment: 2
    });

    this.messageText = '';
    queueMicrotask(() => {
      this.scrollToBottom();
      this.messageInput?.nativeElement.focus();
    });
  }
}
