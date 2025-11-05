interface WeatherMain {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
}
interface WeatherWind {
    speed: number;
}
interface WeatherDescription {
    main: string;
    description: string;
    icon: string;
}
interface WeatherListItem {
    dt: number;
    main: WeatherMain;
    weather: WeatherDescription[];
    wind: WeatherWind;
}
interface CityInfo {
    name: string;
    sunrise: number;
    sunset: number;
    coord: {
        lat: number;
        lon: number;
    };
}
export interface ForecastData {
    cod: string;
    city: CityInfo;
    list: WeatherListItem[];
}
export {};
//# sourceMappingURL=main.d.ts.map