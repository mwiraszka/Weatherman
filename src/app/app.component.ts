import { Component } from '@angular/core'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  onClickVersion(): void {
    window.location.href = 'https://github.com/mwiraszka/Weatherman'
  }
}
