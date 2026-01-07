import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ZardCardComponent } from '../shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ZardCardComponent, ZardButtonComponent, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly totalCoverageCodes = 3;
  readonly totalMedicalPlans = 5;
}
