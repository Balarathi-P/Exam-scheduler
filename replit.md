# University Exam Timetable Generator

## Overview

This is a full-stack web application for generating automatic university exam timetables. Built with React frontend and Express backend, it provides a comprehensive solution for academic institutions to create conflict-free exam schedules. The application features a multi-step wizard interface for data input, Excel import capabilities, and PDF export functionality with intelligent scheduling algorithms to prevent conflicts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development
- **UI Library**: Shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state and local React state for UI
- **Form Handling**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with structured error handling
- **File Processing**: Multer for file uploads, XLSX for Excel parsing
- **PDF Generation**: Puppeteer for server-side PDF rendering
- **Development**: Hot reload with Vite integration in development mode

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Connection Pooling**: Neon Pool for efficient connection management

### Core Business Logic
- **Timetable Generation**: Custom algorithm that prevents scheduling conflicts by ensuring no subject appears multiple times and no department has multiple exams on the same day
- **Date Management**: Intelligent date calculation with configurable weekend exclusions
- **Conflict Resolution**: Subjects with identical names are automatically scheduled on the same date regardless of different codes

### External Dependencies
- **Database**: Neon PostgreSQL for serverless database hosting
- **File Storage**: In-memory processing for Excel files with Multer
- **PDF Generation**: Puppeteer with Chrome headless for PDF export
- **UI Components**: Radix UI for accessible component primitives
- **Validation**: Zod for runtime type checking and form validation
- **Development Tools**: Replit integration for development environment