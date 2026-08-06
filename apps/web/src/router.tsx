import { createBrowserRouter } from "react-router-dom";
import { Nav } from "./components/layout";
import { Footer } from "./components/layout";
import { LandingPage } from "./features/landing";
import { StudioPage } from "./features/studio";
import {
  BillingPage,
  DashboardPage,
  NewProjectPage,
  ProjectListPage,
  SettingsPage,
} from "./features/app";
import { AuthPage } from "./features/auth/AuthPage";
import { OnboardingPage } from "./features/onboarding/OnboardingPage";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <div className="wrap">
        <Footer />
      </div>
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <LandingPage />
      </Layout>
    ),
  },
  {
    path: "/studio",
    element: <StudioPage />,
  },
  { path: "/giris", element: <AuthPage mode="login" /> },
  { path: "/kayit", element: <AuthPage mode="signup" /> },
  { path: "/onboarding", element: <OnboardingPage /> },
  { path: "/app", element: <DashboardPage /> },
  { path: "/app/projeler", element: <ProjectListPage /> },
  { path: "/app/projeler/yeni", element: <NewProjectPage /> },
  { path: "/app/ayarlar", element: <SettingsPage /> },
  { path: "/app/faturalandirma", element: <BillingPage /> },
  { path: "/app/projeler/:projectId/studio", element: <StudioPage /> },
]);
