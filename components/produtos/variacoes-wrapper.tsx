"use client";

import { useState } from "react";
import { Variacoes } from "./variacoes";

interface VariacoesWrapperProps {
  produtoId: number;
  precoBase: number;
}

export function VariacoesWrapper({ produtoId, precoBase }: VariacoesWrapperProps) {
  const [_, setVariacaoInfo] = useState({ extra: 0, nome: "" });

  return (
    <Variacoes
      produtoId={produtoId}
      precoBase={precoBase}
      onVariacaoChange={(extra, nome) => setVariacaoInfo({ extra, nome })}
    />
  );
}
