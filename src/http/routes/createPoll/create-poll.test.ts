import { FastifyInstance } from "fastify";
import { createPoll } from "./create-poll";

describe("createPoll", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = {} as FastifyInstance;
    app.post = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new poll", async () => {
    const request = {
      body: {
        title: "Favorite Color",
        options: ["Red", "Blue", "Green"],
      },
    };
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await createPoll(app);

    expect(app.post).toHaveBeenCalledWith("/polls", expect.any(Function));

    const routeHandler = (app.post as jest.Mock).mock.calls[0][1];
    await routeHandler(request, reply);

    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith(expect.any(Object));
  });
});
