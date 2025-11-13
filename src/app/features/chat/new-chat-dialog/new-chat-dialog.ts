import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipListbox, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe, NgIf } from '@angular/common';
import { map, Observable, startWith } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { MatOptionModule } from '@angular/material/core';
import { MatAnchor } from "@angular/material/button";
import { MatDialogRef } from '@angular/material/dialog';
import { ChatService } from '../../../services/chat.service';
import { UserDto } from '../../../dtos/UserDto';

@Component({
  selector: 'app-new-chat-dialog',
  imports: [
    MatFormField,
    MatLabel,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    FormsModule,
    MatChipsModule,
    MatOptionModule,
    MatIconModule,
    AsyncPipe,
    MatAnchor
],
  templateUrl: './new-chat-dialog.html',
  styleUrl: './new-chat-dialog.css',
})
export class NewChatDialog implements OnInit {
  formControl = new FormControl<string | UserDto>('');
  chatName = '';

  autocompleteUsers: UserDto[] = [];
  filteredOptions?: Observable<UserDto[]>;
  selectedUsers: UserDto[] = [];

  constructor(private dialogRef: MatDialogRef<NewChatDialog>, 
    private userService: UserService, private auth: AuthService,
    private chatService: ChatService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        const currentUserId = this.auth.getUserId();
        this.autocompleteUsers = users
          .filter((u) => u.id !== currentUserId)
      },
    });

    this.filteredOptions = this.formControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: string | UserDto): UserDto[] {
    const rawValue = typeof value === 'string' ? value : value?.username ?? '';
    const filterValue = rawValue.toLowerCase();
    return this.autocompleteUsers
      .filter(
        (option) =>
          option.username.toLowerCase().includes(filterValue) &&
          !this.selectedUsers.some((u) => u.id === option.id)
      )
      .slice(0, 10);
  }

  onUserSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as UserDto;
    if (!this.selectedUsers.some((u) => u.id === user.id)) {
      this.selectedUsers.push(user);
    }
    this.formControl.setValue('');
  }

  removeUser(id: number): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u.id != id);
  }

  displayUser(user?: UserDto | string | null): string {
    if (!user) {
      return '';
    }
    return typeof user === 'string' ? user : user.username;
  }

  cancel() {
    this.dialogRef.close();
  }

  create() {
    const userIds = this.selectedUsers.map(u => u.id);
    const current = this.auth.getUserId();
    if (current) {
      userIds.push(current);
    }
    this.chatService
      .addChat({
        chat: { id: 0, name: this.chatName, isGroup: false, createdAt: new Date().toISOString() },
        memberIds: userIds,
      })
      .subscribe((data) => console.log(data));
    this.dialogRef.close();
  }
}
