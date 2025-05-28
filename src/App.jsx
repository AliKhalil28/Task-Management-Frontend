"use client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import TaskDashboard from "./components/Tasks/TaskDashboard";
import ProfileCard from "./components/Auth/ProfileCard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import Toast from "./components/UI/Toast";
import GenerateFavicon from "./components/Favicon/GenerateFavicon";

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark flex flex-col">
      <GenerateFavicon />
      <Router>
        {user && <Header />}
        <main className="flex-1">
          <Routes>
            <Route
              path="/login"
              element={!user ? <LoginForm /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/register"
              element={!user ? <RegisterForm /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/dashboard"
              element={user ? <TaskDashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={user ? <ProfileCard /> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={<Navigate to={user ? "/dashboard" : "/login"} />}
            />
          </Routes>
        </main>
        {user && <Footer />}
      </Router>
      <Toast />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
