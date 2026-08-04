import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirects the root URL to the registration page. */}
        <Route
          path="/"
          element={<Navigate to="/register" replace />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* Handles unknown routes with a predictable fallback. */}
        <Route
          path="*"
          element={<Navigate to="/register" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;