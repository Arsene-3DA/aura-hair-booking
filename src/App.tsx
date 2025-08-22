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
import RoleGuard from "@/components/RoleGuard";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { CanadianLocalizationProvider } from "@/components/CanadianLocalizationProvider";
import { RouteTracker } from "@/components/RouteTracker";
import { BrokenLinkDetector } from "@/components/BrokenLinkDetector";
import { NotFound } from "@/components/NotFound";
import RoleDashboardRedirect from "@/components/RoleDashboardRedirect";
import { SmartRedirect } from "@/components/SmartRedirect";
import { AdminRedirect } from "@/components/AdminRedirect";
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
const ContactPage = lazy(() => import("./pages/ContactPage"));

// Lazy loading des layouts stylist
const StylistLayout = lazy(() => import("./layouts/StylistLayout"));

// Lazy loading des pages stylist  
const StylistDashboard = lazy(() => import("./pages/stylist/StylistDashboard"));
const StylistSettings = lazy(() => import("./pages/stylist/SalonSettings"));
const StylistsList = lazy(() => import("./pages/StylistsList"));
const BookingQueue = lazy(() => import("./components/BookingQueue"));
const WeeklyCalendar = lazy(() => import("./components/WeeklyCalendar"));
const ClientChatPane = lazy(() => import("./components/ClientChatPane"));
const AutoLogout = lazy(() => import("./components/AutoLogout"));
const SessionDiagnostic = lazy(() => import("./components/SessionDiagnostic"));
const ProfessionalDataDiagnostic = lazy(() => import("./components/ProfessionalDataDiagnostic"));

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
                <SmartRedirect>
                <AdminRedirect>
                <RouteTracker>
                  <BrokenLinkDetector>
                       <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Index />} />
                <Route path="/services" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    {React.createElement(React.lazy(() => import('./pages/ServicesPage')))}
                  </Suspense>
                } />
                <Route path="/tarifs" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    {React.createElement(React.lazy(() => import('./pages/TarifsPage')))}
                  </Suspense>
                } />
                <Route path="/professionals" element={
                  <Suspense fallback={<div>Chargement...</div>}>
                    {React.createElement(React.lazy(() => import('./pages/AllProfessionalsList')))}
                  </Suspense>
                } />
                <Route path="/coiffeurs" element={
                  <Suspense fallback={<div>Chargement...</div>}>
                    {React.createElement(React.lazy(() => import('./pages/CoiffeursPage')))}
                  </Suspense>
                } />
                <Route path="/coiffeuses" element={
                  <Suspense fallback={<div>Chargement...</div>}>
                    {React.createElement(React.lazy(() => import('./pages/CoiffeusesPage')))}
                  </Suspense>
                } />
                <Route path="/cosmetique" element={
                  <Suspense fallback={<div>Chargement...</div>}>
                    {React.createElement(React.lazy(() => import('./pages/CosmetiquePage')))}
                  </Suspense>
                } />
                {/* Legacy routes for backward compatibility */}
                <Route path="/professionals/:role" element={<ProfessionalsList />} />
                {/* Test page for role system */}
                <Route path="/test-roles" element={
                  <Suspense fallback={<div>Chargement...</div>}>
                    {React.createElement(React.lazy(() => import('./pages/TestRoleSystemPage')))}
                  </Suspense>
                } />
                <Route path="/auth" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    {React.createElement(React.lazy(() => import('./pages/ModernAuthPage')))}
                  </Suspense>
                } />
                <Route path="/connexion" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    {React.createElement(React.lazy(() => import('./pages/ModernAuthPage')))}
                  </Suspense>
                } />
                <Route path="/stylists" element={<StylistsList />} />
                <Route path="/stylist/:stylistId" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    {React.createElement(React.lazy(() => import('./pages/StylistProfilePage')))}
                  </Suspense>
                 } />
                <Route path="/professional/:professionalId" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    {React.createElement(React.lazy(() => import('./pages/ProfessionalProfilePage')))}
                  </Suspense>
                } />
                <Route path="/reservation/:stylistId" element={<ReservationPage />} />
                <Route path="/review/:token" element={<ReviewPage />} />
                
                {/* Post-login Hub */}
                <Route path="/post-login" element={<PostAuthPage />} />
                
        {/* Auto logout route */}
        <Route path="/logout" element={<AutoLogout />} />
                
                {/* Session diagnostic route */}
                <Route path="/session-diagnostic" element={<SessionDiagnostic />} />
                <Route path="/data-diagnostic" element={<ProfessionalDataDiagnostic />} />
                
                <Route path="/admin" element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminLayout />
                  </RoleGuard>
                }>
                  <Route index element={<Overview />} />
                  <Route path="users" element={<Users />} />
                  <Route path="bookings" element={<Bookings />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="audit" element={<AuditTrail />} />
                  <Route path="settings" element={<PlatformSettings />} />
                </Route>
                <Route path="/stylist" element={
                  <RoleGuard allowedRoles={['coiffeur', 'coiffeuse', 'cosmetique', 'stylist']}>
                    <StylistLayout />
                  </RoleGuard>
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
                  <RoleGuard allowedRoles={['client']}>
                    <ClientLayout />
                  </RoleGuard>
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
                <Route path="/expert/:expertId" element={<ExpertDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />
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
         </AdminRedirect>
         </SmartRedirect>
      </BrowserRouter>
            </EnhancedSecurityProvider>
        </TooltipProvider>
        </CanadianLocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
