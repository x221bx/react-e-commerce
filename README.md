# Farm Vet E-Shop
Full-stack commerce app for farm/vet products with multi-language support (AR/EN), Firestore/Firebase auth, Paymob/PayPal payments, and an admin CMS for products, orders, and articles.

## Tech Stack
- React + Vite, Redux Toolkit, Formik/Yup, React-i18next (RTL ready)
- Firebase Auth + Firestore (products, orders, users, articles)
- Payments: Paymob (cards/wallet), PayPal
- Styling: Tailwind + design tokens (`src/theme/tokens.css`) + shared UI primitives (`src/components/ui`)

## Getting Started
```bash
npm install
npm run dev
```

### Environment
Copy `.env.example` to `.env` and set:
- `VITE_FIREBASE_*` (project config)
- `VITE_PAYPAL_CLIENT_ID`, `VITE_PAYPAL_CURRENCY`
- Paymob: `PAYMOB_API_BASE`, `PAYMOB_API_KEY`, `PAYMOB_IFRAME_ID`, `PAYMOB_CARD_INTEGRATION_ID`, `PAYMOB_WALLET_INTEGRATION_ID`, `PAYMOB_HMAC`
- Optional AI: `VITE_OR_KEY` (OpenRouter), `VITE_GEMINI_API_KEY`

## Key Features
- Catalog with filters, favorites, cart, checkout (Paymob/PayPal)
- Auth flows (email/password + Google), password reset, account dashboard
- Orders: history, tracking, invoices; admin order management
- Articles/blog with AI helpers (draft/rewrite/SEO), favorites
- Admin: products, categories, orders, articles, users; delivery dashboard

## Design System (quick reference)
- Tokens: `src/theme/tokens.css` (colors, radii, shadows, spacing, typography)
- Global styles: `src/index.css`
- UI primitives: `src/components/ui` (Section, Card, Badge, EmptyState, Skeleton, LoadingGrid, etc.)
Use these before introducing new styles to keep the UI consistent.

## Payments
- Real charges flow only through Paymob/PayPal during checkout.
- Saved cards in Account are informational for quick selection; they are not charged directly.

## Firestore Notes
- Ensure required indexes exist (check console error links during dev).
- Security rules must allow the expected reads/writes for authenticated users and admins.

## Scripts
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run lint` - lint

## Deployment
- Vite static output (`npm run build`) can be hosted on Firebase Hosting or any static host.

## License
See [COPYRIGHT.md](COPYRIGHT.md).
