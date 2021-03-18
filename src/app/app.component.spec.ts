import { TestBed, waitForAsync } from '@angular/core/testing';
import { createComponentMock } from 'angular-unit-test-helper';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          AppComponent,
          createComponentMock('CurrentWeatherComponent'),
        ]
      }).compileComponents();
   })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
