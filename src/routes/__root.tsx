import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ControleJá — Estoque simples para seu negócio" },
      { name: "description", content: "Controle de estoque rápido e intuitivo para pequenos empreendedores." },
      { property: "og:title", content: "ControleJá — Estoque simples para seu negócio" },
      { name: "twitter:title", content: "ControleJá — Estoque simples para seu negócio" },
      { property: "og:description", content: "Controle de estoque rápido e intuitivo para pequenos empreendedores." },
      { name: "twitter:description", content: "Controle de estoque rápido e intuitivo para pequenos empreendedores." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/oxVc2daSBoYzI2Q8t1we28ZHRNv2/social-images/social-1777933913953-ChatGPT_Image_4_de_mai._de_2026,_19_31_13.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/oxVc2daSBoYzI2Q8t1we28ZHRNv2/social-images/social-1777933913953-ChatGPT_Image_4_de_mai._de_2026,_19_31_13.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <AppShell />
      <Toaster richColors position="top-center" />
    </>
  );
}
