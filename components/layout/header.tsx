"use client";

import Link from "next/link";
import { Waves, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { NotificacaoBadge } from "@/components/notificacoes/notificacao-provider";
import { ToggleTema } from "@/components/toggle-tema";
import { BuscaAutocomplete } from "@/components/produtos/busca-autocomplete";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Tenta pegar sessão do cookie primeiro (mais rápido que getUser)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    });

    // Escuta mudanças de auth em tempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }, [supabase, router]);

  const isAdmin = user?.user_metadata?.is_admin === true;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Waves className="h-6 w-6 text-primary" />
          <span>Nova Horla</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">Home</Link>
          <Link href="/loja" className="text-sm font-medium hover:text-primary">Loja</Link>
          <Link href="/carrinho" className="text-sm font-medium hover:text-primary">Carrinho</Link>
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-blue-600 hover:text-blue-800">Admin</Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="w-48"><BuscaAutocomplete /></div>
          <ToggleTema />
          {loading ? (
            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          ) : user ? (
            <>
              {isAdmin && <NotificacaoBadge />}
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Sair</Button>
            </>
          ) : (
            <>
              <Link href="/auth/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
              <Link href="/auth/cadastro"><Button size="sm">Cadastrar</Button></Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden border-t p-4 bg-background">
          <nav className="flex flex-col gap-4">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Home</Link>
            <Link href="/loja" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Loja</Link>
            <Link href="/carrinho" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Carrinho</Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-blue-600">Admin</Link>
            )}
            <hr />
            {loading ? null : user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout}>Sair</Button>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link href="/auth/cadastro" onClick={() => setMenuOpen(false)}>
                  <Button size="sm">Cadastrar</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
