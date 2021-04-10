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
    Validators.pattern('^[a-zA-Z0-9,. ]*$'),
  ])

  constructor(private weatherService: WeatherService) {
    this.search.valueChanges
      .pipe(
        debounceTime(500),
        filter(() => !this.search.invalid),
        tap((searchValue: string) => this.doSearch(searchValue))
      )
      .subscribe()
  }

  doSearch(searchValue: string): void {
    const userInput = searchValue.split(',').map((s) => s.trim())
    const searchText = userInput[0]
    const country = userInput.length > 1 ? userInput[1] : undefined
    this.weatherService.updateCurrentWeather(searchText, country)
  }

  getErrorMessage(): string {
    if (this.search.hasError('minlength')) {
      return 'Please input more than one character'
    } else if (this.search.hasError('pattern')) {
      return 'Please input a valid city name or postcode'
    } else {
      return ''
    }
  }
}
