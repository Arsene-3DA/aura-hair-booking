
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

// Lazy loading des pages
const Index = lazy(() => import("./pages/Index"));
const RoleAuthPage = lazy(() => import("./pages/RoleAuthPage"));
const SignupHairdresser = lazy(() => import("./pages/SignupHairdresser"));
const ProfessionalsList = lazy(() => import("./pages/ProfessionalsList"));
const ReservationPage = lazy(() => import("./pages/ReservationPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CoiffeurDashboard = lazy(() => import("./pages/CoiffeurDashboard"));
const ComponentsDemo = lazy(() => import("./pages/ComponentsDemo"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Chargement...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Routes publiques pour les clients */}
            <Route path="/" element={<Index />} />
            <Route path="/professionals/:gender" element={<ProfessionalsList />} />
            <Route path="/reservation/:hairdresserId" element={<ReservationPage />} />
            
            {/* Routes d'authentification pour les professionnels */}
            <Route path="/auth" element={<RoleAuthPage />} />
            <Route path="/role-auth" element={<RoleAuthPage />} />
            <Route path="/signup-hairdresser" element={<SignupHairdresser />} />
            
            {/* Routes protégées par rôle - pour professionnels seulement */}
            <Route path="/admin" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/coiffeur" element={
              <RoleProtectedRoute allowedRoles={['coiffeur']}>
                <CoiffeurDashboard />
              </RoleProtectedRoute>
            } />
            
            <Route path="/components" element={<ComponentsDemo />} />
            
            {/* Garder les anciennes routes pour compatibilité */}
            <Route path="/login" element={<RoleAuthPage />} />
            <Route path="/hairdresser" element={
              <RoleProtectedRoute allowedRoles={['coiffeur']}>
                <CoiffeurDashboard />
              </RoleProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
