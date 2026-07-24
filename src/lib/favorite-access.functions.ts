import { createServerFn } from "@tanstack/react-start";
import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const favoriteAccessSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  telefone: z.string().max(60).optional().or(z.literal("")),
  localizacao: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      precisao: z.number().optional(),
    })
    .optional(),
});

export const registerFavoriteAccess = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => favoriteAccessSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    const now = new Date();
    const dir = path.resolve(process.cwd(), "cliente-online");
    const file = path.join(dir, "acessos-favoritos.jsonl");
    const record = {
      data: now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      hora: now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      registrado_em: now.toISOString(),
      email: data.email?.trim() || null,
      telefone: data.telefone?.trim() || null,
      localizacao: data.localizacao ?? null,
      origem: "favoritos",
    };

    await mkdir(dir, { recursive: true });
    await appendFile(file, `${JSON.stringify(record)}\n`, "utf8");
    return { ok: true };
  });
