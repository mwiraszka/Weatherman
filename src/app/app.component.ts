import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div style="text-align:center">
      <mat-toolbar color="primary">
        <span>Weatherman</span>
      </mat-toolbar>
      <h3>Forecasting the weather. Saving lives.</h3>
      <h2>Current Weather</h2>
      <app-current-weather></app-current-weather>
    </div>
  `
})
export class AppComponent {}
