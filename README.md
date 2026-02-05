# Warehouse Nexus - Mobile Frontend

A modern, mobile-first Progressive Web App for warehouse workers built with React, TypeScript, and Tailwind CSS.

## Features

- ✅ **Mobile-First Design** - Optimized for phones and tablets
- ✅ **Offline Support** - Works without internet, syncs when reconnected  
- ✅ **Progressive Web App** - Installable on mobile devices
- ✅ **Real-Time Alerts** - Notifications for offline/online status
- ✅ **Modern UI** - Clean, professional interface with Tailwind CSS
- ✅ **Type-Safe** - Full TypeScript support

## Core Functionality

### For Warehouse Workers

1. **Receive Stock** - Record incoming inventory with multi-line support
2. **Ship Stock** - Process outgoing shipments
3. **Stock Lookup** - Quick product search and inventory check
4. **Dashboard** - Overview of recent activity and quick actions

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Vite PWA Plugin** - Progressive Web App support

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## API Configuration

The frontend connects to the Warehouse Nexus backend API. Ensure the backend is running on the configured `VITE_API_URL`.

Default API endpoint: `http://localhost:8000/api/v1`

## Mobile Usage

### Install as App (PWA)

On mobile browsers (Chrome, Safari):
1. Open the app in your browser
2. Tap the "Add to Home Screen" button
3. The app will install like a native app
4. Launch from your home screen

### Offline Mode

The app automatically:
- Detects when you're offline
- Shows a red banner at the top
- Allows you to continue working (read operations)
- Queues changes to sync when reconnected

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Layout.tsx    # Main layout with navigation
│   └── OfflineAlert.tsx # Offline detection banner
├── pages/            # Page components
│   ├── Dashboard.tsx
│   ├── ReceiveStock.tsx
│   ├── ShipStock.tsx
│   └── StockLookup.tsx
├── types/            # TypeScript type definitions
│   └── warehouse.ts
├── config/           # Configuration files
│   └── api.ts        # Axios instance & API config
├── App.tsx           # Root component with routing
├── main.tsx          # Entry point
└── index.css         # Global styles

## Mobile Optimization

- **Touch-Friendly** - Large tap targets (min 44x44px)
- **Responsive Design** - Works on all screen sizes
- **Bottom Navigation** - Easy thumb access
- **Fast Loading** - Code splitting and lazy loading
- **Offline First** - Service worker caching

## Browser Support

- Chrome/Edge (latest)
- Safari (iOS 12+)
- Firefox (latest)
- Samsung Internet

## Development

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/Layout.tsx`

### API Integration

Use React Query hooks for server state:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../config/api';

// Fetch data
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const response = await api.get('/products/');
    return response.data;
  },
});

// Mutate data
const mutation = useMutation({
  mutationFn: async (payload) => {
    const response = await api.post('/stock-documents/', payload);
    return response.data;
  },
});
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

### Docker

```bash
docker build -t warehouse-frontend .
docker run -p 80:80 warehouse-frontend
```

## Contributing

1. Create feature branch
2. Make changes
3. Test on mobile devices
4. Submit pull request

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.
