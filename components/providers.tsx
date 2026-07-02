"use client";

import { Toaster } from "@/components/ui/toaster";
import { NotificacaoProvider } from "@/components/notificacoes/notificacao-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificacaoProvider>
      {children}
      <Toaster />
    </NotificacaoProvider>
  );
}
