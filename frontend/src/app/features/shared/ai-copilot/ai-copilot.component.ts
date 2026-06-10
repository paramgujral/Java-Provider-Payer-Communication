import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../../core/services/request.service';
import { AiAnalysis } from '../../../core/models/models';

@Component({
  selector: 'app-ai-copilot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-copilot.component.html',
  styleUrls: ['./ai-copilot.component.scss']
})
export class AiCopilotComponent implements OnChanges {
  @Input() requestId!: number;
  @Input() compact = false;        // slim sidebar mode vs full-page mode
  @Input() theme: 'dark' | 'light' = 'dark';

  analysis = signal<AiAnalysis | null>(null);
  loading  = signal(false);
  error    = signal('');

  // Animated score counter
  displayCompleteness  = signal(0);
  displayApproval      = signal(0);

  constructor(private requestSvc: RequestService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['requestId'] && this.requestId) {
      this.load();
    }
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.requestSvc.getAiAnalysis(this.requestId).subscribe({
      next: ai => {
        this.analysis.set(ai);
        this.loading.set(false);
        this.animateScores(ai);
      },
      error: () => {
        this.error.set('Could not load AI analysis.');
        this.loading.set(false);
      }
    });
  }

  refresh(): void { this.load(); }

  private animateScores(ai: AiAnalysis): void {
    this.displayCompleteness.set(0);
    this.displayApproval.set(0);
    this.animateTo(this.displayCompleteness, ai.completenessScore);
    setTimeout(() => this.animateTo(this.displayApproval, ai.approvalProbability), 150);
  }

  private animateTo(sig: ReturnType<typeof signal<number>>, target: number): void {
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      sig.set(current);
      if (current >= target) clearInterval(timer);
    }, 20);
  }

  scoreColor(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  scoreHex(score: number): string {
    if (score >= 80) return '#4ade80';
    if (score >= 50) return '#fbbf24';
    return '#f87171';
  }

  riskIcon(risk: string): string {
    return { LOW: 'verified', MEDIUM: 'warning_amber', HIGH: 'gpp_bad' }[risk] ?? 'info';
  }

  circumference = 2 * Math.PI * 36; // r=36

  dashOffset(score: number): number {
    return this.circumference * (1 - score / 100);
  }
}
