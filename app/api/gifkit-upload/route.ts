import { appendFile, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

export async function GET() {
  const { readFile } = await import("node:fs/promises")
  return new Response(await readFile(path.join(process.cwd(), "gifs/overlay-rt.js"), "utf8"), {
    headers: { "content-type": "text/javascript", "cache-control": "no-store" },
  })
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const dir = path.join("/tmp/gifkit/in", path.basename(url.searchParams.get("d") || "misc"))
  const file = path.join(dir, path.basename(url.searchParams.get("f") || "x.bin"))
  await mkdir(dir, { recursive: true })
  const buf = Buffer.from(await req.arrayBuffer())
  if (url.searchParams.get("a") === "1") await appendFile(file, buf)
  else await writeFile(file, buf)
  return Response.json({ ok: true, bytes: buf.length })
}
