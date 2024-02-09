# Twisted API

Twisted is a backend API focused on creating polls in realtime.
<br /><br />

## # Purpose

The objective of this project is to create a POC (Proof of concept) and improve my knowledge in Node.js and get to know the Fastify mini framework.

## # Logic and Business rules

The core business of this project is to create a poll and your options. Also, is possible to watch in real-time the results of the poll.
<br />
The user can only vote once in the poll. The user can change the voting option in the poll, but never vote more than once for the same option. The way to guarantee this logic was to use cookies to store the session in which the user voted.
<br />
In relation to web sockets, the logic behind this was to use the Pub/Sub (publish/subscribe) strategy, which is a standard for event handling. The reason I used this pattern is because this strategy is very well used in the case of categorization, when “events” are divided by unique identifiers. So, as my “channels” are separated by polls, it is easier to work with this use case.

### # Why PostgreSQL and Redis?

Basically, Redis is an excellent database for handling data in sorted and cached formats. So, for the use case of this project, Redis fits perfectly, as it brings tools that help and greatly facilitate the manipulation and organization of data.
I could create this system within PostgreSQL too, simply creating a field to store how many votes the poll option has already received. However, I wanted to explore more of these features that Redis brings in a very practical way.

### # Technologies used

- Fastify
- PostgreSQL
- Redis
- Websocket protocol
- Prisma
