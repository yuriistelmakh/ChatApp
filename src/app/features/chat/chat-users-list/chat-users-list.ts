import { Component, Input, OnInit, Output } from '@angular/core';
import { UserDto } from '../../../dtos/UserDto';
import { ChatDto } from '../../../dtos/ChatDto';
import { SignalRService } from '../../../services/signal-r.service';

@Component({
  selector: 'app-chat-users-list',
  imports: [],
  templateUrl: './chat-users-list.html',
  styleUrl: './chat-users-list.css',
})
export class ChatUsersList implements OnInit {
  @Input() selectedChat?: ChatDto;

  constructor(public signalr: SignalRService) {}

  ngOnInit(): void {
    
  }
}
