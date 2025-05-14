import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  {
    path: 'home', loadComponent: () => import('./home/home.page').then((m) => m.HomePage)
  },
  {
    path: '', redirectTo: 'home', pathMatch: 'full',
  },
  {
    path: 'layout', loadComponent: () => import('./home/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'details',
        loadComponent: () => import('./home/details/details.component').then((m) => m.DetailsComponent),
      }
    ]
  },
  {
    path: 'details', loadComponent: () => import('./home/details/details.component').then((m) => m.DetailsComponent)
  },
];
