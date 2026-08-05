import { createBrowserRouter } from 'react-router-dom';
import { Nav } from './components/layout';
import { Footer } from './components/layout';
import { LandingPage } from './features/landing';

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
    path: '/',
    element: <Layout><LandingPage /></Layout>,
  },
]);
