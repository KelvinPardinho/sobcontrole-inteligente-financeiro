
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  redirectText?: string;
  redirectPath?: string;
  redirectLabel?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  redirectText,
  redirectPath,
  redirectLabel,
}: AuthLayoutProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-sob-light-gray p-4">
      <div className="w-full max-w-md animate-fade-in space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-sob-dark">
            <span className="text-sob-blue">Sob</span>Controle
          </h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          {children}
        </div>
        {redirectText && redirectPath && redirectLabel && (
          <div className="text-center text-sm">
            <p className="text-gray-600">
              {redirectText}{" "}
              <Link to={redirectPath} className="font-medium text-sob-blue hover:underline">
                {redirectLabel}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
