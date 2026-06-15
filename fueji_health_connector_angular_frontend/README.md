# 🎨 HealthConnector — Frontend (Angular 22)

> Angular 22 SSR single-page application for the HealthConnector Prior Authorization Platform.  
> Role-specific dashboards, real-time review queues, SVG analytics charts, and AI-powered clinical review — all secured with JWT Bearer token authentication.

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Application Architecture](#-application-architecture)
5. [Authentication & Route Guards](#-authentication--route-guards)
6. [User Roles & Pages](#-user-roles--pages)
7. [Chart & Analytics System](#-chart--analytics-system)
8. [HTTP Client & Interceptor](#-http-client--interceptor)
9. [Component Reference](#-component-reference)
10. [Routing Structure](#-routing-structure)
11. [Environment Configuration](#-environment-configuration)
12. [Installation & Running](#-installation--running)
13. [Build for Production](#-build-for-production)
14. [Troubleshooting](#-troubleshooting)

---

## 🌐 Overview

The HealthConnector frontend is an **Angular 22 standalone component application** with server-side rendering (SSR). It provides role-specific interfaces for three user types:

- 🔴 **SUPER_ADMIN** — platform management, audit logs, user CRUD
- 🩺 **PROVIDER** — submit authorization requests, AI pre-review, track status
- 🏦 **PAYER** — review queue, approve/reject decisions, analytics

**Key frontend capabilities:**
- 🔒 JWT-based auth with automatic token injection via `HttpInterceptor`
- 🛣️ Role-aware route guards (`AuthGuard`, `RoleGuard`) — unauthorized redirects
- 📊 Custom SVG area/bar/donut charts — no Chart.js dependency
- 🔄 30-second polling on analytics pages for real-time data freshness
- 🎨 Tailwind CSS 4 utility-first styling with responsive layouts
- ⚡ Angular SSR via Express for fast first-contentful-paint

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Angular** | 22.0.0 | Core SPA framework |
| **Angular SSR** | 22.0.1 | Server-side rendering |
| **Angular CLI** | 22.0.1 | Build, serve, scaffold |
| **TypeScript** | ~6.0.2 | Type-safe development |
| **RxJS** | ~7.8.0 | Reactive streams (HTTP, polling) |
| **Tailwind CSS** | 4.1.12 | Utility-first CSS |
| **PostCSS** | 8.5.3 | CSS processing pipeline |
| **Express** | 5.1.0 | SSR production server |
| **Heroicons Angular** | 2.1.1 | SVG icon components |
| **Angular Forms** | 22.0.0 | Template-driven forms |
| **Angular Router** | 22.0.0 | Client-side routing |
| **Angular HttpClient** | 22.0.0 | REST API communication |
| **Vitest** | 4.0.8 | Unit test runner |
| **Prettier** | 3.8.1 | Code formatting |
| **npm** | 11.16.0 | Package manager |

### Browser Support

| Browser | Support |
|---|---|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Edge | ✅ Full |
| Safari | ✅ Full |
| Mobile Chrome (Android) | ✅ Full |

---

## 📁 Project Structure

```
fe_health_connector/
├── package.json
├── angular.json                            # Build config, SSR settings
├── tsconfig.app.json                       # TypeScript config for app
├── tsconfig.json                           # Base TypeScript config
│
└── src/
    ├── main.ts                             # Browser bootstrap
    ├── main.server.ts                      # SSR bootstrap
    ├── server.ts                           # Express SSR server
    ├── styles.css                          # Global CSS + Tailwind import
    │
    ├── environments/
    │   ├── environment.ts                  # Dev: apiUrl = http://localhost:8080
    │   └── environment.prod.ts             # Prod: apiUrl = production URL
    │
    └── app/
        ├── app.component.ts                # Root component
        ├── app.config.ts                   # provideRouter, provideHttpClient
        ├── app.routes.ts                   # Top-level routing
        │
        ├── 📂 core/                        # App-wide singletons
        │   ├── auth.guard.ts               # Redirects unauthenticated users to /login
        │   ├── role.guard.ts               # Redirects users to their role's dashboard
        │   ├── auth.interceptor.ts         # Injects "Authorization: Bearer <token>"
        │   └── auth.service.ts             # JWT decode, login/logout, getCurrentUser
        │
        ├── 📂 shared/
        │   └── components/
        │       └── layout/
        │           ├── sidebar.component.ts    # Role-aware navigation sidebar
        │           ├── header.component.ts     # Top bar with user info + logout
        │           └── layout.module.ts        # Exports sidebar + header
        │
        └── 📂 features/                    # Feature modules by role
            │
            ├── 📂 auth/
            │   └── login/
            │       └── login.component.ts  # Animated healthcare slide + login form
            │
            ├── 📂 admin/
            │   ├── dashboard/
            │   │   └── admin-dashboard.component.ts   # Stats, bar chart, donut
            │   ├── providers/
            │   │   └── providers.component.ts          # Provider CRUD table
            │   ├── payers/
            │   │   └── payers.component.ts             # Payer CRUD table
            │   ├── analytics/
            │   │   └── admin-analytics.component.ts   # KPIs, status bars, AI metrics
            │   └── audit-logs/
            │       └── audit-logs.component.ts         # Filterable audit trail table
            │
            ├── 📂 provider/
            │   ├── dashboard/
            │   │   └── provider-dashboard.component.ts # 12-month area chart, stats
            │   ├── authorizations/
            │   │   └── authorizations.component.ts     # Request list + create form
            │   ├── chat/
            │   │   └── chat.component.ts               # Chat threads + messages
            │   └── profile/
            │       └── profile.component.ts            # Edit profile + change password
            │
            └── 📂 payer/
                ├── dashboard/
                │   └── payer-dashboard.component.ts    # Dual-series chart, stats
                ├── review/
                │   └── review.component.ts             # Review queue: approve/reject
                ├── analytics/
                │   └── analytics.component.ts          # Monthly bar, donut, rankings
                └── profile/
                    └── profile.component.ts            # Edit profile + change password
```

---

## 🏗️ Application Architecture

### Standalone Components Pattern

All components use Angular's **standalone component** architecture (no NgModule per feature):

```typescript
@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutModule],
  template: `...inline template...`,
  styles: []
})
export class ReviewComponent implements OnInit, OnDestroy { ... }
```

### Data Flow per Page

```
Component ngOnInit()
    │
    ▼
HttpClient.get<ApiResponse<T>>(environment.apiUrl + '/api/...')
    │
    │  (Auth Interceptor adds Bearer token automatically)
    │
    ▼
Backend REST API (Spring Boot on :8080)
    │
    ▼
Component.next() — maps response, sets component state
    │
    ▼
Angular Change Detection → Template re-renders
    │
    ▼
(if polling page) setInterval → repeat after 30 seconds
```

### SSR Considerations

Pages use `isPlatformBrowser(platformId)` before:
- Starting `setInterval` polling
- Accessing `localStorage` for auth token
- Generating SVG chart coordinates

```typescript
constructor(@Inject(PLATFORM_ID) private platformId: object) {}

ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    this.loadData();
    this.pollId = setInterval(() => this.loadData(), 30000);
  }
}
```

---

## 🔐 Authentication & Route Guards

### Login Flow

```
1. User submits email + password
2. POST /api/auth/login  (no interceptor — no token yet)
3. On success:
   localStorage.setItem('auth_token', token)
   localStorage.setItem('user', JSON.stringify(user))
4. Router.navigate() → to role's dashboard:
   SUPER_ADMIN  →  /admin/dashboard
   PROVIDER     →  /provider/dashboard
   PAYER        →  /payer/dashboard
```

### AuthGuard

Protects all authenticated routes. Redirects to `/login` if no valid token exists.

```typescript
// auth.guard.ts
canActivate(): boolean {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    this.router.navigate(['/login']);
    return false;
  }
  return true;
}
```

### RoleGuard

Protects role-specific routes. Prevents a PROVIDER from navigating to `/payer/**`.

```typescript
// role.guard.ts
canActivate(route: ActivatedRouteSnapshot): boolean {
  const user = this.authService.getCurrentUser();
  const requiredRole = route.data['role'];
  if (user?.role !== requiredRole) {
    // Redirect to their own dashboard
    this.router.navigate([this.authService.getDashboardRoute()]);
    return false;
  }
  return true;
}
```

### Auth Interceptor

Automatically adds the JWT Bearer token to every outgoing HTTP request:

```typescript
// auth.interceptor.ts
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = localStorage.getItem('auth_token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next.handle(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        // Token expired — clear storage + redirect to login
        localStorage.clear();
        this.router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
}
```

---

## 👥 User Roles & Pages

### 🔴 SUPER\_ADMIN Pages

| Route | Component | Description |
|---|---|---|
| `/admin/dashboard` | `AdminDashboardComponent` | Platform KPIs, request stats, approval rate donut, bar chart |
| `/admin/providers` | `ProvidersComponent` | Provider list with create/edit/deactivate/reset-password |
| `/admin/payers` | `PayersComponent` | Payer list with create/edit/deactivate/reset-password |
| `/admin/analytics` | `AdminAnalyticsComponent` | Request pipeline progress bars, AI metrics, KPI cards |
| `/admin/audit-logs` | `AuditLogsComponent` | Filterable audit trail, CSV export, pagination |

#### Admin Dashboard features:
- 4 KPI cards: Total Requests, Approved, Pending, AI Reviewed
- 4 User KPI cards: Providers, Payers, Active Users, Blocked Users
- Bar chart: Authorization Status Breakdown (animated bars)
- Donut chart: Approval Rate (blue/red arcs)
- Pipeline progress bars: each status as % of total
- AI Copilot performance metrics

---

### 🩺 PROVIDER Pages

| Route | Component | Description |
|---|---|---|
| `/provider/dashboard` | `ProviderDashboardComponent` | 12-month area chart, donut, recent requests |
| `/provider/authorizations` | `AuthorizationsComponent` | Create + view + submit requests |
| `/provider/chat` | `ChatComponent` | Chat threads and message history |
| `/provider/profile` | `ProfileComponent` | Edit info, change password |

#### Provider Dashboard features:
- **SVG Area Chart** — "My Authorization Activity — Last 12 Months"
  - Smart Y-axis: unique integer ticks that scale with real data
  - Smooth cubic Bezier curve path
  - Gradient fill under curve
  - Monthly X-axis labels
- **Donut chart** — Approved / Denied / Pending breakdown
- **Stats cards** — Total Submitted, Approved, Denied, Pending
- **Recent Requests** — Latest 5 authorization requests with status badges

#### Provider Authorizations features:
- Paginated request list with status color badges
- Create new request modal with full patient/clinical form fields
- Trigger AI pre-review before submitting
- Submit draft → tracks real-time status updates
- Provide additional info when payer requests more details

---

### 🏦 PAYER Pages

| Route | Component | Description |
|---|---|---|
| `/payer/dashboard` | `PayerDashboardComponent` | Stats cards, dual-series SVG chart, pending list |
| `/payer/review` | `ReviewComponent` | Full review queue with action buttons |
| `/payer/analytics` | `AnalyticsComponent` | Bar chart, donut, top providers, status summary |
| `/payer/profile` | `ProfileComponent` | Edit info, change password |

#### Payer Review Queue features (ReviewComponent):
- Filter by status: ALL, SUBMITTED, UNDER_REVIEW, MORE_INFO_REQUIRED
- For each request in queue:
  - 🟢 **Approve** — POST `/{id}/approve` with optional notes
  - 🔴 **Reject** — POST `/{id}/reject` with reason
  - 🟡 **Request More Info** — POST `/{id}/request-info` with notes
  - 🔵 **Start Review** — POST `/{id}/start-review`
  - 🔄 **Reconsider** — POST `/{id}/reconsider` (from APPROVED/REJECTED)
  - 🤖 **AI Review** — POST `/{id}/ai-review` → displays Gemini score
- Toast notifications on success/failure with actual backend error message
- Real-time status update after each action

#### Payer Analytics features:
- Monthly bar chart (approved vs rejected, CSS height-percentage based)
- Decision Breakdown donut (SVG circle with stroke-dashoffset)
- Top Providers by Volume (horizontal progress bars)
- Authorization Status Summary (color-coded rows)
- Auto-polls every 30 seconds

---

## 📊 Chart & Analytics System

All charts are built with **custom SVG** — no external charting library required.

### Provider Dashboard — SVG Area Chart

```
SVG ViewBox: 540 × 160
Padding: left=44, right=14, top=16, bottom=28
Draw area: 482 × 116

computeNiceYTicks(maxVal):
  maxVal = 0         → ticks: [1, 0],   niceMax: 1
  maxVal = 1         → ticks: [1, 0],   niceMax: 1
  maxVal = 2         → ticks: [2,1,0],  niceMax: 2
  maxVal = 3         → ticks: [3,2,1,0], niceMax: 3
  maxVal = 4         → ticks: [4,3,2,1,0], niceMax: 4
  maxVal ≥ 5 (nice)  → 5 ticks with rounded step (e.g. maxVal=10 → [12,9,6,3,0])

Point Y = padT + drawH - (value / niceMax) * drawH
Line: smooth cubic Bezier (C command) between each data point
Fill: line path + L to bottom-right + L to bottom-left + Z
Grid: horizontal lines at each tick Y position
```

### Payer Dashboard — Dual-Series SVG Chart

```
Two data series:
  Approved (green #10b981)
  Denied   (red  #ef4444)

Both scale against maxVal * 1.15 for breathing room
Hardcoded 4 horizontal grid lines
Month labels on X-axis
```

### Admin Dashboard — Bar Chart

```
CSS div bars with [style.height.px] = animatedHeight
animateProgress: triggered via setTimeout(100ms) after data loads
Y-axis:  chartMax, chartMax*0.75, chartMax*0.50, chartMax*0.25, 0
         Uses Math.max(...data, 4) minimum → always unique integers
```

### Donut Charts (SVG `<circle>` stroke-dashoffset)

```html
<circle cx="60" cy="60" r="50"
        stroke-dasharray="314 314"
        [attr.stroke-dashoffset]="314 - (approvalRate / 100) * 314"
        style="transition: stroke-dashoffset 1s ease"/>

Formula:
  circumference = 2π * radius = 2 * 3.14159 * 50 ≈ 314
  filled arc = (percentage / 100) * circumference
  dashoffset = circumference - filled arc
  rotate -90° to start arc at top
```

---

## 🌐 HTTP Client & Interceptor

### HttpClient setup (`app.config.ts`)

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideClientHydration()
  ]
};
```

### Error Handling Pattern

All components use this consistent pattern to display backend errors:

```typescript
error: (err) => {
  // Handles both GlobalExceptionHandler format (message field)
  // and Spring BasicErrorController format (error field)
  const msg = err?.error?.message
           || err?.error?.error
           || 'Default fallback message';
  this.showToast(msg, 'error');
}
```

### Toast Notification System

Every action component has a `showToast(message, type)` method:

```typescript
showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
  this.toast = { message, type, visible: true };
  setTimeout(() => { this.toast.visible = false; }, 3500);
}
```

Toast appears as a floating notification in the top-right corner.

---

## 📱 Component Reference

### `LoginComponent`

```
Route:       /login  (public, no auth required)
Layout:      Two-column responsive
  Left:      Animated healthcare feature carousel (auto-rotates every 4s)
  Right:     Email + password form
On success:  Stores token + user in localStorage, navigates to role dashboard
On error:    Shows backend error message in red alert
```

### `SidebarComponent` (Shared)

```
Role-aware navigation links:
  ADMIN    → Dashboard, Providers, Payers, Analytics, Audit Logs
  PROVIDER → Dashboard, Authorizations, Chat, Profile
  PAYER    → Dashboard, Review Queue, Analytics, Profile

Active route highlighted
Responsive: collapses on mobile
Logout button at bottom
```

### `ReviewComponent` (Payer)

```
GET /api/authorizations/payer-queue?page=0&size=50  on load
Filter bar: ALL | SUBMITTED | UNDER_REVIEW | MORE_INFO_REQUIRED
Per-request card:
  - Reference number, patient info (decrypted by backend)
  - Current status badge
  - Action buttons (context-sensitive by status)
  - Inline notes input for approve/reject/request-info
  - AI Review button → displays ai_score + ai_risk_level
Toast feedback on every action
```

### `AuditLogsComponent` (Admin)

```
GET /api/audit-logs?page=0&size=20  on load + on page change
Severity derived client-side:
  CRITICAL → action contains "LOCKED", "BLOCKED", "CRITICAL"
  WARNING  → action contains "FAILED", "ERROR" or success=false
  INFO     → everything else
Filter: search query, action type, severity
CSV export: all filtered logs as downloadable file
```

---

## 🛣️ Routing Structure

```typescript
// app.routes.ts
[
  { path: '',        redirectTo: '/login', pathMatch: 'full' },
  { path: 'login',  component: LoginComponent },

  // Admin routes
  { path: 'admin',  canActivate: [AuthGuard, RoleGuard], data: { role: 'SUPER_ADMIN' },
    children: [
      { path: 'dashboard',  component: AdminDashboardComponent },
      { path: 'providers',  component: ProvidersComponent },
      { path: 'payers',     component: PayersComponent },
      { path: 'analytics',  component: AdminAnalyticsComponent },
      { path: 'audit-logs', component: AuditLogsComponent },
    ]
  },

  // Provider routes
  { path: 'provider', canActivate: [AuthGuard, RoleGuard], data: { role: 'PROVIDER' },
    children: [
      { path: 'dashboard',       component: ProviderDashboardComponent },
      { path: 'authorizations',  component: AuthorizationsComponent },
      { path: 'chat',            component: ChatComponent },
      { path: 'profile',         component: ProfileComponent },
    ]
  },

  // Payer routes
  { path: 'payer', canActivate: [AuthGuard, RoleGuard], data: { role: 'PAYER' },
    children: [
      { path: 'dashboard',  component: PayerDashboardComponent },
      { path: 'review',     component: ReviewComponent },
      { path: 'analytics',  component: AnalyticsComponent },
      { path: 'profile',    component: ProfileComponent },
    ]
  },

  { path: '**', redirectTo: '/login' }
]
```

---

## ⚙️ Environment Configuration

### `src/environments/environment.ts` (Development)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

### `src/environments/environment.prod.ts` (Production)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com'
};
```

Angular CLI automatically swaps `environment.ts` with `environment.prod.ts` during `ng build --configuration production`.

---

## 🔧 Installation & Running

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 20.x | `node --version` |
| npm | 11.x | `npm --version` |

### Development Setup

```bash
# Navigate to frontend folder
cd fe_health_connector

# Install all dependencies
npm install

# Start development server (hot reload enabled)
npm start
# or
npx ng serve
```

> ✅ App available at **http://localhost:4200**  
> ✅ Auto-reloads on file save  
> ✅ Proxies API calls to `http://localhost:8080` (via `apiUrl` in environment.ts)

### Available Scripts

| Script | Command | Description |
|---|---|---|
| `start` | `ng serve` | Dev server with hot-reload |
| `build` | `ng build` | Production build |
| `watch` | `ng build --watch --configuration development` | Dev build with watch |
| `test` | `ng test` | Run unit tests with Vitest |
| `serve:ssr` | `node dist/fe_health_connector/server/server.mjs` | Run SSR production server |

---

## 📦 Build for Production

```bash
cd fe_health_connector

# Production build (uses environment.prod.ts)
npm run build

# Output directory: dist/fe_health_connector/
#   browser/   ← Static files (serve via nginx or CDN)
#   server/    ← SSR Node.js server bundle
```

### Running SSR Production Server

```bash
npm run serve:ssr:fe_health_connector
# Starts Express server with Angular SSR
```

### Nginx Configuration Example (Static hosting)

```nginx
server {
    listen 80;
    root /var/www/fe_health_connector/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header Authorization $http_authorization;
    }
}
```

---

## 🎨 Styling Guide

### Tailwind CSS 4 Setup

Tailwind is configured via PostCSS:

```css
/* styles.css */
@import "tailwindcss";
```

### Common Design Patterns

| Element | Tailwind Classes |
|---|---|
| Page container | `max-w-7xl mx-auto px-4 md:px-6 py-8` |
| Card | `bg-white rounded-xl shadow-sm border border-gray-100 p-6` |
| Primary button | `bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700` |
| Danger button | `bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700` |
| Status badge — APPROVED | `bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-semibold` |
| Status badge — REJECTED | `bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-semibold` |
| Status badge — PENDING | `bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-semibold` |
| Loading skeleton | `animate-pulse bg-gray-200 rounded` |

---

## 🐛 Troubleshooting

### Blank page after login
- Check browser console for errors
- Verify `environment.ts` → `apiUrl` points to running backend
- Confirm backend is running on `:8080` and CORS includes `http://localhost:4200`

### 401 Unauthorized on all requests
- JWT token may have expired (24-hour TTL)
- Clear localStorage and log in again
- Check `auth.interceptor.ts` is registered in `app.config.ts`

### Charts not rendering
- SVG charts require browser environment — `isPlatformBrowser()` guard prevents SSR crash
- Check `activityData` array has 12 items (one per month)
- If Y-axis shows repeated numbers: confirm `computeNiceYTicks()` is present in `ProviderDashboardComponent`

### `npm install` fails
- Requires Node.js 20.x: `node --version`
- Try: `npm cache clean --force && npm install`

### SSR hydration warnings
- `ExpressionChangedAfterItHasBeenCheckedError` — component state changes after SSR
- Use `ChangeDetectorRef.markForCheck()` after async data loads in `OnPush` components
- Ensure `isPlatformBrowser()` wraps all browser-only APIs (`localStorage`, `setInterval`)

### Toast not showing after action
- Confirm `toast.visible = true` is set and template has `@if (toast.visible)` block
- Check component has `showToast()` method wired to error handler in the HTTP observable
