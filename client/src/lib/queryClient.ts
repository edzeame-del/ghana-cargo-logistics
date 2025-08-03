import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }

          throw new Error(`${res.status}: ${await res.text()}`);
        }

        return res.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    }
  },
});

export function getQueryFn({ on401 }: { on401?: "returnNull" } = {}) {
  return async ({ queryKey }: { queryKey: readonly (string | number)[] }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (!res.ok) {
      if (res.status === 401 && on401 === "returnNull") {
        return null;
      }
      if (res.status >= 500) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      throw new Error(`${res.status}: ${await res.text()}`);
    }

    return res.json();
  };
}

export async function apiRequest(
  method: string,
  url: string,
  body?: any
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `${res.status}: ${res.statusText}`);
  }

  return res;
}
