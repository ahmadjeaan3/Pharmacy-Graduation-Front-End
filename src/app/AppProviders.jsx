import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthProvider";
import { queryClient } from "../shared/lib/queryClient";
import { LanguageProvider } from "../shared/i18n/LanguageProvider";

export function AppProviders({ children }) {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </LanguageProvider>
  );
}
