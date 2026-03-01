import { Routes } from '@angular/router';
import { LicenseSearchComponent } from './components/license-search/license-search.component';
import { CreateLicenseComponent } from './components/create-license/create-license.component';

export const routes: Routes = [
  { path: '', redirectTo: '/search', pathMatch: 'full' },
  { path: 'search', component: LicenseSearchComponent },
  { path: 'create', component: CreateLicenseComponent },
  { path: '**', redirectTo: '/search' }
];
