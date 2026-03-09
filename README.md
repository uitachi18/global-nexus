# Global Nexus Tracker

**Global Nexus Tracker** is a state-of-the-art, real-time planetary data streaming and visualization platform. It provides a comprehensive "command center" view of global activity, including air traffic, seismic events, and orbital telemetry.

---

## 👤 Project Creator
**Created by: Gaurav**

---

## 🚀 Key Features

- **Real-time Flight Tracking**: Monitor global air traffic with live updates on altitude, velocity, and callsigns (via OpenSky API).
- **International Space Station (ISS) Telemetry**: Track the current orbital position and altitude of the ISS in real-time.
- **Global Disaster Monitoring**: Stay informed about natural disasters, seismic activities, and environmental threats (via NASA EONET).
- **Interactive Geospatial Visualization**: High-performance 3D/2D globe integration with dynamic data layers.
- **AI Intelligence Feed**: Real-time regional news and telemetry data indexed by geographical sectors.
- **Premium Maker Aesthetic**: A high-tech, futuristic "cyber-commander" interface with neon accents and technical grid overlays.

---

## 🛠️ Technology Stack

### **Backend (Data & Logic Engine)**
- **Language**: Python
- **Framework**: FastAPI (High-performance asynchronous web framework)
- **Real-time Streaming**: WebSockets (Bidirectional communication for live data pushes)
- **Caching**: Redis (For high-speed data retrieval and API rate limit management)
- **Web Server**: Uvicorn

### **Frontend (Visual Command Center)**
- **Language**: TypeScript / JavaScript
- **Framework**: React.js with Vite (Lightning-fast development and build cycles)
- **Styling**: Tailwind CSS (Utility-first styling for precise UI control)
- **Visualization**: MapLibre GL & Deck.gl (For high-performance geospatial rendering)
- **Icons**: Lucide React
- **State Management**: Zustand

---

## 📊 Detailed Project Report

### **Architecture Overview**
The project follows a modern decoupled architecture. The **Python Backend** acts as a data aggregator, periodically fetching information from multiple global APIs (OpenSky, NASA, NewsData). It utilizes a **Redis Caching** layer to ensure rapid response times and to minimize redundant external API calls. Data is streamed to the frontend via **WebSockets**, ensuring that the "Nexus" dashboard reflects the state of the planet in near real-time.

### **The Design System**
Global Nexus employs a custom "Maker-style" design system. The UI is built on a deep-navy "void" background (`#070B14`) with high-contrast "nx-cyan" (`#00E5FF`) and "nx-lime" (`#CCFF00`) accents. This aesthetic is designed to evoke the feeling of a high-security global monitoring station, complete with scanlines, technical grids, and responsive data panels.

### **Scalability & Security**
The system is built for scalability, utilizing asynchronous I/O in the backend to handle multiple data streams simultaneously. Security is prioritized through the use of environment-based configuration, ensuring sensitive API credentials are never exposed in the source code or version control.

---

## 🛠️ Local Setup

1. **Backend**:
   - Create a virtual environment: `python -m venv venv`
   - Install dependencies: `pip install -r requirements.txt`
   - Copy `.env.example` to `.env` and add your API keys.
   - Run: `uvicorn app.main:app --reload`

2. **Frontend**:
   - Install dependencies: `npm install`
   - Run: `npm run dev`

---

© 2026 Global Nexus - All Rights Reserved.
