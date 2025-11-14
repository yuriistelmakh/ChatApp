import { Component, Input } from '@angular/core';
import { UserDto } from '../../../dtos/UserDto';
import { MatIcon } from "@angular/material/icon";
import { ChatDto } from '../../../dtos/ChatDto';
import { MatChipRow } from "@angular/material/chips";
import { MatRipple } from "@angular/material/core";
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-chat-sidebar-item',
  imports: [MatIcon, MatRipple, NgClass],
  templateUrl: './chat-sidebar-item.html',
  styleUrl: './chat-sidebar-item.css',
})
export class ChatSidebarItem {
  @Input() chat!: ChatDto;
  @Input() isSelected: boolean = false;
}
