# SportSync ⚽

A comprehensive sports management system featuring real-time auction bidding and full tournament management.

## Modules

### 🏷️ Auction Module
- CSV-based player import
- Real-time WebSocket bidding with 30-second countdown
- Up to 8 team owners competing for players
- Automatic unsold player distribution

### 🏆 Tournament Module
- **Single Phase:** 8-team round-robin → top 4 knockout → champion
- **Double Phase:** 8 groups × 8 teams → 8 group winners → final tournament
- Live points table, top scorers, top assisters
- Full match event tracking (goals, assists, minutes)

<!--
### 🏏 Cricket Module
- Real-time ball-by-ball live scoring cockpit
- Complete Innings and Super Over management
- Net Run Rate (NRR) standings updates
- Custom stats tracking (Top Run Scorers, Top Wicket Takers)
-->

## Tech Stack

| Layer    | Technology              |
|----------|------------------------|
| Frontend | React 18 + Vite        |
| Backend  | Spring Boot 3 + Java   |
| Database | MySQL 8                |
| Realtime | WebSocket (STOMP/SockJS)|
| Styling  | TailwindCSS            |

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8
- Maven 3.9+

### Backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Build Order

| Step | Feature                    | Branch                          |
|------|----------------------------|---------------------------------|
| 1    | Project Scaffold           | `feature/step-1-scaffold`       |
| 2    | CSV Player Import          | `feature/step-2-csv-import`     |
| 3    | Auction Room               | `feature/step-3-auction-room`   |
| 4    | Auction WebSocket          | `feature/step-4-auction-websocket` |
| 5    | Unsold Distribution        | `feature/step-5-unsold-distribution` |
| 6    | Frontend Auction           | `feature/step-6-frontend-auction` |
| 7    | Tournament Setup           | `feature/step-7-tournament-setup` |
| 8    | Match Result Entry         | `feature/step-8-match-result`   |
| 9    | Knockout Generation        | `feature/step-9-knockout`       |
| 10   | Tournament End             | `feature/step-10-tournament-end` |
| 11   | Frontend Tournament        | `feature/step-11-frontend-tournament` |
| 12   | Double Phase               | `feature/step-12-double-phase`  |
<!-- | 13   | Cricket Support            | `feature/step-13-cricket`       | -->

## License

Private project — all rights reserved.
