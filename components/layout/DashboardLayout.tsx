import React from "react";
import { Sidebar } from "./Sidebar";

export const DashboardLayout = ({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="relative min-h-screen bg-pixel-grid">
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <Sidebar email={email} />
        <main className="mx-auto w-full max-w-screen-xl flex-1 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 animate-page">
          {children}
        </main>
      </div>
    </div>
  );
};
