import { useState, createContext, useContext, useEffect } from "react";
import { 
  LayoutDashboard, ShoppingBag, Package, Users, Truck,
  Plus, Minus, X, Check, Search, Bell, Menu, ShoppingCart, Info, ExternalLink,
  Receipt, BarChart3, ChartBar, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { formatBRL } from "@/lib/store";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const DemoContext = createContext(null);
export const useDemo = () => useContext(DemoContext);

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

const DemoSettings = ({ shopInfo, setShopInfo }: any) => (
  <div className="max-w-2xl mx-auto space-y-4">
    <h3 className="text-xl font-bold">Configurações da Loja</h3>
    <Input placeholder="Nome da Loja" value={shopInfo.name} onChange={e => setShopInfo({...shopInfo, name: e.target.value})} />
    <Input placeholder="Endereço" value={shopInfo.address} onChange={e => setShopInfo({...shopInfo, address: e.target.value})} />
    <Input placeholder="CPF/CNPJ" value={shopInfo.taxId} onChange={e => setShopInfo({...shopInfo, taxId: e.target.value})} />
    <Input placeholder="Telefone" value={shopInfo.phone} onChange={e => setShopInfo({...shopInfo, phone: e.target.value})} />
  </div>
);

export function DemoDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "vendas" | "produtos" | "clientes" | "compras" | "orcamentos" | "financeiro" | "os" | "relatorios" | "configuracoes">("dashboard");
  const [cart, setCart] = useState<{product: typeof mockProducts[0], qty: number}[]>([]);
  const [search, setSearch] = useState("");
  const [todaySales, setTodaySales] = useState(845.50);
  const [salesCount, setSalesCount] = useState(14);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shopInfo, setShopInfo] = useState(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("demoShopInfo");
    return saved ? JSON.parse(saved) : { name: "", address: "", taxId: "", phone: "", logo: "" };
  });

  useEffect(() => {
    typeof window !== "undefined" && localStorage.setItem("demoShopInfo", JSON.stringify(shopInfo));
  }, [shopInfo]);

  const filteredProducts = mockProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);

  const addToCart = (product: typeof mockProducts[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`${product.name} adicionado.`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));

  const generateReceiptPdf = () => {
    const doc = new jsPDF() as any;
    doc.setFontSize(18);
    doc.text(shopInfo.name || "Sua Loja", 10, 20);
    doc.setFontSize(11);
    doc.text(`Endereço: ${shopInfo.address || "[endereço]"}`, 10, 30);
    doc.text(`Telefone: ${shopInfo.phone || "[telefone]"}`, 10, 36);
    doc.autoTable({
      startY: 50,
      head: [["Item", "Qtd", "Preço", "Subtotal"]],
      body: cart.map(i => [i.product.name, i.qty, formatBRL(i.product.price), formatBRL(i.product.price * i.qty)]),
    });
    doc.text(`Total: ${formatBRL(cartTotal)}`, 140, doc.lastAutoTable.finalY + 10);
    doc.save("recibo.pdf");
  };

  const finishSale = () => {
    if (cart.length === 0) return toast.error("Carrinho vazio.");
    generateReceiptPdf();
    setTodaySales(prev => prev + cartTotal);
    setSalesCount(prev => prev + 1);
    setCart([]);
    toast.success("Venda finalizada!");
    setActiveTab("dashboard");
  };

  const ExplanationBanner = ({ title, text, icon: Icon }: { title: string, text: string, icon: any }) => (
    <div className="mb-6 bg-brand/10 border border-brand/20 rounded-xl p-5 flex items-start gap-4">
      <div className="bg-brand text-white p-3 rounded-xl shadow-sm shrink-0"><Icon className="h-6 w-6" /></div>
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{text}</p>
      </div>
    </div>
  );

  return (
    <DemoContext.Provider value={shopInfo}>
      <div className="flex h-[80vh] w-full bg-background rounded-xl overflow-hidden border border-border shadow-2xl relative text-left">
        <aside className={`absolute md:relative z-20 w-64 h-full bg-sidebar border-r border-border flex flex-col transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Logo size="sm" />
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <button onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "dashboard" ? "bg-sidebar-accent" : ""}`}><LayoutDashboard className="h-4 w-4" /> Resumo</button>
            <button onClick={() => { setActiveTab("vendas"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "vendas" ? "bg-sidebar-accent" : ""}`}><ShoppingBag className="h-4 w-4" /> Venda Rápida</button>
            <button onClick={() => { setActiveTab("produtos"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "produtos" ? "bg-sidebar-accent" : ""}`}><Package className="h-4 w-4" /> Produtos</button>
            <button onClick={() => { setActiveTab("clientes"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "clientes" ? "bg-sidebar-accent" : ""}`}><Users className="h-4 w-4" /> Clientes</button>
            <button onClick={() => { setActiveTab("orcamentos"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "orcamentos" ? "bg-sidebar-accent" : ""}`}><Receipt className="h-4 w-4" /> Orçamentos</button>
            <button onClick={() => { setActiveTab("financeiro"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "financeiro" ? "bg-sidebar-accent" : ""}`}><BarChart3 className="h-4 w-4" /> Financeiro</button>
            <button onClick={() => { setActiveTab("os"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "os" ? "bg-sidebar-accent" : ""}`}><Info className="h-4 w-4" /> Ordens de Serviço</button>
            <button onClick={() => { setActiveTab("relatorios"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "relatorios" ? "bg-sidebar-accent" : ""}`}><ChartBar className="h-4 w-4" /> Relatórios</button>
            <button onClick={() => { setActiveTab("configuracoes"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "configuracoes" ? "bg-sidebar-accent" : ""}`}><Settings className="h-4 w-4" /> Configurações</button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden bg-muted/10">
          <header className="h-14 border-b bg-card flex items-center px-4 justify-between">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}><Menu className="h-5 w-5" /></Button>
            <h2 className="font-bold">{activeTab.toUpperCase()}</h2>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card border p-5 rounded-2xl"><div>Vendas Hoje</div><div className="text-2xl font-black">{formatBRL(todaySales)}</div></div>
                  <div className="bg-card border p-5 rounded-2xl"><div>Pedidos</div><div className="text-2xl font-black">{salesCount}</div></div>
                </div>
              </div>
            )}
            {activeTab === "vendas" && (
              <div className="flex gap-6">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="p-3 border rounded-xl flex justify-between">{p.name} <Button onClick={() => addToCart(p)}>Add</Button></div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "clientes" && (
              <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <ExplanationBanner 
                  icon={Users}
                  title="Gestão de Clientes"
                  text="Mantenha um histórico completo de quem compra com você. O sistema completo permite ver o histórico de pedidos, saldo devedor e criar programas de fidelidade personalizados."
                />
                <div className="bg-card border rounded-xl overflow-x-auto">
          <table className="w-full text-left min-w-max">
            <thead>
              <tr className="border-b bg-muted/50">
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

            {activeTab === "orcamentos" && (
  <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 space-y-4">
    <ExplanationBanner icon={Receipt} title="Orçamentos" text="Crie orçamentos profissionais e envie diretamente para o WhatsApp do cliente com um clique." />
    <div className="bg-card rounded-xl p-4 border border-border overflow-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
          <tr>
            <th className="p-4">Cliente</th>
            <th className="p-4">Valor</th>
            <th className="p-4">Validade</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/30"><td className="p-4">Maria Silva</td><td className="p-4">{formatBRL(350)}</td><td className="p-4">30 dias</td><td className="p-4 text-primary">Pendente</td></tr>
          <tr className="border-b border-border/30"><td className="p-4">João Pedro</td><td className="p-4">{formatBRL(120)}</td><td className="p-4">15 dias</td><td className="p-4 text-success">Aceito</td></tr>
        </tbody>
      </table>
    </div>
  </div>
)}

            {activeTab === "financeiro" && (
  <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 space-y-4">
    <ExplanationBanner icon={BarChart3} title="Financeiro" text="Controle contas a pagar, receber e fluxo de caixa de forma centralizada." />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card p-4 rounded-xl border border-border">
        <h4 className="font-bold mb-2">Receita Hoje</h4>
        <p className="text-2xl text-brand">{formatBRL(todaySales)}</p>
      </div>
      <div className="bg-card p-4 rounded-xl border border-border">
        <h4 className="font-bold mb-2">Despesas</h4>
        <p className="text-2xl text-destructive">{formatBRL(123.45)}</p>
      </div>
      <div className="bg-card p-4 rounded-xl border border-border">
        <h4 className="font-bold mb-2">Lucro Líquido</h4>
        <p className="text-2xl text-success">{formatBRL(todaySales - 123.45)}</p>
      </div>
    </div>
  </div>
)}

            {activeTab === "os" && (
  <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 space-y-4">
    <ExplanationBanner icon={Info} title="Ordens de Serviço" text="Gerencie reparos e serviços com controle de status e tempo de execução." />
    <div className="bg-card rounded-xl p-4 border border-border overflow-x-auto">
      <table className="w-full text-sm text-left min-w-max">
        <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
          <tr>
            <th className="p-4">Serviço</th>
            <th className="p-4">Cliente</th>
            <th className="p-4">Status</th>
            <th className="p-4">Valor</th>
          </tr>
        </thead>
        <tbody>
          {mockOrders.map(o => (
            <tr key={o.id} className="border-b border-border/30">
              <td className="p-4">{o.supplier}</td>
              <td className="p-4">{o.date}</td>
              <td className="p-4 text-center">{o.status}</td>
              <td className="p-4 text-right font-semibold">{formatBRL(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

            {activeTab === "relatorios" && (
  <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 space-y-4">
    <ExplanationBanner icon={ChartBar} title="Relatórios" text="Analise o desempenho da sua loja com relatórios detalhados de vendas e produtos mais lucrativos." />
    <div className="bg-card rounded-xl p-4 border border-border">
      <p className="text-muted-foreground mb-2">Opções de exportação:</p>
      <div className="flex gap-2">
        <Button variant="outline">Exportar CSV</Button>
        <Button variant="outline">Exportar Excel</Button>
        <Button variant="outline">Exportar PDF</Button>
      </div>
    </div>
  </div>
)}

            {activeTab === "configuracoes" && (
              <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <DemoSettings shopInfo={shopInfo} setShopInfo={setShopInfo} />
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
</DemoContext.Provider>
  );
}
