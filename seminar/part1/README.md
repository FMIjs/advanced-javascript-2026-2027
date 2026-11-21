# Семинар, част 1: Как работи JS отвътре

**Време:** ~75 минути

Всяка задача е отделен файл с празна функция (`// TODO`) и проверки под нея. Пускате файла и виждате кое минава:

```bash
cd seminar/part1
node 01-memoize.js
```

```
✓ computes the result
✗ caches falsy results too (0, '', false, undefined)
    expected 1, got 2
```

## Правилата

- Може да ползвате каквото искате: документация, MDN, лекциите. **Но всяко решение ще трябва да обясните.** Ще минаваме по местата и ще питаме. Код, който не можете да обясните, не се брои.
- Към всяка задача има въпроси **„Бъдете готови да обясните“**. Това са нещата, които ще питаме.
- Не се очаква да завършите всичко. Задачите са подредени по теми, а не по трудност. Задачите с **бонус** са за тези, които са приключили.

## Ориентировъчен план

| Време | Задачи |
|---|---|
| ~10 мин | [00 Какво ще се изпише?](#00-какво-ще-се-изпише) |
| ~25 мин | [01 memoize](#01-memoize), [02 curry](#02-curry), [03 compose / pipe](#03-compose--pipe) |
| ~40 мин | Изберете си от [04](#04-once--debounce)–[08](#08-retry-и-последователно-срещу-паралелно) |
| бонус | [09 EventEmitter](#09-eventemitter-бонус), [10 deepFreeze](#10-deepfreeze-бонус) |

---

## 00. Какво ще се изпише?

Папка `00-what-prints/` съдържа 7 кратки програми. За всяка:

1. **Първо на лист** напишете какво очаквате да се изпише.
2. Чак тогава я пуснете: `node 00-what-prints/card-1.js`
3. Ако сте сгрешили: защо?

| Карта | Тема |
|---|---|
| `card-1.js` | event loop: `setTimeout`, `Promise`, `process.nextTick`, `queueMicrotask` |
| `card-2.js` | hoisting и TDZ |
| `card-3.js` | closures |
| `card-4.js` | `this` |
| `card-5.js` | прототипи и shadowing |
| `card-6.js` | вериги от promise-и |
| `card-7.js` | `async` / `await` |

---

## 01. `memoize`

Файл: `01-memoize.js`

Напишете функция `memoize(fn)`, която запаметява резултатите на `fn` според подадените аргументи. При същите аргументи връща запаметения резултат, без да вика `fn` отново. **Кешът НЕ трябва да е глобален.**

```js
const sum = (x, y) => x + y;
const memSum = memoize(sum);

memSum(2, 3); // пресмята, връща 5
memSum(3, 3); // пресмята, връща 6
memSum(2, 3); // директно връща 5, без да смята
```

**Бонус:** `memoize(fn, { maxSize: 2 })` пази най-много `maxSize` резултата и забравя най-стария.

**Бъдете готови да обясните:**
- Къде „живее“ кешът? Защо всяка memoize-ната функция има собствен?
- Защо `args.join('')` е лош ключ? А `args.join(',')`?
- Защо `if (cache[key])` е бъг?

---

## 02. `curry`

Файл: `02-curry.js`

Напишете функция `curry(fn)`, която събира аргументи, докато не стигнат толкова, колкото `fn` очаква, и чак тогава вика `fn`.

```js
function tripleAdd(a, b, c) {
  return a + b + c;
}
const cTripleAdd = curry(tripleAdd);

cTripleAdd(1)(2)(3); // 6
cTripleAdd(1, 2)(3); // 6
cTripleAdd(1, 2, 3); // 6

const add1 = cTripleAdd(1); // все още нищо не смята
add1(2)(3); // 6
add1(10)(20); // 31 - add1 може да се ползва повече от веднъж
```

**Бонус:** `curry(fn, arity)` за функции, при които `fn.length` не помага.

**Бъдете готови да обясните:**
- Откъде `curry` знае кога да извика `fn`?
- Колко е `fn.length` на `(a, b = 2) => {}`? А на `(...args) => {}`?
- Защо `add1` може да се ползва два пъти и вторият път не вижда аргументите от първия?

---

## 03. `compose` / `pipe`

Файл: `03-compose.js`

- `compose(f, g, h)(x) === f(g(h(x)))`: изпълнява отдясно наляво
- `pipe(f, g, h)(x) === h(g(f(x)))`: изпълнява отляво надясно

```js
const addOne = (x) => x + 1;
const square = (x) => x * x;

compose(square, addOne)(1); // 4
pipe(square, addOne)(1); // 2
compose()(5); // 5
compose(addOne, Math.max)(1, 5, 3); // 6 - първата изпълнена функция може да приема много аргументи
```

**Бонус:** `pipeAsync(...fns)`: като `pipe`, но всяка стъпка може да върне Promise. Резултатът винаги е Promise.

**Бъдете готови да обясните:**
- Как `compose` и `pipe` се изразяват една чрез друга?
- Какво трябва да върне `compose()` без функции и защо?

---

## 04. `once` / `debounce`

Файл: `04-once-debounce.js`

- `once(fn)`: вика `fn` само първия път. Всяко следващо извикване връща първия резултат.
- `debounce(fn, ms)`: изчаква да минат `ms` милисекунди **без** извиквания и чак тогава вика `fn` **веднъж**, с аргументите от последното извикване. (Като поле за търсене, което търси чак когато потребителят спре да пише.)

```js
const save = debounce((text) => console.log('saving', text), 300);
save('h');
save('he');
save('hello'); // след 300ms: saving hello (само веднъж)
```

И двете трябва да запазват `this`:

```js
const editor = {
  name: 'editor',
  save: debounce(function () { console.log(this.name); }, 300),
};
editor.save(); // editor
```

**Бъдете готови да обясните:**
- Къде се пази id-то на таймера? Защо следващото извикване го „вижда“?
- Защо върнатата функция трябва да е `function`, а callback-ът на `setTimeout` да е arrow function?

---

## 05. `myBind`

Файл: `05-bind.js`

Напишете своя версия на `Function.prototype.bind`. Вътре може да ползвате `call` / `apply`, но **не** `bind`.

```js
function greet(punctuation) {
  return `Hi, ${this.name}${punctuation}`;
}
const ivan = { name: 'Ivan' };

const bound = greet.myBind(ivan);
bound('!'); // Hi, Ivan!
bound.call({ name: 'Maria' }, '!'); // Hi, Ivan! - this вече не може да се смени
```

**Бонус:** `Function.prototype.myCall` **без** `call` / `apply` / `bind`. (Подсказка: какво е `this` в `obj.method()`?) Обектът трябва да остане същият след извикването.

**Бъдете готови да обясните:**
- Защо `myBind` върху arrow function не прави нищо?
- Защо втори `bind` не сменя `this`?
- (бонус) Защо е добре да ползвате `Symbol` в `myCall`?

---

## 06. `myCreate` / `myNew`

Файл: `06-new-create.js`

- `myCreate(proto)`: своя версия на `Object.create(proto)`, **без** `Object.create`
- `myNew(Ctor, ...args)`: прави това, което прави `new Ctor(...args)`, **без** `new`

Проверките ползват `User` → `Employee` от седмица 2.

```js
const employee = myNew(Employee, 'Maria', 'maria@example.com', 'developer');
employee instanceof Employee; // true
employee instanceof User; // true
employee.greet(); // Hi, I am Maria and I work as a developer
```

**Бъдете готови да обясните:**
- Кои са стъпките, които прави `new`?
- Какво става, ако конструкторът върне обект? А ако върне число?

---

## 07. Promise-и: `delay`, `timeout`, `myPromiseAll`

Файл: `07-promises.js`

- `delay(ms, value)`: Promise, който се resolve-ва с `value` след `ms` милисекунди
- `timeout(promise, ms)`: държи се като `promise`, но ако той отнеме повече от `ms`, се reject-ва с `new Error('Timeout after <ms>ms')`. Подсказка: `Promise.race`
- `myPromiseAll(items)`: своя версия на `Promise.all`, **без** `Promise.all` / `allSettled`:
  - резултатите са в **същия ред** като `items`, без значение кой Promise е свършил пръв
  - reject-ва се **веднага** щом някой от тях се reject-не
  - в `items` може да има и обикновени стойности

```js
await myPromiseAll([delay(30, 'a'), delay(10, 'b'), 'c']); // ['a', 'b', 'c']
await timeout(delay(200), 50); // Error: Timeout after 50ms
```

**Бонус:** `myPromiseAllSettled`

**Бъдете готови да обясните:**
- Как запазвате реда, когато promise-ите свършват в различен ред?
- Как разбирате, че всички са готови?
- Защо `for (const item of items) results.push(await item)` при грешка се reject-ва с грешната грешка и твърде късно?

---

## 08. `retry` и последователно срещу паралелно

Файл: `08-retry.js`

**A)** `retry(fn, attempts, delayMs)`: вика `fn` (която връща Promise). Ако тя се reject-не, изчаква `delayMs` и опитва пак, общо най-много `attempts` пъти. Връща първия успешен резултат или последната грешка.

**B)** Дадена е `fetchUser(id)`, която отнема 100ms. Напишете:
- `loadSequential(ids)`: зарежда потребителите един след друг (~300ms за 3)
- `loadParallel(ids)`: зарежда ги едновременно (~100ms за 3)

**Бъдете готови да обясните:**
- Какво връща това и защо?
  ```js
  async function loadAll(ids) {
    const users = [];
    ids.forEach(async (id) => {
      users.push(await fetchUser(id));
    });
    return users;
  }
  ```
- Кога бихте искали последователно, а кога паралелно?

---

## 09. EventEmitter (бонус)

Файл: `09-emitter.js`

Event emitter-ът от седмица 1, като клас. Добавете:
- `off(eventName, callback)`: премахва callback-а
- `once(eventName, callback)`: callback-ът се изпълнява само при първия `emit`, след което се премахва

**Бъдете готови да обясните:**
- Ако `once` премахва listener-а **по време** на `emit`, защо следващият listener може да бъде пропуснат? Как го избягвате?
- Как `off(eventName, callback)` да работи и за callback, добавен с `once`?

---

## 10. `deepFreeze` (бонус)

Файл: `10-deep-freeze.js`

`deepFreeze(obj)`: като `Object.freeze`, но замразява и всички вложени обекти и масиви. Връща същия обект.

**Бонус:** да работи с цикли (`a.b = b; b.a = a`).

**Бъдете готови да обясните:**
- Защо `Object.freeze` е „плитък“?
- Какво ще стане с цикъл, ако не се пазите от него?
