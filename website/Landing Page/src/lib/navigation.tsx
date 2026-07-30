import React, { createContext, useContext, type ReactNode } from "react";

export interface NavigationContextType {
  path: string;
  navigate: (to: string) => void;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    return {
      path: typeof window !== "undefined" ? window.location.pathname : "/",
      navigate: (to: string) => {
        if (typeof window !== "undefined") {
          window.history.pushState({}, "", to);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      },
    };
  }
  return context;
}
