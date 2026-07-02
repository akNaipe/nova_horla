"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Notificacao {
  id: string;
  tipo: "novo_pedido" | "status_atualizado";
  pedido_id: string;
  message: string;
  lida: boolean;
  created_at: string;
}

interface NotificacaoContextType {
  notificacoes: Notificacao[];
  naoLidas: number;
  abrirMenu: boolean;
  setAbrirMenu: (v: boolean) => void;
  marcarLida: (id: string) => void;
}

const NotificacaoContext = createContext<NotificacaoContextType | null>(null);

export function NotificacaoProvider({ children }: { children: React.ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [abrirMenu, setAbrirMenu] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const somPlayed = useRef<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAdmin(data.user?.user_metadata?.is_admin === true);
    });
  }, []);

  const adicionarNotificacao = useCallback((pedidoId: string, message: string) => {
    const id = `${pedidoId}-${Date.now()}`;
    const nova: Notificacao = {
      id,
      tipo: "novo_pedido",
      pedido_id: pedidoId,
      message,
      lida: false,
      created_at: new Date().toISOString(),
    };
    setNotificacoes((prev) => [nova, ...prev].slice(0, 20));

    if (!somPlayed.current.has(pedidoId)) {
      somPlayed.current.add(pedidoId);
    }

    toast({
      title: "🛒 Novo Pedido!",
      description: message,
      action: (
        <Link href={`/admin/pedidos`}>
          <Button size="sm" variant="outline">Ver</Button>
        </Link>
      ),
    });
  }, [toast]);

  useEffect(() => {
    if (!isAdmin) return;

    // Buscar notificações ao conectar
    const channel = supabase
      .channel("pedidos-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pedidos" },
        (payload) => {
          const pedido = payload.new as { id: string; total: number };
          adicionarNotificacao(
            pedido.id,
            `Novo pedido #${pedido.id.slice(0, 8)} - ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(pedido.total))}`
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, supabase, adicionarNotificacao]);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const marcarLida = (id: string) => {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  return (
    <NotificacaoContext.Provider value={{ notificacoes, naoLidas, abrirMenu, setAbrirMenu, marcarLida }}>
      {children}
    </NotificacaoContext.Provider>
  );
}

export function useNotificacoes() {
  const ctx = useContext(NotificacaoContext);
  if (!ctx) throw new Error("useNotificacoes deve estar dentro de NotificacaoProvider");
  return ctx;
}

export function NotificacaoBadge() {
  const { naoLidas, notificacoes, abrirMenu, setAbrirMenu, marcarLida } = useNotificacoes();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAbrirMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [setAbrirMenu]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setAbrirMenu(!abrirMenu)}
        className="relative p-2 rounded-md hover:bg-accent transition-colors"
      >
        <Bell className="h-5 w-5" />
        {naoLidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {abrirMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-card border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <p className="text-sm font-medium">Notificações</p>
            {naoLidas > 0 && (
              <span className="text-[10px] text-muted-foreground">{naoLidas} nova(s)</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <Bell className="h-6 w-6 mx-auto mb-2 opacity-50" />
                Nenhuma notificação
              </div>
            ) : (
              notificacoes.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer ${!n.lida ? "bg-accent/30" : ""}`}
                  onClick={() => marcarLida(n.id)}
                >
                  <Link href="/admin/pedidos" className="block">
                    <p className="text-sm">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleTimeString("pt-BR")}
                    </p>
                  </Link>
                </div>
              ))
            )}
          </div>
          {notificacoes.length > 0 && (
            <Link
              href="/admin/pedidos"
              className="block p-2 text-center text-xs text-primary hover:bg-accent transition-colors"
              onClick={() => setAbrirMenu(false)}
            >
              Ver todos os pedidos
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
