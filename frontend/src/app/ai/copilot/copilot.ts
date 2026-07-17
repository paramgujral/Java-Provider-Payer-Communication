import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';

@Component({
  selector: 'app-copilot',
  imports: [CommonModule, FormsModule],
  templateUrl: './copilot.html',
  styleUrl: './copilot.css',
})
export class CopilotComponent {
  requestText = '';
  summaryResult: any = null;
  recommendationResult: any = null;
  validationResult: any = null;
  missingFieldsResult: any = null;
  message = '';

  constructor(private aiService: AiService) {}

  analyze(): void {
    this.message = 'Analyzing request...';

    this.aiService.summarize(this.requestText).subscribe({
      next: (response) => {
        this.summaryResult = response.data;
      },
      error: () => {
        this.message = 'Unable to generate AI summary.';
      }
    });

    this.aiService.recommend(this.requestText).subscribe({
      next: (response) => {
        this.recommendationResult = response.data;
      }
    });

    this.aiService.validate(this.requestText).subscribe({
      next: (response) => {
        this.validationResult = response.data;
      }
    });

    this.aiService.detectMissingFields(this.requestText).subscribe({
      next: (response) => {
        this.missingFieldsResult = response.data;
        this.message = 'AI analysis complete.';
      },
      error: () => {
        this.message = 'Unable to generate AI insight.';
      }
    });
  }
}
