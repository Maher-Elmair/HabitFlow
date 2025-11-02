import "./App.css";
import { ThemeProvider } from "@/theme/theme-provider";
import { Home, Profile, Analytics } from "./_root/pages";
import { Route, Routes } from "react-router";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import History from "./_root/pages/History";
import { Toaster } from "@/components/ui/sonner";
import AuthForm from "./_auth/forms/AuthForm";

function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<AuthForm />} />
          <Route path="/sign-up" element={<AuthForm />} />
        </Route>

        {/* Private Routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;