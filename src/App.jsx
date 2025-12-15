import "./App.css";
import CsMainpage from "./customer/csMainpage";
import AdminPage from "./admin/adMainpage";

import AdminInventory from "./admin/adPages/adInventory";
import AdminRecord from "./admin/adPages/adRecord";
import AdminHomepage from "./admin/adPages/adHomepage";

import CustomerHomepage from "./customer/csPages/csHomepage";
import CustomerProductPage from "./customer/csPages/csProductPage";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./admin/adComponents/protectedRoute";

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
    children: [
      { index: true, element: <AdminHomepage /> },
      { path: "inventory", element: <AdminInventory /> },
      { path: "record", element: <AdminRecord /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
