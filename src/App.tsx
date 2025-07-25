
import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import SecurityHeaders from "@/components/SecurityHeaders";
import { GoogleAuthProvider } from "@/contexts/GoogleAuthContext";
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
        <GoogleAuthProvider>
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
            <Route path="/professionals/:gender" element={<ProfessionalsList />} />
            <Route path="/stylists" element={<StylistsList />} />
            <Route path="/components" element={<ComponentsDemo />} />
            
            {/* Routes d'authentification */}
            <Route path="/auth" element={<RoleAuthPage />} />
            <Route path="/role-auth" element={<RoleAuthPage />} />
            <Route path="/login" element={
              <Suspense fallback={<LoadingSpinner />}>
                {React.createElement(React.lazy(() => import('./pages/LoginPage')))}
              </Suspense>
            } />
            <Route path="/post-auth" element={<PostAuthPage />} />
            <Route path="/403" element={<AccessDeniedPage />} />
            <Route path="/signup-hairdresser" element={<SignupHairdresser />} />
            
            {/* Routes protégées - Admin seulement */}
            <Route 
              path="/admin" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="users" element={<Users />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<PlatformSettings />} />
              <Route path="audit" element={<AuditTrail />} />
            </Route>
            
            {/* Legacy admin route */}
            <Route 
              path="/admin-dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              } 
            />
            
            {/* Routes protégées - Coiffeur/Stylist seulement */}
            <Route 
              path="/stylist" 
              element={
                <RoleProtectedRoute allowedRoles={['coiffeur']}>
                  <StylistLayout />
                </RoleProtectedRoute>
              }
            >
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
              <Route path="chat" element={<div className="p-6"><ClientChatPane /></div>} />
              <Route path="settings" element={<StylistSettings />} />
            </Route>
            
            {/* Legacy routes - redirect to new stylist layout */}
            <Route 
              path="/coiffeur" 
              element={
                <RoleProtectedRoute allowedRoles={['coiffeur']}>
                  <CoiffeurDashboard />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/hairdresser" 
              element={
                <RoleProtectedRoute allowedRoles={['coiffeur']}>
                  <CoiffeurDashboard />
                </RoleProtectedRoute>
              } 
            />
            
            {/* Routes protégées - Client seulement */}
            <Route 
              path="/client" 
              element={
                <RoleProtectedRoute allowedRoles={['client']}>
                  <ClientLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<div />} /> {/* Default empty route */}
              <Route path="history" element={<ClientHistory />} />
              <Route path="bookings" element={
                <Suspense fallback={<LoadingSpinner />}>
                  {React.createElement(React.lazy(() => import('./pages/ClientBookingsPage')))}
                </Suspense>
              } />
            </Route>
            
            {/* Nouvelle route /app pour les clients */}
            <Route 
              path="/app" 
              element={
                <RoleProtectedRoute allowedRoles={['client']}>
                  <ClientLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={
                <Suspense fallback={<LoadingSpinner />}>
                  {React.createElement(React.lazy(() => import('./pages/client/ClientDashboard')))}
                </Suspense>
              } />
              <Route path="bookings" element={
                <Suspense fallback={<LoadingSpinner />}>
                  {React.createElement(React.lazy(() => import('./pages/client/BookingsPage')))}
                </Suspense>
              } />
              <Route path="bookings/new" element={
                <Suspense fallback={<LoadingSpinner />}>
                  {React.createElement(React.lazy(() => import('./pages/client/NewBookingPage')))}
                </Suspense>
              } />
              <Route path="history" element={<ClientHistory />} />
              <Route path="profile" element={
                <Suspense fallback={<LoadingSpinner />}>
                  {React.createElement(React.lazy(() => import('./pages/client/ProfilePage')))}
                </Suspense>
              } />
              <Route path="notifications" element={
                <Suspense fallback={<LoadingSpinner />}>
                  {React.createElement(React.lazy(() => import('./pages/client/NotificationCenter')))}
                </Suspense>
              } />
              <Route path="reviews" element={
                <Suspense fallback={<LoadingSpinner />}>
                  {React.createElement(React.lazy(() => import('./pages/client/MyReviewsPage')))}
                </Suspense>
              } />
              <Route path="support" element={
                <Suspense fallback={<LoadingSpinner />}>
                  {React.createElement(React.lazy(() => import('./pages/client/SupportPage')))}
                </Suspense>
              } />
              <Route path="booking" element={
                <Suspense fallback={<LoadingSpinner />}>
                  {React.createElement(React.lazy(() => import('./pages/BookingPage')))}
                </Suspense>
              } />
            </Route>
            
            {/* Legacy route - redirect to new client layout */}
            <Route 
              path="/client-dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </RoleProtectedRoute>
              } 
            />
            
            {/* Routes protégées - Utilisateurs authentifiés */}
            <Route 
              path="/reservation/:hairdresserId" 
              element={
                <RoleProtectedRoute allowedRoles={['client', 'admin', 'coiffeur']}>
                  <ReservationPage />
                </RoleProtectedRoute>
              } 
            />
            
            {/* Route profil stylist */}
            <Route 
              path="/stylist/:stylistId" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  {React.createElement(React.lazy(() => import('./pages/StylistProfilePage')))}
                </Suspense>
              } 
            />
            
            
            {/* Route de réservation */}
            <Route 
              path="/reserve/:serviceId" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  {React.createElement(React.lazy(() => import('./pages/ReservePage')))}
                </Suspense>
              } 
            />
            
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
          </TooltipProvider>
        </GoogleAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
