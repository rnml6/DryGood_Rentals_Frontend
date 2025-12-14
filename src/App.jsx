import "./App.css";
import CsMainpage from "./customer/csMainpage";
import CustomerHomepage from "./customer/csPages/csHomepage";
import CustomerProductPage from "./customer/csPages/csProductPage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <CsMainpage />,
    children: [
      { index: true, element: <CustomerHomepage /> },
      { path: "product", element: <CustomerProductPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
export default App;
