# 🎓 University Timetable Generator - Complete Setup Guide

## 📋 Quick Start Checklist

- [ ] Install Node.js (v18+)
- [ ] Install PostgreSQL
- [ ] Copy environment file
- [ ] Install dependencies
- [ ] Setup database
- [ ] Run application

## 🔧 Step 1: Prerequisites

### Install Node.js
```bash
# Check if Node.js is installed
node --version  # Should be v18 or higher
npm --version   # Should be v8 or higher

# If not installed, download from: https://nodejs.org/
```

### Install PostgreSQL
Choose one option:

**Option A: Install PostgreSQL directly**
- Windows: Download from https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql@15`
- Linux: `sudo apt-get install postgresql postgresql-contrib`

**Option B: Use Docker (easier)**
```bash
# Pull and run PostgreSQL container
docker run --name postgres-timetable \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=university_timetable \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

## 🏗️ Step 2: Project Setup

### Download Project Files
1. Extract all project files to a folder (e.g., `university-timetable-generator`)
2. Open the folder in VS Code

### Install Dependencies
```bash
# Navigate to project directory
cd university-timetable-generator

# Install all packages
npm install
```

## 🗃️ Step 3: Database Configuration

### Create Database (if not using Docker)
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE university_timetable;

# Create user (optional but recommended)
CREATE USER timetable_user WITH ENCRYPTED PASSWORD 'securepassword123';
GRANT ALL PRIVILEGES ON DATABASE university_timetable TO timetable_user;

# Exit PostgreSQL
\q
```

### Environment Variables
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your database details:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/university_timetable"
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=yourpassword
   PGDATABASE=university_timetable
   
   # Application
   NODE_ENV=development
   PORT=5000
   ```

3. **Important**: Replace `yourpassword` with your actual PostgreSQL password!

### Setup Database Tables
```bash
# Create all database tables
npm run db:push
```

You should see output like:
```
✓ Changes applied successfully
```

## 🚀 Step 4: Run the Application

### Start Development Server
```bash
npm run dev
```

You should see:
```
[express] serving on port 5000
```

### Open in Browser
Visit: http://localhost:5000

## 🔧 Step 5: VS Code Configuration (Optional)

### Recommended Extensions
1. **TypeScript and JavaScript** - Built-in VS Code extension
2. **Prettier - Code formatter** - `esbenp.prettier-vscode`
3. **ESLint** - `dbaeumer.vscode-eslint`
4. **PostgreSQL** - `ms-ossdata.vscode-postgresql`
5. **Tailwind CSS IntelliSense** - `bradlc.vscode-tailwindcss`

### Debug Configuration
The project includes VS Code debug configurations:
1. Press `F5` or go to Run & Debug
2. Select "Launch University Timetable App"
3. Set breakpoints and debug!

## 📊 Step 6: Using the Application

### Create Your First Timetable
1. **Step 1**: Select departments (e.g., CSE, ECE, MECH)
2. **Step 2**: Add subjects:
   - Manual entry: Click "Add Subject" button
   - Excel import: Use the provided Excel template
3. **Step 3**: Configure exam settings:
   - Start date
   - Exam duration (e.g., "3 Hours")
   - Reference number
4. **Step 4**: Generate and download PDF

### Excel Import Format
Create an Excel file with these columns:
```
Subject Code | Subject Name | Department | Year
CS101       | Programming  | CSE        | 1
MA101       | Mathematics  | CSE        | 1
PH101       | Physics      | ECE        | 1
```

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start with hot reload
npm run build        # Build for production
npm start           # Start production server

# Database
npm run db:push      # Apply schema changes
npm run db:generate  # Generate migration files
npm run db:studio    # Open database GUI

# Code Quality
npm run check        # TypeScript type checking
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Port Already in Use
```bash
# Kill process using port 5000
npx kill-port 5000

# Or change port in .env file
PORT=3000
```

#### 2. Database Connection Failed
- ✅ Check PostgreSQL is running: `pg_isready`
- ✅ Verify credentials in `.env`
- ✅ Ensure database exists
- ✅ Check firewall/antivirus blocking port 5432

#### 3. Permission Denied
```bash
# Fix PostgreSQL permissions
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE university_timetable TO your_user;
```

#### 4. Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. PDF Download Not Working
- ✅ Ensure PDFKit is installed: `npm list pdfkit`
- ✅ Check browser console for errors
- ✅ Verify timetable has subjects

### PostgreSQL Quick Commands
```bash
# Check if PostgreSQL is running
pg_isready

# Connect to database
psql -U postgres -d university_timetable

# List all databases
\l

# List all tables
\dt

# Exit PostgreSQL
\q
```

## 🎯 Testing the Application

### Test Workflow
1. **Create Department**: Add "Computer Science Engineering" (CSE)
2. **Add Subjects**: 
   - CS101 - Programming Fundamentals
   - MA101 - Engineering Mathematics
   - PH101 - Engineering Physics
3. **Set Exam Details**:
   - Start Date: Tomorrow's date
   - Duration: "3 Hours"
   - Reference: "CIT/COE/2025-26/ODD/01"
4. **Generate Timetable**: Click "Generate Timetable"
5. **Download PDF**: Click "Download PDF"

### Expected Result
- ✅ Professional PDF matching Chennai Institute of Technology format
- ✅ Same subject names on same dates
- ✅ No scheduling conflicts
- ✅ Proper university header and formatting

## 📞 Support

### Getting Help
1. Check this guide first
2. Verify all prerequisites are installed
3. Check the troubleshooting section
4. Review VS Code console/terminal for error messages

### File Structure
```
university-timetable-generator/
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared types and schemas
├── .vscode/          # VS Code configuration
├── .env             # Environment variables
├── README.md        # Project overview
├── SETUP_GUIDE.md   # This file
└── package.json     # Dependencies and scripts
```

## 🎉 Success!

If you can access the application at http://localhost:5000 and create a timetable with PDF download, you're all set!

The application provides:
- ✅ Professional timetable generation
- ✅ Conflict-free scheduling
- ✅ Excel import capabilities
- ✅ PDF export in university format
- ✅ Database persistence