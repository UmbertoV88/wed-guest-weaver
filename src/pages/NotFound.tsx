import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import CommonHeader from "@/components/CommonHeader";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-100">
      <CommonHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
          <a href="/" className="text-blue-500 underline hover:text-blue-700">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
