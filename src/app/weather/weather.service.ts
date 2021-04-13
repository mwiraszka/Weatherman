import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import AllCountryCodes from '../../assets/all-country-codes.json'
import { environment } from '../../environments/environment'
import { ICurrentWeather } from '../interfaces'
import { PostalCodeService } from '../postal-code/postal-code.service'
import { TimezoneService } from '../timezone/timezone.service'

export interface ICurrentWeatherData {
  weather: [{ description: string; icon: string }]
  main: { temp: number }
  sys: { country: string }
  dt: number
  name: string
}

interface Coordinates {
  latitude: number
  longitude: number
}

export interface IWeatherService {
  // Methods imported and used in city search component
  readonly currentWeather$: BehaviorSubject<ICurrentWeather>
  getCurrentWeather(search: string, country?: string): Observable<ICurrentWeather>
  getCurrentWeatherByCoords(coords: Coordinates): Observable<ICurrentWeather>
}

@Injectable({ providedIn: 'root' })
export class WeatherService implements IWeatherService {
  // Initialize behavior subject with some dummy data
  readonly currentWeather$ = new BehaviorSubject<ICurrentWeather>({
    city: 'New New York',
    country: 'Planet Earth',
    date: Date.now(),
    utcOffset: null,
    image: '../../assets/img/sunny.svg',
    temperature: 99,
    description: "it's cozy.",
  })

  constructor(
    private httpClient: HttpClient,
    private postalCodeService: PostalCodeService,
    private timezoneService: TimezoneService
  ) {}

  getCurrentWeather(searchText: string, country?: string): Observable<ICurrentWeather> {
    // If imported resolvePostalCode method does not return null, i.e. the User's input
    // was found to be a valid postal code, use the supplied latitude and longitude values
    // supplied by the GeoNames API as the parameters with which to query OpenWeatherMap.
    // No valid postcode will ever include commas, so we can be sure that ('searchText')
    // will be the full postcode. Otherwise, query OpenWeatherMap with the text assumed to
    // include the city name (with a separate 'country' param if a comma was inputted).
    return this.postalCodeService.resolvePostalCode(searchText).pipe(
      switchMap((postalCode) => {
        if (postalCode) {
          return this.getCurrentWeatherByCoords({
            latitude: postalCode.lat,
            longitude: postalCode.lng,
          } as Coordinates)
        } else {
          const uriParams = new HttpParams().set(
            'q',
            country ? `${searchText},${country}` : searchText
          )
          return this.getCurrentWeatherHelper(uriParams)
        }
      })
    )
  }

  getCurrentWeatherByCoords(coords: Coordinates): Observable<ICurrentWeather> {
    // Convert the longitude and latitude parameters retrieved from GeoNames to string
    // values understood by OpenWeatherMap
    const uriParams = new HttpParams()
      .set('lat', coords.latitude.toString())
      .set('lon', coords.longitude.toString())
    return this.getCurrentWeatherHelper(uriParams)
  }

  updateCurrentWeather(search: string, country?: string): void {
    // Subscribe to new weather data stream with every new search (i.e. every 0.5 seconds
    // with the currently implemented type-ahead feature)
    this.getCurrentWeather(search, country).subscribe((weather) =>
      this.currentWeather$.next(weather)
    )
  }

  private getCurrentWeatherHelper(uriParams: HttpParams): Observable<ICurrentWeather> {
    // Use https base URL when in production so as to avoid mixed content issues; query
    // with the prepared set of parameters (whether that's longitude and latitude derived
    // from the postcode, or city & country name)
    uriParams = uriParams.set('appid', environment.appId)
    return this.httpClient
      .get<ICurrentWeatherData>(
        `${environment.baseUrl}api.openweathermap.org/data/2.5/weather`,
        { params: uriParams }
      )
      .pipe(map((data) => this.transformToICurrentWeather(data)))
  }

  private transformToICurrentWeather(data: ICurrentWeatherData): ICurrentWeather {
    // Attempt to map two-letter country code to a full country name; if somehow unable
    // to find the code, simply use the code as the country name
    const countryObj: any = AllCountryCodes.find(
      (country) => country.Code === data.sys.country
    )

    // Change description to match grammar of sentence 'Weatherman says...'
    let desc = ''
    switch (data.weather[0].description) {
      case 'clear sky':
        desc = 'clear skies!'
        break
      case 'snow':
        desc = "it's snowing."
        break
      case 'few clouds':
        desc = "it's just a little cloudy."
        break
      case 'overcast clouds':
        desc = 'there are some overcast clouds.'
        break
      case 'light rain':
      case 'moderate rain':
        desc = "it's going to rain some."
        break
      default:
        desc = data.weather[0].description + '.'
    }

    // Get UTC offset of this location, using both city name and country name; find the
    // timezone that by finding the number that's common between the two
    const cityOffsets = this.timezoneService.getUtcOffsetForLocation(data.name)
    const countryOffsets = data.sys.country
      ? this.timezoneService.getUtcOffsetForLocation(data.sys.country)
      : cityOffsets
    const utcOffsetMatches = cityOffsets.filter((value) => countryOffsets.includes(value))

    // Transform UTC offset number to string if not 0 or faulty; add '+' if positive
    const utcOffset =
      utcOffsetMatches.length > 1 || utcOffsetMatches[0] === 0
        ? null
        : utcOffsetMatches[0] < 0
        ? utcOffsetMatches.toString()
        : '+' + utcOffsetMatches.toString()

    // Convert OpenWeatherMap's server's timestamp from s to ms to be able to use with
    // JS Date() function; retrieve weather icon image using URL based on icon name
    return {
      city: data.name,
      country: countryObj ? countryObj.Name : data.sys.country,
      date: (data.dt + 3600) * 1000,
      utcOffset,
      image: `http://openweathermap.org/img/w/${data.weather[0].icon}.png`,
      temperature: this.convertKelvinToCelsius(data.main.temp),
      description: desc,
    }
  }

  private convertKelvinToCelsius(kelvin: number): number {
    return kelvin - 273.15
  }
}
