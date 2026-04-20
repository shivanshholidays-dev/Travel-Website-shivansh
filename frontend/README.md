# Trekstories Frontend

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

The frontend of Trekstories is a modern, high-performance web application built with **Next.js 15+** and **Tailwind CSS**. It provides a premium user experience for travelers to book tours and for admins to manage the entire platform.

## ✨ Features

- **App Router Architecture**: Utilizing the latest Next.js 15 features for optimized routing and layout management.
- **Responsive Animations**: Smooth transitions and interactive elements using CSS and Framer Motion (optional/where applied).
- **State Management**: Scalable state handling with Redux Toolkit / React Context.
- **Admin Panel**: A powerful suite of management tools built into the core application.
- **Dynamic Meta Tags**: Automated SEO optimization for every tour page.

## 📂 Project Structure

```text
Shivansh Holidays-frontend/
├── app/               # Next.js App Router (Layouts, Pages, APIs)
│   ├── (auth)/        # Authentication pages
│   ├── admin/         # Admin dashboard modules
│   ├── tours/         # Tour listing and detail pages
│   └── page.tsx       # Homepage
├── src/
│   ├── components/    # Reusable UI components (Buttons, Inputs, Cards)
│   ├── constants/     # Configuration and constant variables
│   ├── lib/           # Helper functions and API client (Axios/Fetch)
│   ├── store/         # Global state management
│   ├── styles/        # Global CSS and Tailwind directives
│   └── middleware.ts  # Route protection and server-side redirects
├── public/            # Static assets (images, fonts, favicons)
└── next.config.ts     # Frontend build configuration
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file in the root directory (refer to `.env.example`):

```bash
cp .env.example .env.local
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build & Production

```bash
npm run build
npm run start
```

## 🎨 UI & UX

Trekstories uses a custom design system built on top of **Tailwind CSS**.

- **Typography**: Optimized font loading using `next/font`.
- **Icons**: Comprehensive icon set using `lucide-react` or similar.
- **Theme**: Premium look with support for various color schemes.

---

_Crafted for the best traveler experience by the Trekstories Team._
