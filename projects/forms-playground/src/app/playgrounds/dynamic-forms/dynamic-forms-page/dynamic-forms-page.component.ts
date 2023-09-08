import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-forms-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dynamic-forms-page.component.html',
  styleUrls: ['../../common-page.scss', './dynamic-forms-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormsPageComponent implements OnInit {
  constructor() { }

  ngOnInit(): void { }
}
