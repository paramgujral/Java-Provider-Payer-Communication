import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatMessage } from '../../models';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from '../header/header.component';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadModule, ButtonModule, HeaderComponent]
})
export class ChatComponent implements OnInit {
  messages: ChatMessage[] = [];
  newMessage = '';
  requestId: string | null = null;
  isLoading = false;
  showTypingIndicator = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.requestId = params['requestId'];
      if (this.requestId) {
        this.loadMessages();
      }
    });
  }

  loadMessages(): void {
    if (!this.requestId) return;
    
    this.isLoading = true;
    this.chatService.getMessages(this.requestId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading messages', err);
        this.isLoading = false;
      }
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.requestId) {
      const message: Partial<ChatMessage> = {
        message: this.newMessage,
        timestamp: new Date()
      };

      this.chatService.sendMessage(this.requestId, message).subscribe({
        next: (response) => {
          this.messages.push(response);
          this.newMessage = '';
          
          // In a real app with WebSockets, you wouldn't need to poll or simulate
          // But for this example, we'll assume the API handles the response
        },
        error: (err) => {
          console.error('Error sending message', err);
        }
      });
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  uploadFile(event: any): void {
    const file = event.files[0];
    if (file) {
      console.log('File uploaded:', file);
      // Handle file upload logic here via service
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
