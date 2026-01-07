import { Routes } from '@angular/router';
import { MainLayout } from './main-layout/main-layout';
import { Home } from './home/home';
import { CoverageCodesComponent } from './coverage-codes/coverage-codes.component';
import { MedicalPlansComponent } from './medical-plans/medical-plans.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Home,
      },
      {
        path: 'coverage-codes',
        component: CoverageCodesComponent,
      },
      {
        path: 'medical-plans',
        component: MedicalPlansComponent,
      },
    ],
  },
];
