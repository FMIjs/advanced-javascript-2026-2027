# Семинар, част 2: FMI Events (бъгове)

**Време:** ~60 минути

**FMI Events** е малко API за събития и записване за тях. Написано е с неща, които вече познавате:

- `Model`: JSON „база данни“ от седмица 2, вече async (домашното от седмица 3)
- `User` → `Organizer`: наследяване с конструктор функции от седмица 2
- `EventEmitter` от седмица 1
- `http` сървър с малък router

Приложението работи... донякъде. Потребителите са изпратили **11 бъг репорта**. Вашата задача е да намерите **причината** за всеки и да я оправите.

## Стартиране

Нужен е само Node.js (без `npm install`).

```bash
cd seminar/part2
node --watch server.js     # рестартира се сам при промяна на файл
```

Ако данните се объркат: `node scripts/reset.js` (и рестартирайте сървъра).

Заявките по-долу са с `curl`. На Windows ползвайте Git Bash или [Postman](https://www.postman.com/).

## Какво има в API-то

| Заявка | Какво прави |
|---|---|
| `GET /events` | всички събития |
| `GET /events/:id` | едно събитие |
| `POST /events` | ново събитие, body: `{ "name": "...", "capacity": 10 }` |
| `POST /events/:id/tags` | добавя таг, body: `{ "tag": "..." }` |
| `POST /events/:id/bookings` | записва потребител, body: `{ "userId": 1 }` |
| `GET /events/:id/attendees` | кой е записан |
| `GET /users` | всички потребители |
| `GET /notifications` | изпратените (фалшиви) имейли |

Данните са в `data/*.json`. Кодът е в `server.js` и `src/`.

## Правилата

- За всеки бъг попълнете [`BUGS.md`](./BUGS.md): **симптом → причина → тема от лекциите → поправка**.
- Търсим **причината**, а не заобикаляне на симптома. „Сложих `try/catch` навсякъде“ не е поправка.
- `src/router.js` е коректен. Не е нужно да го променяте.
- Може да ползвате каквото искате, но ще минаваме по местата и ще ви питаме да обясните бъговете, които сте оправили.
- Бъговете са подредени горе-долу от лесни към трудни. Някои се виждат чак след като оправите предишен.

---

## Бъг репорти

### 1. „Отварям несъществуващо събитие и сървърът пада“

```bash
curl -i http://localhost:3000/events/999
```

**Очаквано:** `404 { "error": "Event not found" }` и сървърът продължава да работи.
**Реално:** отговорът е 404, но веднага след това сървърът спира с грешка в терминала.

### 2. „`/events/1` казва, че няма такова събитие“

```bash
curl -i http://localhost:3000/events       # събитие 1 е тук
curl -i http://localhost:3000/events/1     # ...но тук го няма
```

**Очаквано:** `200` и данните за „JS Meetup“.
**Реално:** „Event not found“. Същото става за всички заявки от вида `/events/:id/...`.

### 3. „Счупено тяло на заявката сваля сървъра“

```bash
curl -i -X POST http://localhost:3000/events -H 'Content-Type: application/json' -d '{"name": "Broken'
```

**Очаквано:** `400 { "error": "Invalid JSON body" }` и сървърът продължава да работи.
**Реално:** сървърът спира.

### 4. „Мобилното приложение не вижда колко места са останали“

```bash
curl http://localhost:3000/events/1
```

**Очаквано:** всяко събитие има `seatsLeft`: 47, 5 и 0 за трите събития.
**Реално:** `seatsLeft` липсва и в `GET /events`, и в `GET /events/:id`. А в отговора при записване (`POST .../bookings`) си е там!

### 5. „Таговете се смесват“

```bash
curl -X POST http://localhost:3000/events/2/tags -H 'Content-Type: application/json' -d '{"tag": "node"}'
curl -X POST http://localhost:3000/events/3/tags -H 'Content-Type: application/json' -d '{"tag": "talk"}'
```

**Очаквано:** събитие 2 има `["node"]`, а събитие 3 има `["talk"]`.
**Реално:** събитие 3 има `["node", "talk"]`. В `GET /events` двата тага изобщо ги няма, а след рестарт изчезват напълно.

### 6. „В `/users` всички са организатори“

```bash
curl http://localhost:3000/users
```

**Очаквано:** Ivan, Maria и Georgi са `(attendee)`, а само Elena е `(organizer at FMI)`.
**Реално:** всички са „organizer at undefined“.

### 7. „Напомнянията са все за едно и също събитие“

След старт сървърът изпраща по едно напомняне за всяко събитие, през 1 секунда. Изчакайте 3–4 секунди:

```bash
curl http://localhost:3000/notifications
```

**Очаквано:** три напомняния, за „JS Meetup“, „Node.js Workshop“ и „Sold-out Talk“.
**Реално:** и трите са за „Sold-out Talk“.

### 8. „Записването връща грешка, но мястото е заето“

```bash
curl -i -X POST http://localhost:3000/events/2/bookings -H 'Content-Type: application/json' -d '{"userId": 1}'
curl http://localhost:3000/events/2
curl http://localhost:3000/notifications
```

**Очаквано:** `201`, `bookedCount` става 1 и в `/notifications` има потвърждение до `ivan@example.com`.
**Реално:** `500`, но `bookedCount` все пак е 1, а потвърждение няма.

### 9. „Пълно събитие приема записвания“

Събитие 3 („Sold-out Talk“) има 2 места и 2 записани.

```bash
curl -i -X POST http://localhost:3000/events/3/bookings -H 'Content-Type: application/json' -d '{"userId": 3}'
```

**Очаквано:** `409 { "error": "Event is full" }`.
**Реално:** `201` и `seatsLeft: -1`.

### 10. „Списъкът със записани винаги е празен“

```bash
curl http://localhost:3000/events/1/attendees
```

**Очаквано:** Ivan, Maria и Georgi.
**Реално:** `[]`.

### 11. „20 души се записаха за 5 места“

Събитие 2 има 5 места. Скриптът праща 20 записвания **едновременно**:

```bash
node scripts/reset.js     # после рестартирайте сървъра
node scripts/rush.js
```

**Очаквано:** 5 × `201`, 15 × `409`, `booked 5`.
**Реално:** почти всички минават, а `seatsLeft` става отрицателно. Това се вижда дори след като бъг 9 е оправен и записването на едно по едно работи правилно.
