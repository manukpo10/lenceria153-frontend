"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

type MockContextType = {
  useMock: boolean;
  toggle: () => void;
};

const MockContext = createContext<MockContextType>({
  useMock: false,
  toggle: () => {},
});

export function MockProvider({ children }: { children: ReactNode }) {
  const [useMock, setUseMock] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUseMock(sessionStorage.getItem("mockMode") === "true");
  }, []);

  const toggle = useCallback(() => {
    if (!mounted) return;
    const wasMock = sessionStorage.getItem("mockMode") === "true";
    const next = !wasMock;
    sessionStorage.setItem("mockMode", String(next));
    setUseMock(next);
    window.location.reload();
  }, [mounted]);

  return (
    <MockContext.Provider value={{ useMock, toggle }}>
      {children}
    </MockContext.Provider>
  );
}

export function useMockMode() {
  return useContext(MockContext);
}

export function isMockActive(): boolean {
  return sessionStorage.getItem("mockMode") === "true";
}