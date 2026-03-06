# TaskFlow - Modern Todo List Application

A modern, full-stack todo list application built with Next.js, TypeScript, and FastAPI. Features a clean UI with priority management, tags, due dates, and seamless backend integration.

## Features

-  **Task Management**: Create, edit, delete, and organize tasks
-  **Priority Levels**: 5-level priority system (Low, Medium, Normal, High, Urgent)
-  **Tags**: Organize tasks with custom tags
-  **Due Dates**: Set and track task deadlines with overdue indicators
-  **Status Management**: Open, Done, and Archived task states
-  **Dark Mode**: Built-in dark/light theme support
-  **Responsive Design**: Mobile-first responsive UI
-  **Docker Support**: Multi-stage Docker builds for production
-  **Fast Performance**: Optimized with Next.js 15 and TypeScript

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks

### Backend (Separate Repository)
- **Framework**: FastAPI
- **Language**: Python
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy

### DevOps
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (planned)
- **CI/CD**: GitHub Actions (planned)

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm, yarn, pnpm, or bun
- Docker & Docker Compose (for containerized deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskflow-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Deployment

#### Using Docker Compose (Recommended)

```bash
# Build and start the application
docker-compose up --build

# Or run in background
docker-compose up -d --build

# Stop the application
docker-compose down
```

#### Manual Docker Build

```bash
# Build the image
docker build -t taskflow:latest .

# Run the container
docker run -p 3000:3000 taskflow:latest
```

The application will be available at `http://localhost:3000`

## Project Structure

```
taskflow-frontend/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Main todo list page
│   └── ...
├── components/            # Reusable React components
│   ├── MainNav.tsx       # Top navigation bar
│   └── Sidebar.tsx       # Left sidebar navigation
├── public/               # Static assets
├── Dockerfile           # Multi-stage Docker build
├── docker-compose.yml   # Docker Compose configuration
├── next.config.ts       # Next.js configuration
└── package.json         # Dependencies and scripts
```

## API Integration

This frontend is designed to work with the TaskFlow FastAPI backend. The API endpoints follow this structure:

### Todo Model
```typescript
interface Todo {
  id: string;              // System generated
  title: string;           // Required
  description: string | null;
  status: "open" | "done" | "archived";
  priority: 1 | 2 | 3 | 4 | 5;  // 1=Low, 5=Urgent
  position: number;        // System generated for sorting
  due_at: string | null;   // ISO8601 datetime
  tags: string[];          // Array of tag strings
  created_at: string;      // ISO8601 datetime
  updated_at: string;      // ISO8601 datetime
}
```

### User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}
```

### Planned API Endpoints
- `GET /api/todos` - List todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Delete todo
- `GET /api/users/me` - Get current user

## 🎨 UI Components

### Main Navigation (`MainNav.tsx`)
- Logo and branding
- User profile dropdown
- Notifications (planned)
- Settings access
- Mobile responsive menu

### Sidebar (`Sidebar.tsx`)
- Quick filters (All, Today, Tags, Archived)
- Category management
- Settings panel

### Todo List (`page.tsx`)
- Task creation form with priority, due dates, and tags
- Status-based filtering tabs
- Priority color coding
- Due date tracking with overdue indicators
- Tag management

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Docker
docker-compose up --build    # Build and run with Docker
docker-compose down          # Stop Docker containers
```

### Docker Production
```bash
# Build production image
docker build -t taskflow:prod .

# Run with environment variables
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e API_URL=https://your-api.com \
  taskflow:prod
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Beautiful icons
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework

---

