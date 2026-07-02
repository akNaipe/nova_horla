export function Footer() {
  return (
    <footer className="border-t py-8 mt-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">Nova Loja</h3>
            <p className="text-sm text-muted-foreground">
              Sua loja virtual de confiança. Produtos de qualidade com os melhores preços.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-3">Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/loja" className="hover:text-primary">Todos os Produtos</a></li>
              <li><a href="/carrinho" className="hover:text-primary">Carrinho</a></li>
              <li><a href="/auth/login" className="hover:text-primary">Minha Conta</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-3">Contato</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contato@novaloja.com.br</li>
              <li>(11) 99999-9999</li>
              <li>Seg-Sex: 9h às 18h</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Nova Loja. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
