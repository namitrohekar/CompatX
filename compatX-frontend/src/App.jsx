import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./components/layout/AdminNavbar";

export default function App() {
  return (
    

      <div>
          <AdminNavbar />
          <div className="p-6">
            <Outlet/>
          </div>
      </div>


  );
}
