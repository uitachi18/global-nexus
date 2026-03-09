import { useEffect, useRef } from 'react';
import { useNexusStore } from './nexusStore';
import type { Flight, DisasterEvent, ISSPosition, AlertMessage } from './nexusStore';

const WS_URL = 'ws://localhost:8000/ws/live';
const RECONNECT_DELAY_MS = 3000;

interface FullUpdateMessage {
  type: 'FULL_UPDATE';
  flights?: Flight[];
  disasters?: DisasterEvent[];
  iss?: ISSPosition;
}

interface PongMessage {
  type: 'PONG';
}

type ServerMessage = FullUpdateMessage | PongMessage;

export function useDataStream(): void {
  const { setFlights, setDisasters, setISS, addAlert, setWsConnected } = useNexusStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = (): void => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected to Nexus backend');
        setWsConnected(true);
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        pingInterval.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('ping');
        }, 10_000);
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        try {
          const msg: ServerMessage = JSON.parse(event.data);
          if (msg.type === 'FULL_UPDATE') {
            if (msg.flights) setFlights(msg.flights);
            if (msg.disasters) {
              setDisasters(msg.disasters);
              msg.disasters
                .filter((d) => d.severity === 'HIGH')
                .forEach((d) => {
                  const alert: AlertMessage = {
                    id: d.id,
                    text: `[CRITICAL] ${d.title}`,
                    severity: 'HIGH',
                    timestamp: Date.now(),
                  };
                  addAlert(alert);
                });
            }
            if (msg.iss) setISS(msg.iss);
          }
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        if (pingInterval.current) clearInterval(pingInterval.current);
        console.log('[WS] Disconnected. Reconnecting in 3s…');
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      ws.onerror = () => ws.close();
    } catch {
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
    }
  };

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (pingInterval.current) clearInterval(pingInterval.current);
    };
  }, []);
}
