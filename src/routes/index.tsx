import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/painel" });
  },
  head: () => ({
    meta: [
      { title: "Tesouraria — Controle financeiro" },
      { name: "description", content: "Sistema de tesouraria: cobranças, baixas e extrato." },
      { property: "og:title", content: "Tesouraria — Controle financeiro" },
      { property: "og:description", content: "Sistema de tesouraria: cobranças, baixas e extrato." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
