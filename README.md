# CommerceDashboard

> AI-Powered E-commerce Analytics Platform with Real-Time Business Insights

CommerceDashboard is a modern, full-stack analytics platform that leverages machine learning to provide actionable insights for e-commerce businesses. Track customer lifetime value, predict churn, forecast sales, and discover cross-selling opportunities—all in a beautiful, responsive interface.

## Features

### Core Analytics

- **Customer Lifetime Value (CLV) Prediction** - ML-based prediction of customer value with confidence scoring
- **Churn Analysis** - Identify at-risk customers with intelligent risk segmentation
- **Sales Forecasting** - Time-series based revenue predictions with trend analysis
- **Product Recommendations** - Market basket analysis for cross-sell and up-sell opportunities
- **Real-time Dashboard** - Live KPIs with customizable metrics and auto-refresh

### User Experience

- **Theme Customization** - Light/dark mode with customizable color palettes
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Interactive Visualizations** - Dynamic charts powered by Recharts
- **Modern UI Components** - 30+ polished components from Radix UI
- **Toast Notifications** - User-friendly feedback system

## Tech Stack

### Frontend
- **React 18.3** - Modern UI library
- **TypeScript 5.6** - Type-safe development
- **Vite 6.0** - Lightning-fast build tool
- **TailwindCSS 3.4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **TanStack Query 5.6** - Powerful data synchronization
- **Recharts 2.15** - Composable charting library
- **Wouter 3.3** - Minimalist routing

### Backend
- **Node.js** with ESM modules
- **Express 4.21** - Web application framework
- **TypeScript** - Full type safety
- **Drizzle ORM 0.39** - Type-safe database toolkit
- **Neon PostgreSQL** - Serverless database
- **Passport.js** - Authentication middleware

### Machine Learning
- **Custom TypeScript ML Engine** - In-app prediction models
- **Python/scikit-learn** - Advanced ML capabilities (optional)
- **Feature Engineering** - Automated extraction from customer data

## Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **PostgreSQL** database (Neon recommended)
- **Python 3.8+** (optional, for advanced ML features)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Xivlon/CommerceDashboard.git
   cd CommerceDashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@host/database
   NODE_ENV=development
   SESSION_SECRET=your-secret-key-here
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Seed sample data** (optional)
   ```bash
   npx tsx server/seed.ts
   ```

## Development

### Start the development server

```bash
npm run dev
```

This starts both the Vite dev server (frontend) and Express API (backend) concurrently.

- Frontend: http://localhost:5000
- Backend API: http://localhost:5000/api

### Type checking

```bash
npm run check
```

### Project Structure

```
CommerceDashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ml/       # ML-specific components
│   │   │   └── ui/       # Base UI components (Radix)
│   │   ├── pages/        # Route pages
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and API client
│   │   └── App.tsx       # Root component
│   └── index.html
├── server/                # Express backend
│   ├── ml/               # Python ML models
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Database layer
│   ├── ml-engine.ts      # TypeScript ML engine
│   └── db.ts             # Database connection
├── shared/               # Shared types/schema
│   └── schema.ts         # Drizzle schema definitions
└── package.json
```

## Deployment

### Production Build

```bash
npm run build
```

This creates:
- `dist/` - Bundled frontend assets
- `dist/index.js` - Bundled backend server

### Start Production Server

```bash
npm start
```

### Static Deployment

For static hosting (frontend-only demo mode), see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Platform Support

- **Replit** - Native support with `.replit` configuration
- **Vercel/Netlify** - Frontend static deployment
- **Railway/Render** - Full-stack deployment
- **Cloudflare Workers** - Edge deployment (via `src/index.js`)

## API Endpoints

### Customer Data
```
GET  /api/customers          # List all customers
GET  /api/customers/:id      # Get single customer
```

### ML Predictions
```
GET  /api/predictions/clv    # Customer lifetime value predictions
POST /api/predictions/clv/generate

GET  /api/predictions/churn  # Churn risk analysis
POST /api/predictions/churn/analyze

GET  /api/forecast/sales     # Sales forecasts
GET  /api/recommendations/products
POST /api/recommendations/generate
```

### Dashboard
```
GET  /api/dashboard/metrics  # KPI summary
GET  /api/dashboard/insights # ML-generated insights
GET  /api/sales-metrics      # Historical sales data
```

### ML Operations
```
POST /api/ml/retrain         # Retrain ML models
```

## Machine Learning

The platform includes two ML implementations:

1. **TypeScript ML Engine** (default)
   - Fast, in-process predictions
   - Algorithmic models for CLV, churn, and forecasting
   - No external dependencies

2. **Python/scikit-learn** (optional)
   - Advanced RandomForest models
   - Pre-trained churn prediction model
   - Requires Python environment

### Training Models

To train the Python churn model:

```bash
cd server/ml
python train_churn_model.py
```

## Configuration

### Database Schema

Managed by Drizzle ORM. Schema defined in `shared/schema.ts`.

To push schema changes:
```bash
npm run db:push
```

### Theme Customization

Themes are configured in:
- `tailwind.config.ts` - Color system
- `client/src/App.tsx` - Theme provider
- `client/src/index.css` - CSS variables

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- TypeScript with strict mode enabled
- Functional React components with hooks
- ESLint and Prettier (configurations coming soon)

## Security

- Never commit `.env` files or secrets
- Use environment variables for all sensitive data
- Database credentials should use connection pooling
- Session secrets should be cryptographically random

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- [Radix UI](https://radix-ui.com) - Accessible component primitives
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS framework
- [Recharts](https://recharts.org) - React charting library
- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
- [Neon](https://neon.tech) - Serverless PostgreSQL

---

**Built with ❤️ for the e-commerce analytics community**
