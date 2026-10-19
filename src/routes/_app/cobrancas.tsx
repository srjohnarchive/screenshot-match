import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/cobrancas")({
  head: () => ({
    meta: [
      { title: "Cobranças — Tesouraria" },
      { name: "description", content: "Cobranças do sistema de tesouraria." },
      { property: "og:title", content: "Cobranças — Tesouraria" },
      { property: "og:description", content: "Cobranças do sistema de tesouraria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-4">
      <h1 className="text-3xl">Cobranças</h1>
      <p className="text-muted-foreground">Esta tela ainda está em construção.</p>
    </div>
  ),
});
