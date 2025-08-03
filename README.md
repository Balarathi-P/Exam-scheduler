# University Exam Timetable Generator

A full-stack web application for generating automatic university exam timetables with conflict-free scheduling, Excel import, and PDF export capabilities.

## Features

- **Step-by-step workflow**: Department selection, subject management, and exam settings
- **Bulk import**: Excel/CSV file support for importing subjects
- **Manual entry**: Add subjects individually through the UI
- **Conflict-free scheduling**: Same subject names get scheduled on identical dates
- **PDF export**: Professional format matching Chennai Institute of Technology layout
- **Database persistence**: PostgreSQL with Drizzle ORM

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **PDF Generation**: PDFKit (no browser dependencies)
- **File Processing**: XLSX for Excel parsing

## Setup Instructions for VS Code

### Prerequisites

1. **Node.js** (v18 or higher)
   ```bash
   # Check version
   node --version
   npm --version
   ```

2. **PostgreSQL** (v12 or higher)
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres`

3. **VS Code Extensions** (recommended)
   - TypeScript
   - Prettier
   - ESLint
   - PostgreSQL (for database management)

### Database Setup

1. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE university_timetable;
   
   # Create user (optional)
   CREATE USER timetable_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE university_timetable TO timetable_user;
   
   # Exit
   \q
   ```

2. **Environment Configuration**
   Create a `.env` file in the project root (see .env.example below)

### Project Setup

1. **Clone/Download Project**
   ```bash
   # If you have the project files
   cd university-timetable-generator
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create `.env` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/university_timetable"
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=yourpassword
   PGDATABASE=university_timetable
   
   # Application Configuration
   NODE_ENV=development
   PORT=5000
   ```

4. **Database Migration**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Optional: Generate migrations
   npm run db:generate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at: http://localhost:5000

### VS Code Configuration

Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

Create `.vscode/launch.json` for debugging:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "tsx/cjs"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Database
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate migration files
npm run db:studio    # Open Drizzle Studio (database GUI)

# Build
npm run build        # Build for production
npm start           # Start production server
```

### Database Schema

The application uses the following main tables:
- `users` - User authentication
- `timetables` - Exam timetable configurations
- `subjects` - Subject definitions
- `timetable_subjects` - Generated exam schedules

### Troubleshooting

1. **Port Already in Use**
   ```bash
   # Kill processes using port 5000
   npx kill-port 5000
   # Or change PORT in .env file
   ```

2. **Database Connection Issues**
   - Verify PostgreSQL is running: `pg_isready`
   - Check DATABASE_URL format
   - Ensure database exists and user has permissions

3. **Module Not Found Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript Errors**
   ```bash
   # Check TypeScript compilation
   npx tsc --noEmit
   ```

### Usage

1. **Create Timetable**
   - Step 1: Select departments and academic year
   - Step 2: Add subjects (manual or Excel import)
   - Step 3: Configure exam settings (dates, duration)
   - Step 4: Generate and download PDF

2. **Excel Import Format**
   ```
   Subject Code | Subject Name | Department | Year
   CS101       | Programming  | CSE        | 1
   MA101       | Mathematics  | CSE        | 1
   ```

3. **PDF Export**
   - Generates professional format matching university standards
   - Includes conflict-free scheduling
   - Same subject names appear on same dates

### Contributing

1. Follow TypeScript best practices
2. Use Prettier for code formatting
3. Run `npm run db:push` after schema changes
4. Test PDF generation thoroughly

For support or questions, please refer to the project documentation or create an issue.