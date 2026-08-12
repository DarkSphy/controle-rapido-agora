import React, { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import mascotDoubt from "@/assets/mascot-doubt.png.asset.json";
import { MessageSquare, TrendingUp, Package, AlertTriangle, Play, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "bot";
  content: React.ReactNode;
};

export function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Olá! Sou o seu assistente virtual. Posso te ajudar a extrair dados rápidos da sua conta. O que você gostaria de ver?",
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { products, sales } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: Math.random().toString(), role: "user", content: text }]);
  };

  const addBotMessage = (content: React.ReactNode) => {
    setMessages((prev) => [...prev, { id: Math.random().toString(), role: "bot", content }]);
  };

  const handleAction = (type: "sales_today" | "low_stock" | "stock_value" | "top_products") => {
    if (type === "sales_today") {
      addUserMessage("📊 Resumo de Vendas de Hoje");
      setTimeout(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySales = sales.filter((s) => s.createdAt >= today.getTime());
        const total = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
        addBotMessage(
          <>
            Você teve <strong>{todaySales.length} vendas</strong> hoje.<br />
            Totalizando: <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>.
          </>
        );
      }, 500);
    } 
    else if (type === "low_stock") {
      addUserMessage("📉 Produtos com Estoque Baixo");
      setTimeout(() => {
        const lowStock = products.filter((p) => p.stock <= p.minStock);
        if (lowStock.length === 0) {
          addBotMessage("Ótima notícia! Nenhum produto está abaixo do estoque mínimo.");
        } else {
          addBotMessage(
            <div className="space-y-1">
              <div>Atenção, {lowStock.length} produto(s) precisam de reposição:</div>
              <ul className="list-disc pl-4 text-xs font-medium text-red-600">
                {lowStock.map((p) => (
                  <li key={p.id}>{p.name} (Restam {p.stock})</li>
                ))}
              </ul>
            </div>
          );
        }
      }, 500);
    }
    else if (type === "stock_value") {
      addUserMessage("📦 Valor Total em Estoque");
      setTimeout(() => {
        const totalCost = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
        const totalPotential = products.reduce((acc, p) => {
          const sellingPrice = p.cost + (p.cost * p.margin / 100);
          return acc + (p.stock * sellingPrice);
        }, 0);
        
        addBotMessage(
          <div className="space-y-2">
            <div>Seu estoque atual vale aproximadamente:</div>
            <div className="bg-white rounded p-2 border border-slate-100 shadow-sm text-center">
              <div className="text-[10px] uppercase text-slate-500 font-bold">Custo Total</div>
              <div className="font-extrabold text-slate-800">R$ {totalCost.toFixed(2).replace(".", ",")}</div>
            </div>
            <div className="bg-brand/5 rounded p-2 border border-brand/10 text-center">
              <div className="text-[10px] uppercase text-brand font-bold">Potencial de Venda</div>
              <div className="font-extrabold text-brand">R$ {totalPotential.toFixed(2).replace(".", ",")}</div>
            </div>
          </div>
        );
      }, 500);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="w-full relative overflow-hidden group rounded-xl bg-gradient-to-br from-brand to-blue-600 p-3 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-white/10">
          <div className="flex items-center gap-3 relative z-10">
            <div className="h-10 w-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="text-left flex-1">
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-white/70 leading-tight">Dúvidas rápidas?</div>
              <div className="text-sm font-bold text-white leading-tight mt-0.5">Assistente Virtual</div>
            </div>
            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
              <ChevronRight className="h-4 w-4 text-white" />
            </div>
          </div>
        </button>
      </SheetTrigger>
      <SheetContent aria-describedby={undefined} className="w-full sm:max-w-md p-0 flex flex-col bg-[#f8f9fc] border-l-0 shadow-2xl">
        <SheetTitle className="sr-only">Assistente Virtual</SheetTitle>
        {/* Header */}
        <div className="h-16 px-4 flex items-center gap-3 bg-white border-b border-slate-100 shadow-sm shrink-0">
          <div className="h-10 w-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center overflow-hidden shrink-0">
            <img src={mascotDoubt.url} alt="Assistente" className="h-9 w-9 object-contain translate-y-0.5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-800">Assistente Inteligente</div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Online
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                  msg.role === "user"
                    ? "bg-brand text-white rounded-tr-sm"
                    : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm font-medium"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Actions / Quick Replies */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">
            Escolha uma pergunta
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleAction("sales_today")}
              className="flex items-center gap-3 w-full bg-slate-50 hover:bg-brand/5 border border-slate-200 hover:border-brand/30 rounded-xl p-3 transition-colors text-left group"
            >
              <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-700 group-hover:text-brand transition-colors">Resumo de Vendas</div>
                <div className="text-[10px] text-slate-500 font-medium">Quantas vendas eu fiz hoje?</div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-brand transition-colors" />
            </button>

            <button
              onClick={() => handleAction("low_stock")}
              className="flex items-center gap-3 w-full bg-slate-50 hover:bg-brand/5 border border-slate-200 hover:border-brand/30 rounded-xl p-3 transition-colors text-left group"
            >
              <div className="h-8 w-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-700 group-hover:text-brand transition-colors">Estoque Baixo</div>
                <div className="text-[10px] text-slate-500 font-medium">O que está faltando na loja?</div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-brand transition-colors" />
            </button>

            <button
              onClick={() => handleAction("stock_value")}
              className="flex items-center gap-3 w-full bg-slate-50 hover:bg-brand/5 border border-slate-200 hover:border-brand/30 rounded-xl p-3 transition-colors text-left group"
            >
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-700 group-hover:text-brand transition-colors">Valor em Estoque</div>
                <div className="text-[10px] text-slate-500 font-medium">Quantos R$ eu tenho parado?</div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-brand transition-colors" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
