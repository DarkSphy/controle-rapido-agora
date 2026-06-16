import { useState } from "react";
import { 
  LayoutDashboard, ShoppingBag, Package, Users, Truck,
  Plus, Minus, X, Check, Search, Bell, Menu, ShoppingCart, Info, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { formatBRL } from "@/lib/store";

const mockProducts = [
  { id: "1", name: "Camiseta Básica Preta", price: 49.90, cost: 20.00, stock: 12, category: "Roupas", img: "👕" },
  { id: "2", name: "Caneca Mágica", price: 35.00, cost: 15.00, stock: 5, category: "Acessórios", img: "☕" },
  { id: "3", name: "Cabo USB-C 2 Metros", price: 29.90, cost: 10.00, stock: 45, category: "Eletrônicos", img: "🔌" },
  { id: "4", name: "Caderno Inteligente", price: 89.90, cost: 40.00, stock: 2, category: "Papelaria", img: "📓" },
];

const mockClients = [
  { id: "1", name: "Maria Silva", phone: "(31) 99887-7665", orders: 4, total: 345.50 },
  { id: "2", name: "João Pedro", phone: "(11) 98765-4321", orders: 1, total: 49.90 },
  { id: "3", name: "Ana Beatriz", phone: "(21) 99999-8888", orders: 12, total: 1250.00 },
];

const mockOrders = [
  { id: "1", supplier: "Distribuidora Tech", date: "Hoje", total: 450.00, status: "Entregue" },
  { id: "2", supplier: "Fábrica Têxtil Ltda", date: "Ontem", total: 1200.00, status: "Pendente" },
];

export function DemoDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "vendas" | "produtos" | "clientes" | "compras">("dashboard");
  const [cart, setCart] = useState<{product: typeof mockProducts[0], qty: number}[]>([]);
  const [search, setSearch] = useState("");
  const [todaySales, setTodaySales] = useState(845.50);
  const [salesCount, setSalesCount] = useState(14);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredProducts = mockProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);

  const addToCart = (product: typeof mockProducts[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`${product.name} adicionado ao carrinho (Simulação)`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product.id === id) {
        return { ...i, qty: Math.max(1, i.qty + delta) };
      }
      return i;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.product.id !== id));
  };

  const finishSale = () => {
    if (cart.length === 0) return toast.error("O carrinho está vazio.");
    setTodaySales(prev => prev + cartTotal);
    setSalesCount(prev => prev + 1);
    setCart([]);
    toast.success("Venda finalizada com sucesso! (Simulação)", {
      description: "O estoque foi atualizado e a venda registrada no financeiro."
    });
    setActiveTab("dashboard");
  };

  const ExplanationBanner = ({ title, text, icon: Icon }: { title: string, text: string, icon: any }) => (
    <div className="mb-6 bg-brand/10 border border-brand/20 rounded-xl p-5 flex items-start gap-4">
      <div className="bg-brand text-white p-3 rounded-xl shadow-sm shrink-0">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => window.open('https://wa.me/5531973175882?text=Gostaria%20de%20contratar%20o%20controle%20já.', '_blank')} size="sm" className="bg-[#25D366] hover:bg-[#128C7E] text-white">
            <Check className="mr-2 h-4 w-4" /> Quero usar no meu negócio
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[80vh] w-full bg-background rounded-xl overflow-hidden border border-border shadow-2xl relative text-left">
      {/* SIMULATED SIDEBAR */}
      <aside className={`absolute md:relative z-20 w-64 h-full bg-sidebar border-r border-border flex flex-col transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <Logo size="sm" />
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "dashboard" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            <LayoutDashboard className="h-4 w-4" /> Resumo
          </button>
          <button 
            onClick={() => { setActiveTab("vendas"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "vendas" ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            <ShoppingBag className="h-4 w-4" /> Venda Rápida
          </button>
          <div className="pt-4 mt-4 border-t border-border/50 space-y-2">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cadastros</div>
            <button 
              onClick={() => { setActiveTab("produtos"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "produtos" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              <Package className="h-4 w-4" /> Produtos
            </button>
            <button 
              onClick={() => { setActiveTab("clientes"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "clientes" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              <Users className="h-4 w-4" /> Clientes
            </button>
            <button 
              onClick={() => { setActiveTab("compras"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "compras" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              <Truck className="h-4 w-4" /> Compras
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-muted/10 relative">
        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* HEADER */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="font-bold text-lg hidden sm:block">
              {activeTab === "dashboard" && "Resumo do Dia"}
              {activeTab === "vendas" && "Balcão de Vendas"}
              {activeTab === "produtos" && "Meus Produtos"}
              {activeTab === "clientes" && "Meus Clientes"}
              {activeTab === "compras" && "Compras e Fornecedores"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand animate-pulse" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-brand/20 text-brand font-bold grid place-items-center text-xs">
              M
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Vendas Hoje</div>
                  <div className="text-2xl font-black text-brand">{formatBRL(todaySales)}</div>
                </div>
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Pedidos</div>
                  <div className="text-2xl font-black text-foreground">{salesCount}</div>
                </div>
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Estoque Crítico</div>
                  <div className="text-2xl font-black text-destructive">1</div>
                </div>
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total em Estoque</div>
                  <div className="text-2xl font-black text-foreground">{formatBRL(12450.00)}</div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl shadow-sm p-5 md:p-6 text-center py-10">
                <div className="h-16 w-16 bg-brand/10 text-brand rounded-full grid place-items-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pronto para vender?</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Acesse o balcão de vendas para registrar um novo pedido rapidamente e ver seus números crescerem.
                </p>
                <Button size="lg" onClick={() => setActiveTab("vendas")} className="bg-brand text-white hover:bg-brand/90 font-bold">
                  Abrir Balcão de Vendas
                </Button>
              </div>
            </div>
          )}

          {activeTab === "vendas" && (
            <div className="flex flex-col lg:flex-row gap-6 h-full max-w-6xl mx-auto animate-in fade-in slide-in-from-right-8">
              {/* LISTA DE PRODUTOS */}
              <div className="flex-1 flex flex-col min-h-[300px]">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar produto por nome..." 
                    className="pl-9 h-11 bg-card rounded-xl"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-2 pb-20 lg:pb-0">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-card border border-border/60 hover:border-brand/40 p-3 rounded-xl flex items-center gap-3 transition-colors group">
                      <div className="h-12 w-12 rounded-lg bg-muted text-2xl grid place-items-center shrink-0">
                        {p.img}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">Estoque: {p.stock}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm text-brand mb-1">{formatBRL(p.price)}</div>
                        <Button size="sm" onClick={() => addToCart(p)} className="h-7 px-2 text-xs rounded-md">
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARRINHO */}
              <div className="w-full lg:w-80 xl:w-96 bg-card border border-border rounded-2xl flex flex-col shadow-sm flex-shrink-0 sticky bottom-0 lg:relative">
                <div className="p-4 border-b border-border/50 bg-muted/20">
                  <h3 className="font-bold flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-brand" /> Carrinho da Simulação
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[150px] lg:min-h-0 max-h-[300px] lg:max-h-full">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center opacity-60">
                      <Package className="h-10 w-10 mb-2" />
                      <p className="text-sm font-medium">Adicione itens ao carrinho</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.product.id} className="flex flex-col gap-2 p-3 bg-muted/30 border border-border/50 rounded-xl">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sm leading-tight">{item.product.name}</div>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center bg-background border border-border rounded-md">
                            <button className="px-2 py-1 hover:bg-muted text-muted-foreground" onClick={() => updateQty(item.product.id, -1)}>
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-bold px-2 w-6 text-center">{item.qty}</span>
                            <button className="px-2 py-1 hover:bg-muted text-muted-foreground" onClick={() => updateQty(item.product.id, 1)}>
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="font-bold text-sm">{formatBRL(item.product.price * item.qty)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-border/50 bg-card rounded-b-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground text-sm font-medium">Total</span>
                    <span className="text-2xl font-black text-foreground">{formatBRL(cartTotal)}</span>
                  </div>
                  <Button 
                    className="w-full h-12 text-base font-bold bg-[#25D366] hover:bg-[#128C7E] text-white" 
                    disabled={cart.length === 0}
                    onClick={finishSale}
                  >
                    <Check className="mr-2 h-5 w-5" /> Finalizar Venda
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "produtos" && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4">
              <ExplanationBanner 
                icon={Package}
                title="Gestão de Estoque Completa"
                text="Nesta tela do sistema real, você poderá cadastrar seus produtos com foto, controlar o custo de compra, definir a margem de lucro e gerenciar variações (tamanhos, cores). O estoque é descontado automaticamente a cada venda."
              />
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden opacity-70 pointer-events-none">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                  <Input className="max-w-xs bg-background" placeholder="Buscar produtos..." />
                  <Button><Plus className="mr-2 h-4 w-4" /> Novo Produto</Button>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-4">Produto</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4 text-right">Custo</th>
                      <th className="p-4 text-right">Venda</th>
                      <th className="p-4 text-center">Estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProducts.map(p => (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="p-4 font-medium flex items-center gap-3">
                          <div className="h-8 w-8 bg-muted rounded flex items-center justify-center text-lg">{p.img}</div>
                          {p.name}
                        </td>
                        <td className="p-4 text-muted-foreground">{p.category}</td>
                        <td className="p-4 text-right text-muted-foreground">{formatBRL(p.cost)}</td>
                        <td className="p-4 text-right font-semibold">{formatBRL(p.price)}</td>
                        <td className="p-4 text-center font-bold text-brand">{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "clientes" && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4">
              <ExplanationBanner 
                icon={Users}
                title="Sua Base de Clientes"
                text="Guarde o histórico de compras de cada pessoa. No sistema real, você saberá quem são os clientes que mais compram, poderá enviar mensagens no WhatsApp com um clique e manter um relacionamento próximo para vender mais."
              />
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden opacity-70 pointer-events-none">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                  <Input className="max-w-xs bg-background" placeholder="Buscar clientes..." />
                  <Button><Plus className="mr-2 h-4 w-4" /> Novo Cliente</Button>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-4">Nome</th>
                      <th className="p-4">Telefone / WhatsApp</th>
                      <th className="p-4 text-center">Nº de Pedidos</th>
                      <th className="p-4 text-right">Total Gasto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockClients.map(c => (
                      <tr key={c.id} className="border-b border-border/50">
                        <td className="p-4 font-bold">{c.name}</td>
                        <td className="p-4 text-brand font-medium">{c.phone}</td>
                        <td className="p-4 text-center">{c.orders}</td>
                        <td className="p-4 text-right font-semibold">{formatBRL(c.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "compras" && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4">
              <ExplanationBanner 
                icon={Truck}
                title="Compras e Fornecedores"
                text="Lance todas as suas compras para reabastecer o estoque automaticamente. O sistema real permite cadastrar fornecedores, organizar o que você comprou e recalcular o custo real de cada item que entra na sua loja."
              />
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden opacity-70 pointer-events-none">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                  <Input className="max-w-xs bg-background" placeholder="Buscar compras..." />
                  <Button><Plus className="mr-2 h-4 w-4" /> Registrar Compra</Button>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-4">Fornecedor</th>
                      <th className="p-4">Data</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map(o => (
                      <tr key={o.id} className="border-b border-border/50">
                        <td className="p-4 font-semibold">{o.supplier}</td>
                        <td className="p-4 text-muted-foreground">{o.date}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${o.status === 'Entregue' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold">{formatBRL(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
