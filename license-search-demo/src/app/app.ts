import { Component } from '@angular/core';
import { LicenseSearchComponent } from './components/license-search/license-search.component';

@Component({
  selector: 'app-root',
  imports: [LicenseSearchComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
