import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import CreateBuilding from "./pages/CreateBuilding";
import CreateProfile from "./pages/CreateProfile";
import ImageUploadPage from "./pages/ImageUpload";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    {children}
  </div>
);

const AUTH_KEY = "super_admin_authenticated";

const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
};

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  if (isAuthenticated()) {
    return <Navigate to="/building" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/"
              element={<Navigate to={isAuthenticated() ? "/building" : "/login"} replace />}
            />
            <Route
              path="/building"
              element={
                <RequireAuth>
                  <AppLayout>
                    <CreateBuilding />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <AppLayout>
                    <CreateProfile />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/upload"
              element={
                <RequireAuth>
                  <AppLayout>
                    <ImageUploadPage />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="*"
              element={
                <RequireAuth>
                  <NotFound />
                </RequireAuth>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
