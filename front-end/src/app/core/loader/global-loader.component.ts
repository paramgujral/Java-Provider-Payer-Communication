import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GlobalLoaderService } from './global-loader.service';

@Component({
  selector: 'app-global-loader',
  templateUrl: './global-loader.component.html',
  styleUrls: ['./global-loader.component.css']
})
export class GlobalLoaderComponent implements OnInit, OnDestroy {
  loading = false;
  private sub: Subscription | null = null;

  constructor(private globalLoaderService: GlobalLoaderService) {}

  ngOnInit(): void {
    this.sub = this.globalLoaderService.loading$.subscribe((isLoading) => {
      this.loading = isLoading;
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
