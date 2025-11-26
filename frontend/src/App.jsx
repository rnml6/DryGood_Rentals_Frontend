import "./App.css";
import CsMainpage from "./customer/csMainpage";
import AdminPage from "./admin/adMainpage";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <CsMainpage />,
  },

  {
    path: "/admin",
    element: <AdminPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
