import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

const isUnauthorizedError = (error: unknown) => {
  if (typeof window === "undefined") return false;
  const err = error as any;
  const status = err?.status ?? err?.response?.status;
  const message = typeof err?.message === "string" ? err.message : "";
  return status === 401 || message.toLowerCase().includes("unauthorized");
};

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!isUnauthorizedError(error)) return;
  if (typeof window === "undefined") return;
  const publicPaths = ["/", "/auth", "/login", "/404"];
  if (publicPaths.includes(window.location.pathname)) return;
  if (window.location.pathname.startsWith("/login")) return;
  if (window.location.pathname.startsWith("/auth")) return;

  window.location.href = "/auth";
};

const shouldLogApiError = (error: unknown) => !isUnauthorizedError(error);

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    if (shouldLogApiError(error)) {
      console.error("[API Query Error]", error);
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    if (shouldLogApiError(error)) {
      console.error("[API Mutation Error]", error);
    }
  }
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
