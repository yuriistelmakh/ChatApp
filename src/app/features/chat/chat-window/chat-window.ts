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

@Component({
  selector: 'app-chat-window',
  imports: [Message, NgClass, MatIcon, MatFabAnchor, FormsModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css',
})
export class ChatWindow implements OnInit {
  @Input() selectedChat?: ChatDto;

  messageText: string = '';

  userName: string = 'Me';

  @ViewChild('bottomAnchor')
  private bottom?: ElementRef<HTMLDivElement>;

  @ViewChild('messagesList')
  private list?: ElementRef<HTMLUListElement>;

  constructor(public signalr: SignalRService) {}

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

  // ngOnChanges(changes: SimpleChanges): void {
  //   if(changes['selectedChat'] && !changes['selectedChat'].firstChange) {
  //     for (let i = 0; i < 3; i++) {
  //       this.messages.push({
  //         id: i,
  //         content: Math.random().toString(),
  //         createdAt: new Date(Date.now()),
  //         senderName: "Sender1",
  //         isIncoming: i % 2 == 0
  //       });
  //     }
  //   }
  // }

  onSend() {
    if (this.messageText.trim()) {
      this.signalr.sendMessage({
        id: this.signalr.messages.length + 1,
        content: this.messageText,
        createdAt: new Date(Date.now()),
        senderName: this.userName,
        isIncoming: false
      });

      this.messageText = '';
      queueMicrotask(() => this.scrollToBottom());
    }
  }
}
