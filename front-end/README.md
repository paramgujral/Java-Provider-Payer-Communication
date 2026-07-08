# ProviderPayer

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version **21.2.14**.

## Tech Stack

| Technology | Version |
|---|---|
| Angular | 21.2.0 |
| Angular CLI | 21.2.14 |
| Node.js (recommended) | 20 LTS |
| npm | 10.8.2 |
| TypeScript | ~5.9.2 |
| Tailwind CSS | ^3.4.17 |
| Highcharts | ^13.0.0 |
| RxJS | ~7.8.0 |
| Express (SSR) | ^5.1.0 |
| Vitest | ^4.0.8 |

---

## Default Admin Credentials

Once the application is up, use the following credentials to log in as Admin:

| Field | Value |
|---|---|
| **Email** | `admin@gmail.com` |
| **Password** | `Admin@123` |

> **Note:** Based on the user role created by the admin, **Provider** and **Payer** users can log in with their own credentials.

---

## Getting Started

### Prerequisites

- Node.js **v20 LTS** installed
- npm **10.8.2**
- Angular CLI **21.2.14**

```bash
npm install -g @angular/cli@21.2.14
```

### Install Dependencies

```bash
npm install
```

---

## Development Server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to:

```
http://localhost:4200/
```

The application will automatically reload whenever you modify any of the source files.

---

## Code Scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

---

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

---

## Running Unit Tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

---

## Running End-to-End Tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

---

## Server-Side Rendering (SSR)

This project supports SSR via `@angular/ssr`. To run the SSR server after building:

```bash
ng build
node dist/provider-payer/server/server.mjs
```

---

## Key Dependencies

### Production
- **@angular/ssr** `^21.2.14` — Server-side rendering support
- **@stomp/stompjs** `^7.3.0` — WebSocket/STOMP messaging
- **sockjs-client** `^1.6.1` — SockJS WebSocket client
- **highcharts** `^13.0.0` — Interactive charts
- **highcharts-angular** `^5.4.0` — Angular wrapper for Highcharts
- **express** `^5.1.0` — SSR server

### Dev / Build
- **Tailwind CSS** `^3.4.17` — Utility-first CSS framework
- **Prettier** `^3.8.1` — Code formatter
- **Vitest** `^4.0.8` — Unit test runner

---

## Project Structure

```
front-end/
├── src/
│   ├── app/          # Components, services, modules
│   ├── environments/ # Environment configs
│   ├── main.ts       # Browser entry point
│   ├── main.server.ts# SSR entry point
│   └── styles.css    # Global styles (Tailwind)
├── public/           # Static assets
├── angular.json      # Angular CLI config
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## User Roles

| Role | Description |
|---|---|
| **Admin** | Full access; can create and manage Provider and Payer users |
| **Provider** | Access to provider-specific features |
| **Payer** | Access to payer-specific features |

---

## Additional Resources

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Angular Documentation](https://angular.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Highcharts Angular](https://github.com/highcharts/highcharts-angular)
- [Vitest Docs](https://vitest.dev/)
