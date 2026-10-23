import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-eye-icon',
  template: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true" [class.closed]="!open">
      <g class="eye">
        <path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </g>
      <path class="slash" d="M4 4l16 16" />
    </svg>
  `,
  styles: [`
    :host { display: inline-grid; place-items: center; }
    .eye {
      transform-box: view-box;
      transform-origin: 12px 12px;
      transition: transform 0.25s ease;
    }
    .slash {
      stroke-dasharray: 23;
      stroke-dashoffset: 23;
      transition: stroke-dashoffset 0.25s ease;
    }
    .closed .eye { transform: scaleY(0.35); }
    .closed .slash { stroke-dashoffset: 0; }
  `],
})
export class EyeIcon {
  @Input() open = false;
}