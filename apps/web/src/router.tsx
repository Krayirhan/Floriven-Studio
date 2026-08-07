import { createBrowserRouter, Link, Navigate, Outlet, useRouteError } from "react-router-dom";
import { Nav } from "./components/layout";
import { Footer } from "./components/layout";
import { LandingPage } from "./features/landing";
import { StudioPage } from "./features/studio";
import {
  AppShell,
  AssetsPage,
  BillingPage,
  DashboardPage,
  HelpPage,
  NotificationsPage,
  ProjectListPage,
  SharedPage,
  SettingsPage,
  TemplatesPage,
} from "./features/app";
import { AuthPage } from "./features/auth/AuthPage";
import { OnboardingPage } from "./features/onboarding/OnboardingPage";

function PublicLayout() {
  return (
    <>
      <Nav />
      <main><Outlet /></main>
      <div className="wrap">
        <Footer />
      </div>
    </>
  );
}

function RouteError() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.";

  return (
    <main style={{ padding: "96px 24px", textAlign: "center" }}>
      <p>Bir şeyler ters gitti</p>
      <h1>Sayfa yüklenemedi.</h1>
      <p>{message}</p>
      <Link to="/">Ana sayfaya dön</Link>
    </main>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <LandingPage /> }],
  },
  {
    path: "/studio",
    element: <Navigate to="/app/projeler/prj_finance_01/studio" replace />,
  },
  {
    path: "/app/projeler/:projectId/studio",
    element: <StudioPage />,
    errorElement: <RouteError />,
  },
  { path: "/giris", element: <AuthPage mode="login" /> },
  { path: "/kayit", element: <AuthPage mode="signup" /> },
  { path: "/onboarding", element: <OnboardingPage /> },
  {
    path: "/app",
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "projeler", element: <ProjectListPage /> },
      { path: "projeler/yeni", element: <Navigate to="/app?focus=prompt" replace /> },
      { path: "paylasilanlar", element: <SharedPage /> },
      { path: "sablonlar", element: <TemplatesPage /> },
      { path: "varliklar", element: <AssetsPage /> },
      { path: "ayarlar", element: <SettingsPage /> },
      { path: "faturalandirma", element: <BillingPage /> },
      { path: "bildirimler", element: <NotificationsPage /> },
      { path: "yardim", element: <HelpPage /> },
    ],
  },
  { path: "*", element: <RouteError /> },
]);
