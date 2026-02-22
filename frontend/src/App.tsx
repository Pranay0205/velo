import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "./routes/Layout";
import Daily from "./routes/Daily";
import Goals from "./routes/Goals";
import Signup from "./routes/Signup";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Daily />} />
          <Route path="goals" element={<Goals />} />
        </Route>
        <Route path="signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}
