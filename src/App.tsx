
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import SecureRoute from "@/components/SecureRoute";
import SecurityHeaders from "@/components/SecurityHeaders";

// Lazy loading des pages
const Index = lazy(() => import("./pages/Index"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const RoleAuthPage = lazy(() => import("./pages/RoleAuthPage"));
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
const PlatformSettings = lazy(() => import("./pages/admin/PlatformSettings"));
const AuditTrail = lazy(() => import("./pages/admin/AuditTrail"));

// Lazy loading des pages client
const ClientHistory = lazy(() => import("./pages/client/History"));

// Lazy loading des layouts stylist
const StylistLayout = lazy(() => import("./layouts/StylistLayout"));

// Lazy loading des pages stylist  
const StylistDashboard = lazy(() => import("./pages/stylist/Dashboard"));
const StylistSettings = lazy(() => import("./pages/stylist/SalonSettings"));
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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SecurityHeaders />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/professionals/:gender" element={<ProfessionalsList />} />
            <Route path="/components" element={<ComponentsDemo />} />
            
            {/* Routes d'authentification */}
            <Route path="/auth" element={<RoleAuthPage />} />
            <Route path="/role-auth" element={<RoleAuthPage />} />
            <Route path="/signup-hairdresser" element={<SignupHairdresser />} />
            <Route path="/login" element={<RoleAuthPage />} />
            
            {/* Routes protégées - Admin seulement */}
            <Route 
              path="/admin" 
              element={
                <SecureRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </SecureRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="users" element={<Users />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="settings" element={<PlatformSettings />} />
              <Route path="audit" element={<AuditTrail />} />
            </Route>
            
            {/* Legacy admin route */}
            <Route 
              path="/admin-dashboard" 
              element={
                <SecureRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </SecureRoute>
              } 
            />
            
            {/* Routes protégées - Coiffeur/Stylist seulement */}
            <Route 
              path="/stylist" 
              element={
                <SecureRoute allowedRoles={['coiffeur']}>
                  <StylistLayout />
                </SecureRoute>
              }
            >
              <Route index element={<StylistDashboard />} />
              <Route path="calendar" element={<WeeklyCalendar />} />
              <Route path="queue" element={<BookingQueue />} />
              <Route path="chat" element={<div className="p-6"><ClientChatPane /></div>} />
              <Route path="settings" element={<StylistSettings />} />
            </Route>
            
            {/* Legacy routes - redirect to new stylist layout */}
            <Route 
              path="/coiffeur" 
              element={
                <SecureRoute allowedRoles={['coiffeur']}>
                  <CoiffeurDashboard />
                </SecureRoute>
              } 
            />
            <Route 
              path="/hairdresser" 
              element={
                <SecureRoute allowedRoles={['coiffeur']}>
                  <CoiffeurDashboard />
                </SecureRoute>
              } 
            />
            
            {/* Routes protégées - Client seulement */}
            <Route 
              path="/client" 
              element={
                <SecureRoute allowedRoles={['client']}>
                  <ClientLayout />
                </SecureRoute>
              }
            >
              <Route index element={<div />} /> {/* Default empty route */}
              <Route path="history" element={<ClientHistory />} />
            </Route>
            
            {/* Legacy route - redirect to new client layout */}
            <Route 
              path="/client-dashboard" 
              element={
                <SecureRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </SecureRoute>
              } 
            />
            
            {/* Routes protégées - Utilisateurs authentifiés */}
            <Route 
              path="/reservation/:hairdresserId" 
              element={
                <SecureRoute requireAuth={true}>
                  <ReservationPage />
                </SecureRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
