function add<T extends object>(
  obj: T,
): T extends { id: infer U }
  ? Omit<T, "id"> & { id: U[] }
  : T & { id: string } {
  if ("id" in obj) {
    return obj as any;
  }
  return { id: "uuid()", ...obj } as any;
}

const t = add({ id: 1, name: "sad " });
t.id;
const t2 = add({ id: [1, 3], name: "sad " });
t2.id;
const t3 = add({ name: "Ivan" });
t3.id;

// (false) ? {} : 0

function runtimeConditional() {
  if (false) {
    return {};
  } else {
    return 0;
  }
}
