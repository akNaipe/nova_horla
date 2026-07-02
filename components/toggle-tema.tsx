"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function ToggleTema() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("tema");
    const isDark = saved === "dark" || (!saved && true);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const novo = !dark;
    setDark(novo);
    document.documentElement.classList.toggle("dark", novo);
    localStorage.setItem("tema", novo ? "dark" : "light");
  };

  return (
    <button onClick={toggle} className="p-2 rounded-md hover:bg-accent transition-colors" title={dark ? "Modo claro" : "Modo escuro"}>
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
