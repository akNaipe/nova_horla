"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erro ao entrar",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({ title: "Login realizado com sucesso!" });
    const redirect = searchParams.get("redirect") || "/";
    router.push(redirect);
    router.refresh();
  };

  return (
    <form onSubmit={handleLogin}>
      <CardContent className="space-y-4">
        <div className="space-y-2 animate-slide-up animate-stagger-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 animate-slide-up animate-stagger-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full btn-hover animate-slide-up animate-stagger-3" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
        <p className="text-sm text-muted-foreground animate-slide-up animate-stagger-4">
          Não tem conta?{" "}
          <Link href="/auth/cadastro" className="text-primary link-underline">
            Cadastre-se
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="container max-w-md mx-auto py-12 animate-fade-in">
      <Card className="card-hover">
        <CardHeader className="animate-slide-up animate-stagger-1">
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Faça login na sua conta</CardDescription>
        </CardHeader>
        <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Carregando...</div>}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
