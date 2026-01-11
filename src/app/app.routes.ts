import { Routes } from '@angular/router';
import { MainLayout } from './main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home.component').then((m) => m.Home),
      },
      {
        path: 'coverage-codes',
        loadComponent: () =>
          import('./coverage-codes/coverage-codes.component').then((m) => m.CoverageCodesComponent),
      },
      {
        path: 'medical-plans',
        loadComponent: () =>
          import('./medical-plans/medical-plans.component').then((m) => m.MedicalPlansComponent),
      },
      {
        path: 'medical-plans/:id',
        loadComponent: () =>
          import('./medical-plans/medical-plan-detail/medical-plan-detail.component').then(
            (m) => m.MedicalPlanDetailComponent
          ),
      },
    ],
  },
];
