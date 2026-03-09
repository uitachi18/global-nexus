import { create } from 'zustand';

export interface Flight {
  icao: string;
  callsign: string;
  origin_country: string;
  lon: number;
  lat: number;
  altitude: number;
  velocity: number;
  heading: number;
  on_ground: boolean;
}

export interface DisasterEvent {
  id: string;
  type: string;
  title: string;
  lon: number;
  lat: number;
  magnitude: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  color: [number, number, number];
  url: string;
  time: number;
}

export interface ISSPosition {
  id: string;
  name: string;
  lat: number;
  lon: number;
  altitude: number;
}

export interface HoverInfo {
  x: number;
  y: number;
  object: Flight | DisasterEvent | ISSPosition;
  layer: 'flight' | 'disaster' | 'iss';
}

export interface AlertMessage {
  id: string;
  text: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: number;
}

export interface CountryInfo {
  name: string;
  official: string;
  cca2: string;
  cca3: string;
  region: string;
  subregion: string;
  capital: string;
  population: number;
  area: number;
  currencies: string;
  languages: string[];
  timezones: string[];
  borders: string[];
  flag_svg: string;
  flag_png: string;
  flag_alt: string;
  lat: number;
  lon: number;
  map_url: string;
  independent: boolean;
  un_member: boolean;
  gini: number | null;
  calling_code: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  published: string;
  image: string | null;
}

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  transitionDuration?: number;
}

interface NexusState {
  // Live data
  flights: Flight[];
  disasters: DisasterEvent[];
  iss: ISSPosition | null;
  alerts: AlertMessage[];

  // Interaction state
  hoverInfo: HoverInfo | null;
  selectedCountry: CountryInfo | null;
  countryNews: NewsArticle[];
  countryLoading: boolean;
  clickedLatLon: [number, number] | null;

  // Map
  searchQuery: string;
  viewState: ViewState;
  wsConnected: boolean;

  // Actions
  setFlights: (f: Flight[]) => void;
  setDisasters: (d: DisasterEvent[]) => void;
  setISS: (iss: ISSPosition | null) => void;
  addAlert: (alert: AlertMessage) => void;
  setHoverInfo: (info: HoverInfo | null) => void;
  setSelectedCountry: (c: CountryInfo | null) => void;
  setCountryNews: (news: NewsArticle[]) => void;
  setCountryLoading: (l: boolean) => void;
  setClickedLatLon: (pos: [number, number] | null) => void;
  setSearchQuery: (q: string) => void;
  flyTo: (lon: number, lat: number, zoom?: number) => void;
  setWsConnected: (c: boolean) => void;
}

export const useNexusStore = create<NexusState>((set) => ({
  flights: [],
  disasters: [],
  iss: null,
  alerts: [],
  hoverInfo: null,
  selectedCountry: null,
  countryNews: [],
  countryLoading: false,
  clickedLatLon: null,
  searchQuery: '',
  wsConnected: false,
  viewState: {
    longitude: 10,
    latitude: 20,
    zoom: 2,
    pitch: 0,
    bearing: 0,
  },

  setFlights: (flights) => set({ flights }),
  setDisasters: (disasters) => set({ disasters }),
  setISS: (iss) => set({ iss }),
  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 50) })),
  setHoverInfo: (hoverInfo) => set({ hoverInfo }),
  setSelectedCountry: (selectedCountry) => set({ selectedCountry }),
  setCountryNews: (countryNews) => set({ countryNews }),
  setCountryLoading: (countryLoading) => set({ countryLoading }),
  setClickedLatLon: (clickedLatLon) => set({ clickedLatLon }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  flyTo: (lon, lat, zoom = 5) =>
    set({
      viewState: { longitude: lon, latitude: lat, zoom, pitch: 0, bearing: 0, transitionDuration: 1800 },
    }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
}));
