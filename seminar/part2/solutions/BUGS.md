# Бъгове: решения

Поправеният код е в тази папка. Всяка поправка е маркирана с коментар `// Bug N:`.

```bash
cd seminar/part2/solutions
node verify.js            # проверява решението: 11 / 11
node verify.js ..         # проверява оригинала с бъговете: 0 / 11
node verify.js <папка>    # проверява копие на студент
```

`verify.js` пуска нов сървър с чисти данни за всяка проверка.

## 1. Несъществуващо събитие сваля сървъра

- **Симптом:** `GET /events/999` връща 404 и сървърът спира с `ERR_HTTP_HEADERS_SENT`.
- **Причина:** след `sendJson(res, 404, ...)` липсва `return`, така че кодът продължава и вика `sendJson(res, 200, ...)`. Втори отговор по същата заявка хвърля грешка. Router-ът я хваща и опитва да прати 500, което хвърля отново, вече вътре в `.catch`. Тази грешка никой не я хваща (unhandled rejection) и Node спира процеса.
- **Тема:** http (един request има един response), promise-и
- **Поправка:** `src/routes.js`, `return sendJson(res, 404, ...)`

## 2. `/events/1` не намира събитието

- **Симптом:** `GET /events/1` връща „Event not found“, а събитието се вижда в `GET /events`.
- **Причина:** параметрите от пътя са **низове** (`'1'`), а id-тата в данните са **числа** (`1`). `findById` сравнява с `===`, а `'1' === 1` е `false`.
- **Тема:** типове, `===` срещу `==`
- **Поправка:** `src/routes.js`, `Number(params.id)` във всички `/events/:id` маршрути. (Може и в `Model.findById`, но там `==` само скрива проблема.)

## 3. Счупено тяло на заявката сваля сървъра

- **Симптом:** POST с невалиден JSON спира сървъра със `SyntaxError`.
- **Причина:** `JSON.parse` е в callback-а на `req.on('end')`. Той се изпълнява **по-късно**, извън executor-а на Promise-а, така че хвърлената грешка не става rejection, а uncaught exception. `new Promise` хваща само грешки, хвърлени синхронно в самия executor.
- **Тема:** callbacks срещу promise-и, обработка на грешки (като `promisify` от домашното)
- **Поправка:** `src/http.js`, `try { resolve(JSON.parse(body)) } catch { reject(httpError(400, ...)) }`

## 4. Липсва `seatsLeft`

- **Симптом:** `seatsLeft` липсва в `GET /events` и `GET /events/:id`, но го има в отговора при записване.
- **Причина:** `seatsLeft` е getter в `Event.prototype`. `JSON.stringify` взима само **собствените enumerable** свойства на обекта. При записването отговорът е `{ seatsLeft: event.seatsLeft }`: getter-ът се чете изрично и затова там работи.
- **Тема:** прототипи, property descriptors, accessor-и
- **Поправка:** `src/event.js`, `toJSON() { return { ...this, seatsLeft: this.seatsLeft }; }`

## 5. Таговете се смесват

- **Симптом:** таг на събитие 2 се появява и на събитие 3. В `GET /events` таговете ги няма, а след рестарт изчезват.
- **Причина:** събитията без тагове нямат собствено `tags`, затова четат `Event.prototype.tags`: **един** масив, общ за всички. `event.tags.push(tag)` само чете `tags` (не го записва), така че променя масива в прототипа. По същата причина `tags` не е собствено свойство и `JSON.stringify` не го записва, нито го показва. Същото е като карта 5 от част 1.
- **Тема:** прототипи, shadowing, референции
- **Поправка:** `src/event.js`, `this.tags = data.tags ? [...data.tags] : []` и премахване на `Event.prototype.tags`

## 6. Всички са организатори

- **Симптом:** в `/users` всички са „organizer at undefined“.
- **Причина:** `Organizer.prototype = User.prototype` прави двата прототипа **един и същ обект**. После `Organizer.prototype.describe = ...` презаписва `describe` и за `User`.
- **Тема:** наследяване с конструктор функции (`Employee.prototype = User.prototype`, „защо това е грешно?“ от седмица 3)
- **Поправка:** `src/users.js`, `Organizer.prototype = Object.create(User.prototype)`

## 7. Напомнянията са за едно и също събитие

- **Симптом:** и трите напомняния са за последното събитие.
- **Причина:** `var event` е **една** променлива за целия цикъл (function scope). Callback-ите на `setTimeout` я четат, когато се изпълнят: след края на цикъла, когато тя сочи последното събитие.
- **Тема:** scope, closures, `var` срещу `let` (карта 3 от част 1)
- **Поправка:** `src/reminders.js`, `let i` / `const event`

## 8. Записването връща 500, но мястото е заето

- **Симптом:** `POST .../bookings` връща 500 „Cannot read properties of undefined (reading 'send')“. Мястото е заето, а потвърждение няма.
- **Причина:** `bus.on('booked', mailer.sendBookingConfirmation)` подава само функцията, без обекта. `emit` я вика като обикновена функция и `this` е `undefined` (класовете са strict). Грешката се хвърля **след** като записването вече е запазено.
- **Тема:** `this`, `bind`, arrow functions (същото като `obj.handleData.bind(obj)` от седмица 1)
- **Поправка:** `server.js`, `bus.on('booked', (data) => mailer.sendBookingConfirmation(data))` (или `.bind(mailer)`)

## 9. Пълно събитие приема записвания

- **Симптом:** записване за пълно събитие връща 201 и `seatsLeft: -1`.
- **Причина:** `hasSeats` е `async`, значи връща **Promise**. Без `await`, `!this.hasSeats(...)` е `!Promise`. Всеки Promise е truthy, така че проверката никога не спира записването.
- **Тема:** `async` / `await`
- **Поправка:** `src/bookings.js`. Минималната поправка е `if (!(await this.hasSeats(eventId)))`, но тя оставя бъг 11, затова виж там.

## 10. Списъкът със записани е празен

- **Симптом:** `GET /events/1/attendees` връща `[]`.
- **Причина:** `forEach` не чака async callback-и: само ги стартира. `return profiles` се изпълнява веднага, преди някой профил да е зареден.
- **Тема:** `async` / `await`, последователно срещу паралелно (задача 08 от част 1)
- **Поправка:** `src/bookings.js`, `return Promise.all(eventBookings.map((b) => this.loadProfile(b.userId)))`

## 11. 20 души за 5 места

- **Симптом:** при 20 едновременни записвания почти всички минават и `seatsLeft` става отрицателно. Едно по едно работи.
- **Причина:** проверката („има ли места?“) и заемането на мястото (`bookedCount++`) са разделени с `await`. Докато една заявка чака (записване във файла), event loop-ът пуска другите заявки и те също минават проверката, защото никой още не е увеличил `bookedCount`.
- **Тема:** event loop, `await` като точка на прекъсване (check-then-act / race condition)
- **Поправка:** `src/bookings.js`. Проверката и `bookedCount++` се правят в **една синхронна стъпка**, без `await` помежду им. Ако записването след това се провали, мястото се връща (`bookedCount--`).
