# 🚀 HealthConnector Frontend - Quick Start Guide

## ⚡ Get Started in 5 Minutes

### Step 1: Prerequisites
Make sure you have:
- ✅ Node.js 18+ installed
- ✅ Angular CLI installed: `npm install -g @angular/cli`
- ✅ Spring Boot backend running on `http://localhost:8080`

### Step 2: Install Dependencies
```bash
cd fe_health_connector
npm install
```

### Step 3: Start Development Server
```bash
npm start
```

The app will open automatically at `http://localhost:4200`

### Step 4: Login with Demo Credentials
- **Email:** admin@healthconnector.com
- **Password:** Admin@1234

## 📱 What You'll See

### Admin Dashboard (SUPER_ADMIN)
- 📊 Dashboard with 4 stat cards
- 👥 Provider management
- 🏥 Payer management
- 📋 Audit logs
- ⚙️ System configuration

### Provider Dashboard (PROVIDER)
- 📊 Dashboard with 3 stat cards
- 📄 Authorization requests
- 💬 Chat messaging
- 📈 Analytics

### Payer Dashboard (PAYER)
- 📊 Dashboard with 4 stat cards
- ✅ Review authorizations
- 📈 Analytics & reports

## 🎨 Design Features

- ✨ **Modern UI** - Clean, professional interface
- 📱 **Mobile Responsive** - Works on all devices
- 🎯 **Tailwind CSS** - Utility-first styling
- 🏞️ **Professional Icons** - Heroicons integration
- 🎭 **Dark Sidebar** - Modern navigation
- 🌈 **Color-coded Status** - Easy status identification
- 👟 **Powered by Feuji Footer** - On every page

## 🔌 Backend Integration

All APIs are already integrated:

### Authentication Endpoints
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/change-password
```

### Provider Endpoints
```
GET    /api/providers
POST   /api/providers
GET    /api/providers/{id}
PUT    /api/providers/{id}
DELETE /api/providers/{id}
```

### Authorization Endpoints
```
GET    /api/authorizations
POST   /api/authorizations
PUT    /api/authorizations/{id}/approve
PUT    /api/authorizations/{id}/deny
```

*(And many more - see FRONTEND_SETUP.md for complete list)*

## 📁 Project Structure

```
fe_health_connector/
├── src/
│   ├── app/
│   │   ├── core/              # Guards, interceptors, models, services
│   │   ├── features/          # Feature modules (auth, admin, provider, payer)
│   │   ├── shared/            # Shared components & utilities
│   │   ├── app.routes.ts      # Route definitions
│   │   ├── app.config.ts      # App configuration
│   │   └── app.ts             # Root component
│   ├── environments/          # Environment configs
│   ├── styles.css             # Global styles
│   └── index.html
├── angular.json               # Angular configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── FRONTEND_SETUP.md          # Detailed setup guide
```

## 🛠️ Available Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Watch files
npm run watch
```

## 🔐 Role-Based Features

### SUPER_ADMIN Can:
✅ View admin dashboard
✅ Manage providers
✅ Manage payers
✅ View audit logs
✅ Configure system settings

### PROVIDER Can:
✅ View provider dashboard
✅ Create authorization requests
✅ Chat with payers
✅ View authorization status
✅ Access profile settings

### PAYER Can:
✅ View payer dashboard
✅ Review authorizations
✅ Approve/Deny requests
✅ View analytics & reports
✅ Chat with providers

## 🎯 Key Features Already Implemented

- ✅ Responsive layouts for all screen sizes
- ✅ Role-based navigation
- ✅ JWT authentication with interceptors
- ✅ Error handling
- ✅ Route guards for protected pages
- ✅ Sidebar with role-specific menus
- ✅ Header with user info & logout
- ✅ Footer on every page
- ✅ Professional icons (Heroicons)
- ✅ Status indicators with colors
- ✅ Mobile-friendly design

## 🚧 Next Steps (In Progress)

- 🔜 Provider/Payer management CRUD
- 🔜 Authorization request creation & review
- 🔜 Chat messaging UI
- 🔜 Real-time notifications
- 🔜 Analytics charts
- 🔜 Audit logs display
- 🔜 User profile management
- 🔜 Advanced search & filtering

## 💡 Tips

1. **Login Storage:** Credentials are stored in localStorage
2. **Auto-logout:** Add automatic logout on token expiry
3. **Error Messages:** Check browser console for detailed errors
4. **API Calls:** All services log API calls (can be seen in Network tab)
5. **Styling:** Use Tailwind CSS classes for consistency

## 🆘 Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### CORS errors
- Ensure Spring Boot backend is running
- Check backend CORS configuration includes `http://localhost:4200`

### Login not working
- Verify backend is running on `http://localhost:8080`
- Check credentials
- Open DevTools > Network tab to see API calls

## 📚 Resources

- [Angular Documentation](https://angular.io/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Heroicons](https://heroicons.com)
- [RxJS](https://rxjs.dev)

## 📞 Support

For detailed information, refer to **FRONTEND_SETUP.md**

---

**Built with ❤️ using Angular, Tailwind CSS, and Heroicons**

**Powered by Feuji** ✨
