import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

type User = { id: number; name: string };

const users: User[] = [
  { id: 1, name: "Ivan" },
  { id: 2, name: "Maria" },
];

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
  }
  return JSON.parse(raw);
}

function readJsonBodyWithEvents(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function isNewUser(value: unknown): value is Omit<User, "id"> {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string"
  );
}

async function createUser(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const body = await readJsonBodyWithEvents(req).catch(() => undefined);
  if (!isNewUser(body)) {
    return sendJson(res, 400, {
      error: 'Body must be JSON like { "name": "..." }',
    });
  }
  const user: User = { id: users.length + 1, name: body.name };
  users.push(user);
  sendJson(res, 201, user);
}

function getUser(res: ServerResponse, id: number): void {
  const user = users.find((u) => u.id === id);
  if (!user) {
    return sendJson(res, 404, { error: `User ${id} not found` });
  }
  sendJson(res, 200, user);
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const { pathname } = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const userIdMatch = pathname.match(/^\/users\/(\d+)$/);

  if (req.method === "GET" && pathname === "/") {
    return sendJson(res, 200, { message: "Hello from TypeScript" });
  }
  if (req.method === "GET" && pathname === "/users") {
    return sendJson(res, 200, users);
  }
  if (req.method === "POST" && pathname === "/users") {
    return createUser(req, res);
  }
  if (req.method === "GET" && userIdMatch?.[1]) {
    return getUser(res, Number(userIdMatch[1]));
  }
  sendJson(res, 404, { error: "Not found" });
}

const port = Number(process.env.PORT ?? 3000);

createServer((req, res) => {
  handleRequest(req, res).catch((error: unknown) => {
    console.error(error);
    sendJson(res, 500, { error: "Internal server error" });
  });
}).listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
