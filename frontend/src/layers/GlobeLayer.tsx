import { useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer } from 'deck.gl';
import { BitmapLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { MapView } from '@deck.gl/core';
import type { Layer, PickingInfo } from '@deck.gl/core';
import { useNexusStore } from '../store/nexusStore';
import type { Flight, DisasterEvent, ISSPosition } from '../store/nexusStore';

const CARTO_DARK_TILE_URL =
  'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png';

const INITIAL_VIEW_STATE = {
  longitude: 10,
  latitude: 20,
  zoom: 2.2,
  pitch: 0,
  bearing: 0,
  maxZoom: 18,
  minZoom: 1.2,
};

const API_BASE = 'http://localhost:8000/api/v1';

async function reverseGeocode(lat: number, lon: number): Promise<{ country: string; code: string } | null> {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'User-Agent': 'GlobalNexusTracker/1.0' } }
    );
    const data = await resp.json();
    const address = data.address || {};
    const country = address.country || null;
    const code = address.country_code?.toUpperCase() || null;
    if (country && code) return { country, code };
  } catch { /* ignore */ }
  return null;
}

async function fetchCountryData(code: string, name: string) {
  const { setSelectedCountry, setCountryNews, setCountryLoading } = useNexusStore.getState();
  setCountryLoading(true);
  try {
    const [countryResp, newsResp] = await Promise.all([
      fetch(`${API_BASE}/country/${code}`),
      fetch(`${API_BASE}/news/${code}?country_name=${encodeURIComponent(name)}`),
    ]);
    if (countryResp.ok) setSelectedCountry(await countryResp.json());
    if (newsResp.ok) {
      const newsData = await newsResp.json();
      setCountryNews(newsData.data || []);
    }
  } catch (e) {
    console.error('[Country] Fetch error:', e);
  } finally {
    setCountryLoading(false);
  }
}

