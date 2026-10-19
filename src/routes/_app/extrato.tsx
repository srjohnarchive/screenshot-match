import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/extrato")({
  head: () => ({
    meta: [
      { title: "Extrato — Tesouraria" },
      { name: "description", content: "Extrato do sistema de tesouraria." },
      { property: "og:title", content: "Extrato — Tesouraria" },
      { property: "og:description", content: "Extrato do sistema de tesouraria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-4">
      <h1 className="text-3xl">Extrato</h1>
      <p className="text-muted-foreground">Esta tela ainda está em construção.</p>
    </div>
  ),
});
