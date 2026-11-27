import { Readable } from "node:stream";

type User = { id: number; name: string; email: string };

function createUsers(count: number): User[] {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  });
}

function toCsvLine(user: User): string {
  return `${user.id},${user.name},${user.email}\n`;
}

// Example 1: a Readable created with a read() function. Node calls read() when it wants more data.

function createCsvStream(users: User[]): Readable {
  let index = 0;
  return new Readable({
    encoding: "utf8",
    read() {
      if (index === 0) {
        this.push("id,name,email\n");
      }
      const user = users[index++];
      this.push(user ? toCsvLine(user) : null);
    },
  });
}

// Example 2: a custom Readable class that overrides _read().

class CountdownStream extends Readable {
  #current: number;

  constructor(from: number) {
    super({ encoding: "utf8", highWaterMark: 0 });
    this.#current = from;
  }

  override _read(): void {
    console.log("read");
    if (this.#current === 0) {
      this.push("Liftoff!\n");
      this.push(null);
      return;
    }
    this.push(`${this.#current--}...\n`);
  }
}

// Example 3: a stream in object mode sends JavaScript objects instead of bytes.

function createUserStream(users: User[]): Readable {
  return Readable.from(users);
}

async function consumeWithForAwait(): Promise<void> {
  console.log("--- for await over an object stream ---");
  for await (const user of createUserStream(createUsers(3))) {
    console.log(user);
  }
}

function consumeWithEvents(): Promise<void> {
  console.log("--- 'data' and 'end' events ---");
  return new Promise((resolve, reject) => {
    const countdown = new CountdownStream(3);
    countdown.on("data", (chunk: string) => console.log(chunk));
    countdown.on("error", reject);
    countdown.on("end", resolve);
  });
}

function consumeWithPipe(): Promise<void> {
  console.log("--- pipe() into process.stdout ---");
  return new Promise((resolve, reject) => {
    const csv = createCsvStream(createUsers(3));
    csv.on("error", reject);
    csv.on("end", resolve);
    csv.pipe(process.stdout, { end: false });
  });
}

// await consumeWithForAwait();
await consumeWithEvents();
// await consumeWithPipe();
