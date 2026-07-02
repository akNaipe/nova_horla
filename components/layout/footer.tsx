import { Waves } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-8 mt-12 wave-divider">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Waves className="h-5 w-5 text-primary" />
              Nova Horla
            </h3>
            <p className="text-sm text-muted-foreground">
              Produtos com a energia do mar. Frescor, estilo e qualidade que fluem como as ondas.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-3">Navegue</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/loja" className="hover:text-primary">Todos os Produtos</a></li>
              <li><a href="/carrinho" className="hover:text-primary">Carrinho</a></li>
              <li><a href="/auth/login" className="hover:text-primary">Minha Conta</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-3">Contato</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>ola@novahorla.com.br</li>
              <li>(11) 99999-9999</li>
              <li>Seg-Sex: 9h às 18h</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Nova Horla. Feito com a energia do mar 🌊
        </div>
      </div>
    </footer>
  );
}
