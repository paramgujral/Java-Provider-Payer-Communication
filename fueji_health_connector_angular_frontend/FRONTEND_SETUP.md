# HealthConnector Frontend - Angular with Tailwind CSS

A modern, responsive, and role-based Angular frontend for the AI-powered Prior Authorization Platform.

## 🚀 Features

- ✅ **Role-Based Access Control** - Supports SUPER_ADMIN, PROVIDER, and PAYER roles
- ✅ **Responsive Design** - Mobile-first approach with Tailwind CSS
- ✅ **Modern Icons** - Heroicons integrated for beautiful UI
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **HTTP Interceptors** - Automatic token injection and error handling
- ✅ **Route Guards** - Protected routes based on user roles
- ✅ **Shared Components** - Reusable components (modals, toasts, loaders, tables)
- ✅ **Backend API Integration** - Connected to Spring Boot backend
- ✅ **Responsive Layouts** - Dashboard and management pages
- ✅ **Footer on Every Page** - Branded footer with "Powered by Feuji"

## 📋 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── authorization.model.ts
│   │   │   └── notification.model.ts
│   │   └── services/
│   │       ├── auth.service.ts
│   │       ├── provider.service.ts
│   │       ├── payer.service.ts
│   │       ├── authorization.service.ts
│   │       ├── notification.service.ts
│   │       ├── chat.service.ts
│   │       ├── audit.service.ts
│   │       └── analytics.service.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── header/
│   │   │   │   ├── sidebar/
│   │   │   │   └── footer/
│   │   │   └── common/
│   │   │       ├── loader/
│   │   │       ├── modal/
│   │   │       ├── toast/
│   │   │       └── table/
│   │   └── constants/
│   ├── features/
│   │   ├── auth/
│   │   │   └── login/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── providers/
│   │   │   ├── payers/
│   │   │   └── audit-logs/
│   │   ├── provider/
│   │   │   ├── dashboard/
│   │   │   ├── authorizations/
│   │   │   └── chat/
│   │   ├── payer/
│   │   │   ├── dashboard/
│   │   │   ├── review/
│   │   │   └── analytics/
│   │   └── common/
│   │       ├── profile/
│   │       └── unauthorized/
│   ├── app.routes.ts
│   ├── app.config.ts
│   └── app.ts
├── environment/
│   ├── environment.ts
│   └── environment.prod.ts
├── styles.css
└── index.html
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm 9+
- Angular CLI 22+
- Git

### Installation Steps

1. **Navigate to the frontend directory:**
   ```bash
   cd fe_health_connector
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Heroicons (already added to package.json):**
   ```bash
   npm install @heroicons/angular
   ```

4. **Verify Tailwind CSS is configured** (should already be set up)

## 🎯 Running the Application

### Development Server
```bash
npm start
```
The application will be available at `http://localhost:4200`

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## 🔐 Authentication

### Login Credentials (Demo)

**Super Admin:**
- Email: `admin@healthconnector.com`
- Password: `Admin@1234`

**Provider (After creation via admin panel):**
- Email: `provider@hospital.com`
- Password: Sent via email

**Payer (After creation via admin panel):**
- Email: `payer@insurance.com`
- Password: Sent via email

## 🛣️ Routes & Role-Based Access

| Route | Role | Component | Status |
|-------|------|-----------|--------|
| `/login` | Public | LoginComponent | ✅ Ready |
| `/dashboard` | All | Role-specific | ✅ Ready |
| `/admin/dashboard` | SUPER_ADMIN | AdminDashboardComponent | ✅ Ready |
| `/admin/providers` | SUPER_ADMIN | ProvidersComponent | 🔜 In Progress |
| `/admin/payers` | SUPER_ADMIN | PayersComponent | 🔜 In Progress |
| `/admin/audit-logs` | SUPER_ADMIN | AuditLogsComponent | 🔜 In Progress |
| `/provider/dashboard` | PROVIDER | ProviderDashboardComponent | ✅ Ready |
| `/provider/authorizations` | PROVIDER | AuthorizationsComponent | 🔜 In Progress |
| `/provider/chat` | PROVIDER | ChatComponent | 🔜 In Progress |
| `/payer/dashboard` | PAYER | PayerDashboardComponent | ✅ Ready |
| `/payer/review` | PAYER | ReviewComponent | 🔜 In Progress |
| `/payer/analytics` | PAYER | AnalyticsComponent | 🔜 In Progress |
| `/profile` | All | ProfileComponent | 🔜 In Progress |
| `/unauthorized` | Public | UnauthorizedComponent | ✅ Ready |

## 🔌 Backend API Integration

The frontend is fully integrated with the Spring Boot backend:

- **Base URL:** `http://localhost:8080`
- **API Endpoints:** All implemented in service classes
- **Authentication:** JWT tokens stored in localStorage
- **CORS:** Already configured in Spring Boot (`allowed-origins: localhost:4200`)

### Available Services

1. **AuthService** - Login, logout, refresh token, change password
2. **ProviderService** - Create, read, update, delete providers
3. **PayerService** - Create, read, update, delete payers
4. **AuthorizationService** - Manage authorization requests
5. **NotificationService** - Handle notifications
6. **ChatService** - Real-time messaging
7. **AuditService** - View audit logs
8. **AnalyticsService** - Fetch analytics data

## 📱 Responsive Design

The application uses Tailwind CSS breakpoints for responsive design:

- **Mobile:** < 640px (`sm`)
- **Tablet:** 640px - 1024px (`md`)
- **Desktop:** 1024px+ (`lg`, `xl`, `2xl`)

All components are mobile-first and fully responsive.

## 🎨 Design System

- **Primary Color:** Blue (#2563EB)
- **Secondary Color:** Gray (#1F2937)
- **Success Color:** Green (#10B981)
- **Warning Color:** Yellow (#F59E0B)
- **Danger Color:** Red (#EF4444)
- **Font:** System fonts (Helvetica Neue, Arial)
- **Icons:** Heroicons (solid set)

## 🚀 Deployment

### Build the application:
```bash
npm run build
```

### Deploy dist folder to:
- Firebase Hosting
- Netlify
- Vercel
- AWS S3 + CloudFront
- Docker container

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ HTTP-only cookie support (can be added)
- ✅ CORS configured
- ✅ Role-based access control
- ✅ Route guards for protected pages
- ✅ Error interceptor for security headers
- ✅ XSS protection via Angular sanitization

## 📊 Performance Optimizations

- ✅ Lazy loading of feature modules
- ✅ Standalone components for reduced bundle size
- ✅ OnPush change detection (can be added)
- ✅ Tailwind CSS purging for production

## 🐛 Common Issues & Solutions

### CORS Error
**Solution:** Verify that the Spring Boot backend has the correct CORS configuration:
```properties
app.cors.allowed-origins=http://localhost:4200
```

### Login Issues
**Solution:** 
1. Verify the backend is running on `http://localhost:8080`
2. Check the credentials
3. Clear localStorage and try again

### Interceptor Not Working
**Solution:** Ensure interceptors are registered in `app.config.ts`

## 🤝 Contributing

To add new features:

1. Create feature components in `/features/[feature-name]/`
2. Create services in `/core/services/`
3. Add routes to `app.routes.ts`
4. Use existing shared components for UI
5. Ensure responsive design with Tailwind CSS

## 📝 License

This project is part of the HealthConnector Platform and follows the main project license.

## 📧 Support

For issues or questions, please refer to the main project documentation or contact the development team.

---

**Powered by Feuji** ✨
