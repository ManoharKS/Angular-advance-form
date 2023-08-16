import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reactive-forms-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reactive-forms-page.component.html',
  styleUrls: [
    '../../common-page.scss',
    '../../common-form.scss',
    './reactive-forms-page.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactiveFormsPageComponent implements OnInit {
  get years() {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 40))
      .fill('')
      .map((_, idx) => now - idx);
  }
  constructor() {}

  ngOnInit(): void {}
}
