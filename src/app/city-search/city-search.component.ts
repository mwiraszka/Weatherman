import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { debounceTime, filter, tap } from 'rxjs/operators'

import { WeatherService } from '../weather/weather.service'

@Component({
  selector: 'app-city-search',
  templateUrl: './city-search.component.html',
})
export class CitySearchComponent {
  search = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(40),
    Validators.pattern('^[a-zA-Z0-9,.– -]*$'),
  ])

  // Wait 0.5s between keyups to emit next value; only emit if form validators pass;
  // send value to doSearch method as a side effect (use tap operator so that subscription
  // persists); initialize location as London, Canada
  constructor(private weatherService: WeatherService) {
    this.search.valueChanges
      .pipe(
        debounceTime(500),
        filter(() => !this.search.invalid),
        tap((searchValue: string) => this.doSearch(searchValue))
      )
      .subscribe()
    this.weatherService.updateCurrentWeather('London', 'CA')
  }

  doSearch(searchValue: string): void {
    // Check for comma char; if exists, split at the comma and trim white
    // space and store everything after the comma as the country name
    const userInput = searchValue.split(',').map((s) => s.trim())
    const searchText = userInput[0]
    const country = userInput.length > 1 ? userInput[1] : undefined
    this.weatherService.updateCurrentWeather(searchText, country)
  }

  getErrorMessage(): string {
    if (this.search.hasError('maxlength')) {
      return 'Please try a shorter input'
    } else if (this.search.hasError('pattern') || this.search.hasError('minlength')) {
      return 'Please input a valid city name or postal code'
    } else {
      return ''
    }
  }
}
