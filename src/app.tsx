import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";
import { AdminShell } from "./components/AdminShell";

// Lazy import all pages
import { lazy, Suspense } from "react";

const HomePage = lazy(() => import("./pages/Home"));
const PropertiesPage = lazy(() => import("./pages/Properties"));
const AboutPage = lazy(() => import("./pages/About"));
const TestimonialsPage = lazy(() => import("./pages/Testimonials"));
const ContactPage = lazy(() => import("./pages/Contact"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminRegister = lazy(() => import("./pages/admin/Register"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProperties = lazy(() => import("./pages/admin/Properties"));
const AdminInquiries = lazy(() => import("./pages/admin/Inquiries"));
const AdminTeam = lazy(() => import("./pages/admin/Team"));

const Loader = () => (
  <div className="min-h-screen bg-navy flex items-center justify-center">
    <div className="text-gold text-xl">Loading...</div>
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<SiteLayout><HomePage /></SiteLayout>} />
          <Route path="/properties" element={<SiteLayout><PropertiesPage /></SiteLayout>} />
          <Route path="/about" element={<SiteLayout><AboutPage /></SiteLayout>} />
          <Route path="/testimonials" element={<SiteLayout><TestimonialsPage /></SiteLayout>} />
          <Route path="/contact" element={<SiteLayout><ContactPage /></SiteLayout>} />

          {/* Admin routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminShell><AdminDashboard /></AdminShell>} />
          <Route path="/admin/properties" element={<AdminShell><AdminProperties /></AdminShell>} />
          <Route path="/admin/inquiries" element={<AdminShell><AdminInquiries /></AdminShell>} />
          <Route path="/admin/team" element={<AdminShell><AdminTeam /></AdminShell>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}