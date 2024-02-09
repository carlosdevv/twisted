import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";
import fastify from "fastify";
import { createPoll } from "./routes/createPoll/create-poll";
import { getPoll } from "./routes/getPoll/get-poll";
import { voteOnPoll } from "./routes/voteOnPoll/vote-on-poll";
import { pollResults } from "./ws/poll-results";

const app = fastify();

app.register(cookie, {
  secret: "supersecret",
  hook: "onRequest",
});

app.register(websocket);

app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);
app.register(pollResults);

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running on port 3333");
});
