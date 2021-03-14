import { Observable, of } from 'rxjs';

import { ICurrentWeather } from '../interfaces';
import { IWeatherService } from './weather.service';

export const fakeWeather: ICurrentWeather = {
  city: 'Toronto',
  country: 'Canada',
  date: 1485789600,
  image: '',
  temperature: 500, // Kelvin
  description: 'apocalypse'
};

export class WeatherServiceFake implements IWeatherService {
  public getCurrentWeather(city: string, country: string): Observable<ICurrentWeather> {
    return of(fakeWeather);
  }
}
