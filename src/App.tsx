import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import SecurityHeaders from "@/components/SecurityHeaders";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

// Lazy loading des pages
const Index = lazy(() => import("./pages/Index"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const RoleAuthPage = lazy(() => import("./pages/RoleAuthPage"));
const GoogleLoginPage = lazy(() => import("./pages/GoogleLoginPage"));
const PostAuthPage = lazy(() => import("./pages/PostAuthPage"));
const AccessDeniedPage = lazy(() => import("./pages/AccessDeniedPage"));
const SignupHairdresser = lazy(() => import("./pages/SignupHairdresser"));
const ProfessionalsList = lazy(() => import("./pages/ProfessionalsList"));
const ReservationPage = lazy(() => import("./pages/ReservationPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CoiffeurDashboard = lazy(() => import("./pages/CoiffeurDashboard"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const ComponentsDemo = lazy(() => import("./pages/ComponentsDemo"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy loading des layouts
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const ClientLayout = lazy(() => import("./layouts/ClientLayout"));

// Lazy loading des pages admin
const Overview = lazy(() => import("./pages/admin/Overview"));
const Users = lazy(() => import("./pages/admin/Users"));
const Bookings = lazy(() => import("./pages/admin/Bookings"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const PlatformSettings = lazy(() => import("./pages/admin/PlatformSettings"));
const AuditTrail = lazy(() => import("./pages/admin/AuditTrail"));

// Lazy loading des pages client
const ClientHistory = lazy(() => import("./pages/client/History"));

// Lazy loading des layouts stylist
const StylistLayout = lazy(() => import("./layouts/StylistLayout"));

// Lazy loading des pages stylist  
const StylistDashboard = lazy(() => import("./pages/stylist/StylistDashboard"));
const StylistSettings = lazy(() => import("./pages/stylist/SalonSettings"));
const StylistsList = lazy(() => import("./pages/StylistsList"));
const BookingQueue = lazy(() => import("./components/BookingQueue"));
const WeeklyCalendar = lazy(() => import("./components/WeeklyCalendar"));
const ClientChatPane = lazy(() => import("./components/ClientChatPane"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Chargement...</p>
    </div>
  </div>
);

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="beauty-salon-theme">
        <TooltipProvider>
          <SecurityHeaders />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Index />} />
                <Route path="/services" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    {React.createElement(React.lazy(() => import('./pages/ServicesListPage')))}
                  </Suspense>
                } />
                <Route path="/auth" element={<RoleAuthPage />} />
                <Route path="/admin" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </RoleProtectedRoute>
                }>
                  <Route index element={<Overview />} />
                  <Route path="users" element={<Users />} />
                </Route>
                <Route path="/stylist" element={
                  <RoleProtectedRoute allowedRoles={['coiffeur', 'stylist']}>
                    <StylistLayout />
                  </RoleProtectedRoute>
                } />
                <Route path="/app" element={
                  <RoleProtectedRoute allowedRoles={['client', 'admin']}>
                    <ClientLayout />
                  </RoleProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
