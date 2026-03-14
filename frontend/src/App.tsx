import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "./routes/Layout";
import Daily from "./routes/Daily";
import Goals from "./routes/Goals";
import Signup from "./routes/Signup";
import { Toaster } from "@/components/ui/sonner";
import Login from "./routes/Login";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Daily />} />
          <Route path="goals" element={<Goals />} />
        </Route>
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
