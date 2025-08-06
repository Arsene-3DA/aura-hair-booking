import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import AuthenticatedRoute from "@/components/AuthenticatedRoute";
import { EnhancedSecurityProvider } from "@/components/EnhancedSecurityProvider";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { CanadianLocalizationProvider } from "@/components/CanadianLocalizationProvider";
import { RouteTracker } from "@/components/RouteTracker";
import { BrokenLinkDetector } from "@/components/BrokenLinkDetector";
import { NotFound } from "@/components/NotFound";
import "@/lib/i18n";

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

const ServicesListPage = lazy(() => import("./pages/ServicesListPage"));
const ReviewPage = lazy(() => import("./pages/ReviewPage"));

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
const ClientDashboardPage = lazy(() => import("./pages/client/ClientDashboard"));
const BookingsPage = lazy(() => import("./pages/client/BookingsPage"));
const MyReservationsPage = lazy(() => import("./pages/client/MyReservationsPage"));
const NewBookingPage = lazy(() => import("./pages/client/NewBookingPage"));
const ProfilePage = lazy(() => import("./pages/client/ProfilePage"));
const ReviewsPage = lazy(() => import("./pages/client/ReviewsPage"));
const NotificationCenter = lazy(() => import("./pages/client/NotificationCenter"));
const SupportPage = lazy(() => import("./pages/client/SupportPage"));
const ClientHistory = lazy(() => import("./pages/client/History"));

// Lazy loading des pages expertsHere's the updated content for the file src/App.tsx:
const ExpertsPage = lazy(() => import("./pages/ExpertsPage"));
const ExpertDetailPage = lazy(() => import("./pages/ExpertDetailPage"));
const NewBookingFormPage = lazy(() => import("./pages/NewBookingFormPage"));

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
        <CanadianLocalizationProvider>
          <TooltipProvider>
            <EnhancedSecurityProvider enableStrictMode={true} showWarnings={true}>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <RouteTracker>
                  <BrokenLinkDetector>
                    <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<ServicesListPage />} />
                <Route path="/tarifs" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    {React.createElement(React.lazy(() => import('./pages/TarifsPage')))}
                  </Suspense>
                } />
                <Route path="/professionals" element={<StylistsList />} />
                <Route path="/professionals/:gender" element={<ProfessionalsList />} />
                <Route path="/auth" element={<RoleAuthPage />} />
                <Route path="/stylists" element={<StylistsList />} />
                <Route path="/stylist/:stylistId" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    {React.createElement(React.lazy(() => import('./pages/StylistProfilePage')))}
                  </Suspense>
                } />
                <Route path="/reservation/:stylistId" element={<ReservationPage />} />
                <Route path="/review/:token" element={<ReviewPage />} />
                <Route path="/admin" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </RoleProtectedRoute>
                }>
                  <Route index element={<Overview />} />
                  <Route path="users" element={<Users />} />
                  <Route path="bookings" element={<Bookings />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="audit" element={<AuditTrail />} />
                  <Route path="settings" element={<PlatformSettings />} />
                </Route>
                <Route path="/stylist" element={
                  <RoleProtectedRoute allowedRoles={['coiffeur', 'coiffeuse']}>
                    <StylistLayout />
                  </RoleProtectedRoute>
                }>
                  <Route index element={
                    <Suspense fallback={<LoadingSpinner />}>
                      {React.createElement(React.lazy(() => import('./pages/stylist/StylistDashboardPage')))}
                    </Suspense>
                  } />
                  <Route path="calendar" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      {React.createElement(React.lazy(() => import('./pages/stylist/StylistCalendarPage')))}
                    </Suspense>
                  } />
                  <Route path="queue" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      {React.createElement(React.lazy(() => import('./pages/stylist/StylistQueuePage')))}
                    </Suspense>
                  } />
                  <Route path="clients" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      {React.createElement(React.lazy(() => import('./pages/stylist/StylistClientsPage')))}
                    </Suspense>
                  } />
                  <Route path="services" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      {React.createElement(React.lazy(() => import('./pages/stylist/StylistServicesPage')))}
                    </Suspense>
                  } />
                  <Route path="portfolio" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      {React.createElement(React.lazy(() => import('./pages/stylist/StylistPortfolioPage')))}
                    </Suspense>
                  } />
                  <Route path="chat" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      {React.createElement(React.lazy(() => import('./pages/stylist/StylistChatPage')))}
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      {React.createElement(React.lazy(() => import('./pages/stylist/SalonSettings')))}
                    </Suspense>
                  } />
                </Route>
                <Route path="/app" element={
                  <RoleProtectedRoute allowedRoles={['client', 'admin']}>
                    <ClientLayout />
                  </RoleProtectedRoute>
                }>
                  <Route index element={<ClientDashboardPage />} />
                  <Route path="bookings" element={<MyReservationsPage />} />
                  <Route path="bookings/new" element={<NewBookingPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="reviews" element={<ReviewsPage />} />
                  <Route path="notifications" element={<NotificationCenter />} />
                  <Route path="support" element={<SupportPage />} />
                  <Route path="history" element={<ClientHistory />} />
                </Route>
                <Route path="/client" element={
                  <RoleProtectedRoute allowedRoles={['client']}>
                    <ClientLayout />
                  </RoleProtectedRoute>
                }>
                  <Route index element={<ClientDashboardPage />} />
                </Route>

                {/* Routes publiques pour les experts et réservations */}
                <Route path="/experts" element={<ExpertsPage />} />
                <Route path="/experts/:expertId" element={<ExpertDetailPage />} />
                <Route path="/bookings/new" element={
                  <AuthenticatedRoute>
                    <NewBookingFormPage />
                  </AuthenticatedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrokenLinkDetector>
        </RouteTracker>
      </BrowserRouter>
            </EnhancedSecurityProvider>
        </TooltipProvider>
        </CanadianLocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
