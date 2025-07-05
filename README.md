# Personal Finance Visualizer

A simple web application for tracking personal finances.

## Stack
- Next.js
- React
- shadcn/ui
- Recharts
- MongoDB (Atlas)

## Features
- Add, edit, and delete transactions
- Transaction list view
- Monthly expenses bar chart
- Category-wise pie chart
- Dashboard with summary cards and recent transactions
- Set monthly category budgets and compare with actual spending

## Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root with your MongoDB URI:
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment
- Deploy easily on [Vercel](https://vercel.com/)
- Add your environment variables in the Vercel dashboard

## License
MIT
