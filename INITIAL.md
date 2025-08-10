# GameMarketplace - Bitcoin-Powered Gaming Platform

## Overview
Create a comprehensive gaming marketplace platform that serves as a Bitcoin-powered alternative to Steam. The platform should provide a complete gaming ecosystem with Bitcoin/Lightning Network payments, eliminating traditional payment processor fees and censorship.

## Core Requirements

### 1. Gaming Marketplace Features
- **Game Store**: Browse, search, filter games by genre, price, rating
- **Game Library**: Personal game collection with play/install functionality
- **Downloads**: Queue management, progress tracking, bandwidth control
- **Community**: Discussions, workshop, guides, screenshots
- **Friends & Chat**: Social features, multi-chat, presence status
- **User Profiles**: Achievements, playtime, reviews, wishlists

### 2. Bitcoin Payment Integration
- **BTCPay Server**: Self-hosted Bitcoin payment processing
- **Lightning Network**: Instant micropayments for DLC, in-game items
- **On-chain Bitcoin**: Traditional Bitcoin transactions for larger purchases
- **No Fees**: Eliminate payment processor fees entirely
- **Self-custody**: Users maintain control of their Bitcoin

### 3. Technical Architecture
- **Monorepo Structure**: Inspired by Everything Studio patterns
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL + real-time features)
- **Desktop App**: Tauri wrapper for native experience
- **Authentication**: Supabase Auth + optional Bitcoin wallet connect

### 4. Design System
- **Glassmorphism UI**: Modern, clean interface with backdrop blur
- **Dark/Light Themes**: System with CSS custom properties
- **Gaming Aesthetics**: Steam-like familiarity with Bitcoin branding
- **Responsive Design**: Web + desktop compatibility
- **Icon System**: Lucide React for consistency

### 5. Key Differentiators
- **Censorship Resistant**: No payment processor control over content
- **Zero Fees**: Direct Bitcoin payments, no middlemen
- **Self-hosted**: Developers can run their own instances
- **Open Source**: Transparent, auditable codebase
- **Privacy Focused**: Minimal data collection, user sovereignty

## Success Criteria
1. **Functional parity** with Steam's core features
2. **Seamless Bitcoin payments** with sub-second Lightning transactions
3. **Production-ready security** for Bitcoin integration
4. **Cross-platform compatibility** (web + desktop)
5. **Developer-friendly** self-hosting and customization
6. **User experience** that feels familiar to Steam users

## Target Users
- **Gamers**: Seeking censorship-resistant gaming platform
- **Game Developers**: Want to avoid payment processor fees
- **Bitcoin Enthusiasts**: Prefer Bitcoin-native applications
- **Privacy Advocates**: Value self-custody and minimal data collection

## Technical Constraints
- Must be isolated from existing projects
- Security-first approach for Bitcoin integration
- Performance comparable to native applications
- Scalable architecture for future growth
- Maintainable codebase with clear patterns

## Implementation Priority
1. Core marketplace functionality (store, library, downloads)
2. Bitcoin payment integration (BTCPay + Lightning)
3. Authentication and user management
4. Community features (chat, discussions)
5. Desktop app wrapper (Tauri)
6. Advanced features (achievements, workshop)
