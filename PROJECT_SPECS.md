# FitLife Ebooks - Project Specs

## Project
FitLife Ebooks / FitZone — Next.js 14 e-commerce platform selling fitness ebooks (transformation guide + nutrition guide + bundle). Bilingual (Arabic/English), Stripe payments, Upstash Redis, Vercel deployment.

- **Production URL:** https://www.fitzoneapp.com
- **GitHub:** https://github.com/jeankh/fitzone_next.git

## Architecture
- Next.js 14 App Router with `src/` directory
- Upstash Redis for data storage (purchases, users, blogs, marketing)
- Stripe Checkout for payments (card only)
- Resend for transactional emails
- bcryptjs for password hashing, jose for JWT
- Framer Motion for animations, Lucide for icons
- Tailwind CSS with dark theme

## Key Conventions
- User-facing pages in `app/` directories
- Shared components in `src/components/`
- Page-level components in `src/page-components/`
- Shared data in `src/lib/` (books.js, blog-posts.js)
- API routes in `app/api/`
- User auth context: `src/context/UserContext.jsx`
- Cart context: `src/context/CartContext.jsx`
- Shared Redis singleton: `src/lib/redis.js`
- API helpers: `src/lib/api-utils.js` (apiError/apiSuccess)
- CSRF validation: `src/lib/csrf.js`
- Input sanitization: `src/lib/sanitize.js`

## Auth System
- Admin: single password, JWT in httpOnly cookie (`fitzone_admin_token`)
- User: email+password or magic link, JWT in httpOnly cookie (`fitzone_user_token`)
- Separate secrets: `JWT_SECRET` (admin) and `USER_JWT_SECRET` (user)
- Rate limiting on login (5 attempts/15 min)
- Transparent plaintext→bcrypt migration for legacy passwords
- Magic links: 15-min one-time tokens in Redis

## Session History

### Session 1 — TODO Completion
All TODO items completed (see TODO.md). Key changes: SSR enabled, CSRF/sanitize added, shared data modules, error logging, Stripe locale fix, webhook confirmation emails.

### Session 2 — Success Page Redesign
Full redesign with confetti, book covers, copyable order ID, "What's next?" timeline, WhatsApp CTA, Arabic typo fix (سنتواصل).

### Session 3 — Purchase Tracking
Admin purchases endpoint, dashboard section with stats+table, success endpoint fallback storage.

### Session 4 — User Accounts
Full auth system (signup/login/logout/magic links), UserContext, account dashboard with purchase history, auto-create accounts on purchase.

### Session 5 — Security Overhaul
bcrypt hashing, magic links (no passwords in emails), HSETNX atomic creation, separate JWT secrets, rate limiting, timingSafeEqual, SameSite=strict, shared Redis singleton, HTML escaping in emails, pagination.

### Session 6 — Bug Fixes
Plaintext migration, signup validation, set-password flow, dynamic imports, client-side confetti, Suspense wrapper, middleware fixes, image domains, page padding, checkout auto-fill.

### Session 7 — Remaining Improvements
- **Fixed hardcoded URLs:** webhook fallback changed from `fitzone.vercel.app` to `www.fitzoneapp.com`
- **Forgot password:** "Forgot password?" link on login page sends magic link (reuses existing infrastructure)
- **Phone validation:** Server-side E.164-ish validation on signup (`+?[0-9]{7,15}`)
- **Password strength:** Visual 3-bar indicator on signup (Weak/Fair/Strong) based on length, mixed case, digits, special chars
- **SEO:** Added `robots.txt` (blocks admin/api/account, allows all else) and `sitemap.xml` (all public routes) via Next.js metadata API

### Session 8 — Email System Cleanup
- Centralized all transactional email templates in `src/lib/emails.js`
- Added shared Resend helpers in `src/lib/email.js`
- Reset password + magic link emails now support Arabic/English based on UI language
- Order confirmation + account-created emails now use the same branded template system
- Resend sender is required from env (`FROM_EMAIL`) instead of falling back to old domain values

### Session 9 — Feature Removal Cleanup
- Removed giveaway feature end-to-end: public page, client component, admin management UI, and all giveaway API routes
- Removed unused admin bank account management route and dashboard section
- Cleaned middleware, sitemap, and rate-limiting references for removed features

### Session 12 — Dynamic Social Buttons
- **Removed all hardcoded social links** (Twitter, Instagram, YouTube, WhatsApp in footer were fixed in code)
- **Admin-controlled social buttons:** Marketing tab now has an "Add Button" list — each entry has a Label + URL; fully add/edit/delete from admin
- **Stored as JSON array** in Redis under `fitzone_marketing.social_buttons`; parsed in `MarketingContext`
- **Footer** now renders whatever buttons are in the array (no buttons if list is empty); WhatsApp contact link in footer nav still controlled by its own visibility toggle
- **Key files changed:** `app/api/admin/marketing/route.js`, `src/context/MarketingContext.jsx`, `src/page-components/AdminPage.jsx`, `src/sections/Footer.jsx`

### Session 11 — Price System Fix
- **Bundle price now independent:** `bundle` added as a first-class stored price in Redis (`fitzone_prices`), no longer computed as `transformation + nutrition`
- **Prices now reflect on website:** `Books.jsx` and `BooksPage.jsx` now use `prices` from `CartContext` (fetched from API on mount) instead of the hardcoded static values in `src/lib/books.js`
- **Bundle editable in admin:** Removed `isBundle` guard — all three product cards (transformation, nutrition, bundle) now show the pencil/edit button
- **Currency table updated:** Bundle column in the per-currency overrides table is now fully editable (was read-only auto-computed); API regex updated to accept `bundle` keys
- **Key files changed:** `app/api/admin/prices/route.js`, `app/api/admin/currency-prices/route.js`, `src/context/CartContext.jsx`, `src/sections/Books.jsx`, `src/page-components/BooksPage.jsx`, `src/page-components/AdminPage.jsx`

### Session 10 — Admin UX Update
- Converted the admin dashboard from a long scrolling page into tabbed sections
- Added tabs for Traffic, Products, Marketing, Blogs, and Purchases
- Kept all existing admin tools/logic intact while reducing scroll and making each area easier to manage

### Session 13 — Contact & Icon Fixes
- WhatsApp default updated across code to `971509982833` (layout, marketing API defaults, MarketingContext, FAQ CTA). Live value still comes from Redis admin setting.
- Social URLs updated in Footer: Instagram → `fitzoneapp1`, TikTok → `@fitzoneapp`
- Fixed TikTok icon — custom SVG now accepts `size` prop and applies width/height so it matches Instagram icon visually
- Legal "الدفع" section: dropped SAR-specific wording, now simply `جميع الاسعار تشمل الضريبة.`

## Current State
All known issues resolved. Build passes cleanly. Remaining nice-to-haves:
- Download links in account dashboard (currently WhatsApp-only delivery)
- Twilio/WhatsApp Business API for actual WhatsApp notifications
- Blog post images (currently placeholder)
- Phone number in E.164 format enforcement
- Vercel SSO protection on preview deployment
- Marketing polish for email templates (logo/brand imagery/preheader text)
