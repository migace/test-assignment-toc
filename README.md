# TOC (Table of Contents) Application

A React-based Table of Contents application built with TypeScript, Vite, and modern web technologies. This application provides a hierarchical navigation interface with search functionality, expandable/collapsible sections, and smooth animations.

## Features

- **Hierarchical Navigation**: Multi-level table of contents with expandable/collapsible sections
- **Search Functionality**: Filter TOC items by typing search queries
- **Smooth Animations**: Framer Motion animations for expanding/collapsing sections
- **Responsive Design**: Clean, modern UI with proper styling
- **TypeScript**: Full type safety and better development experience
- **React Query**: Efficient data fetching and caching

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules
- **Animations**: Framer Motion
- **Data Fetching**: TanStack React Query
- **Testing**: Vitest + React Testing Library
- **Mocking**: MSW (Mock Service Worker)

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager

## Installation

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone https://github.com/migace/test-assignment-toc.git
   cd test-assignment-toc
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Project

### Development Mode

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Build for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:ui
```

### Run Tests Once

```bash
npm run test:run
```

### Run Specific Test File

```bash
npm test -- --run src/components/TOC/TOCItem.test.tsx
```

## Project Structure

```
src/
├── api/           # API functions
├── components/    # React components
│   ├── TOC/      # Table of Contents components
│   └── Loader/   # Loading component
├── mocks/         # Mock data and service worker
├── utils/         # Utility functions (buildTree)
└── test/          # Test setup and configuration
```

## Key Components

- **`TOC.tsx`**: Main TOC component with search functionality
- **`TOCItem.tsx`**: Individual TOC item with expand/collapse
- **`buildTree.ts`**: Utility to transform flat data into hierarchical structure

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:run` - Run tests once
- `npm run lint` - Run ESLint

## Development

The project uses:

- **ESLint** for code quality
- **TypeScript** for type safety
- **CSS Modules** for scoped styling
- **Vitest** for fast testing

## Contributing

1. Make sure all tests pass
2. Follow the existing code style
3. Add tests for new functionality
4. Update documentation as needed

## License

This project is part of a coding assignment.