export const GlobeLayer: React.FC = () => {
  const {
    flights, disasters, iss,
    viewState, hoverInfo, clickedLatLon,
    setHoverInfo, setClickedLatLon,
  } = useNexusStore();

  const deckViewState = { ...INITIAL_VIEW_STATE, ...viewState };

  const layers = useMemo(() => {
    const allLayers: Layer[] = [];

    // 1. CartoDB Dark base tiles
    allLayers.push(
      new TileLayer({
        id: 'carto-dark-tiles',
        data: CARTO_DARK_TILE_URL,
        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,
        renderSubLayers: (props: any) => {
          const { west, south, east, north } = props.tile.bbox;
          return new BitmapLayer(props, {
            data: undefined,
            image: props.data,
            bounds: [west, south, east, north] as [number, number, number, number],
          });
        },
      })
    );

    // 2. Click marker
    if (clickedLatLon) {
      allLayers.push(
        new ScatterplotLayer({
          id: 'click-marker',
          data: [{ lon: clickedLatLon[1], lat: clickedLatLon[0] }],
          getPosition: (d: any) => [d.lon, d.lat, 0],
          getRadius: 80000,
          getFillColor: [204, 255, 0, 60],
          getLineColor: [204, 255, 0, 255],
          stroked: true,
          lineWidthMinPixels: 2,
          radiusMinPixels: 10,
          radiusMaxPixels: 30,
        })
      );
      // Crosshair ring
      allLayers.push(
        new ScatterplotLayer({
          id: 'click-ring',
          data: [{ lon: clickedLatLon[1], lat: clickedLatLon[0] }],
          getPosition: (d: any) => [d.lon, d.lat, 0],
          getRadius: 300000,
          getFillColor: [204, 255, 0, 0],
          getLineColor: [204, 255, 0, 120],
          stroked: true,
          filled: false,
          lineWidthMinPixels: 1,
          radiusMinPixels: 18,
          radiusMaxPixels: 55,
        })
      );
    }

    // 3. Flights — neon lime dots
    if (flights.length > 0) {
      allLayers.push(
        new ScatterplotLayer<Flight>({
          id: 'flights',
          data: flights,
          getPosition: (d) => [d.lon, d.lat, 0],
          getRadius: 5000,
          getFillColor: [204, 255, 0, 220],
          opacity: 0.9,
          pickable: true,
          onHover: (info) =>
            setHoverInfo(
              info.object
                ? { x: info.x, y: info.y, object: info.object, layer: 'flight' }
                : null
            ),
          radiusMinPixels: 1.5,
          radiusMaxPixels: 5,
        })
      );
    }

    // 4. Disasters — color-coded severity
    if (disasters.length > 0) {
      allLayers.push(
        new ScatterplotLayer<DisasterEvent>({
          id: 'disasters',
          data: disasters,
          getPosition: (d) => [d.lon, d.lat, 0],
          getRadius: (d) => Math.pow(10, (d.magnitude || 5) * 0.45) * 5000,
          getFillColor: (d) => [...d.color, 140] as [number, number, number, number],
          getLineColor: (d) => [...d.color, 255] as [number, number, number, number],
          opacity: 0.95,
          pickable: true,
          stroked: true,
          lineWidthMinPixels: 1.5,
          onHover: (info) =>
            setHoverInfo(
              info.object
                ? { x: info.x, y: info.y, object: info.object, layer: 'disaster' }
                : null
            ),
          radiusMinPixels: 5,
          radiusMaxPixels: 40,
        })
      );
    }

    // 5. ISS — cyan
    if (iss) {
      allLayers.push(
        new ScatterplotLayer<ISSPosition>({
          id: 'iss',
          data: [iss],
          getPosition: (d) => [d.lon, d.lat, 0],
          getRadius: 60000,
          getFillColor: [100, 200, 255, 255],
          opacity: 1,
          radiusMinPixels: 8,
          radiusMaxPixels: 16,
          pickable: true,
          stroked: true,
          getLineColor: () => [100, 200, 255, 200] as [number, number, number, number],
          lineWidthMinPixels: 2,
          onHover: (info) =>
            setHoverInfo(
              info.object
                ? { x: info.x, y: info.y, object: info.object, layer: 'iss' }
                : null
            ),
        })
      );
      // ISS label
      allLayers.push(
        new TextLayer<ISSPosition>({
          id: 'iss-label',
          data: [iss],
          getPosition: (d) => [d.lon, d.lat, 0],
          getText: () => 'ISS',
          getColor: [100, 200, 255, 255],
          getSize: 11,
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          getPixelOffset: [0, -18],
        })
      );
    }

    return allLayers;
  }, [flights, disasters, iss, clickedLatLon]);

  const handleMapClick = async (info: PickingInfo) => {
    // If clicked on a data point, don't do country lookup
    if (info.object) return;
    if (!info.coordinate) return;

    const [lon, lat] = info.coordinate as [number, number];
    setClickedLatLon([lat, lon]);

    const geo = await reverseGeocode(lat, lon);
    if (geo) {
      await fetchCountryData(geo.code, geo.country);
    }
  };

  return (
    <div className="absolute inset-0 z-0">
      <DeckGL
        views={new MapView({ repeat: true })}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={deckViewState.transitionDuration ? deckViewState : undefined}
        controller={{ scrollZoom: true, dragPan: true, dragRotate: false, doubleClickZoom: true, touchZoom: true }}
        layers={layers}
        getCursor={({ isDragging, isHovering }) =>
          isDragging ? 'grabbing' : isHovering ? 'crosshair' : 'crosshair'
        }
        onClick={handleMapClick}
        style={{ background: '#070B14' }}
        onViewStateChange={({ viewState: vs }: { viewState: Record<string, unknown> }) => {
          useNexusStore.setState({ viewState: { ...(vs as any), transitionDuration: 0 } });
        }}
      />
    </div>
  );
};
