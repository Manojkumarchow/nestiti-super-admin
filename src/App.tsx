import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import CreateBuilding from "./pages/CreateBuilding";
import CreateProfile from "./pages/CreateProfile";
import ImageUploadPage from "./pages/ImageUpload";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ServiceOrdersPage from "./pages/ServiceOrders";
import ComplaintsPage from "./pages/Complaints";
import NotificationsPage from "./pages/Notifications";
import UsersPage from "./pages/Users";
import BuildingsPage from "./pages/Buildings";
import VisitorCheckIn from "./pages/VisitorCheckIn";
import VisitorCheckInSuccess from "./pages/VisitorCheckInSuccess";

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

/** Every route except guest check-in uses this; unauthenticated users are sent to /login. */
const ProtectedOutlet = () => (
  <RequireAuth>
    <Outlet />
  </RequireAuth>
);

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
            {/* Only these paths skip RequireAuth. /login and / must stay outside so admins can sign in. */}
            <Route path="/visitor-check-in" element={<VisitorCheckIn />} />
            <Route path="/visitor-check-in/success" element={<VisitorCheckInSuccess />} />
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
            <Route element={<ProtectedOutlet />}>
              <Route
                path="/building"
                element={
                  <AppLayout>
                    <CreateBuilding />
                  </AppLayout>
                }
              />
              <Route
                path="/profile"
                element={
                  <AppLayout>
                    <CreateProfile />
                  </AppLayout>
                }
              />
              <Route
                path="/upload"
                element={
                  <AppLayout>
                    <ImageUploadPage />
                  </AppLayout>
                }
              />
              <Route
                path="/service-orders"
                element={
                  <AppLayout>
                    <ServiceOrdersPage />
                  </AppLayout>
                }
              />
              <Route
                path="/complaints"
                element={
                  <AppLayout>
                    <ComplaintsPage />
                  </AppLayout>
                }
              />
              <Route
                path="/notifications"
                element={
                  <AppLayout>
                    <NotificationsPage />
                  </AppLayout>
                }
              />
              <Route
                path="/users"
                element={
                  <AppLayout>
                    <UsersPage />
                  </AppLayout>
                }
              />
              <Route
                path="/buildings"
                element={
                  <AppLayout>
                    <BuildingsPage />
                  </AppLayout>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
