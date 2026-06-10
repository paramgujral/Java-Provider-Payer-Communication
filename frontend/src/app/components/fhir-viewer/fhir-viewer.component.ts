import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fhir-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-head">
      <h3>FHIR R4 Resource</h3>
      <span class="chip chip-mono" style="background:var(--green-soft);color:var(--green)">
        {{ resourceType }}
      </span>
    </div>
    <pre class="fhir" [innerHTML]="highlighted"></pre>
  `
})
export class FhirViewerComponent {
  highlighted = '';
  resourceType = 'Bundle';

  @Input() set data(value: any) {
    if (!value) { this.highlighted = ''; return; }
    this.resourceType = value.resourceType || 'Bundle';
    this.highlighted = this.highlight(JSON.stringify(value, null, 2));
  }

  private highlight(json: string): string {
    const esc = json
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return esc
      .replace(/"([^"]+)":/g, '<span class="k">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="s">"$1"</span>')
      .replace(/: (\d+\.?\d*)(,?)$/gm, ': <span class="n">$1</span>$2');
  }
}
