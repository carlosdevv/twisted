import { FastifyInstance } from "fastify";
import { voting } from "../../utils/voting-pub-sub";
import { pollResults } from "./poll-results";

describe("pollResults", () => {
  let app: FastifyInstance;
  let connection: any;
  let request: any;

  beforeEach(() => {
    app = {} as FastifyInstance;
    app.get = jest.fn();
    connection = {
      socket: {
        send: jest.fn(),
      },
    };
    request = {
      params: {
        pollId: "12345",
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should subscribe to voting updates and send messages", () => {
    pollResults(app);

    expect(app.get).toHaveBeenCalledWith(
      "/polls/:pollId/results",
      { websocket: true },
      expect.any(Function)
    );

    const routeHandler = (app.get as jest.Mock).mock.calls[0][2];
    routeHandler(connection, request);

    expect(voting.subscribe).toHaveBeenCalledWith(
      "12345",
      expect.any(Function)
    );

    const messageHandler = (voting.subscribe as jest.Mock).mock.calls[0][1];
    messageHandler("Test message");

    expect(connection.socket.send).toHaveBeenCalledWith(
      JSON.stringify("Test message")
    );
  });
});
