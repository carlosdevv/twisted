import { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import { redis } from "../../../lib/redis";
import { getPoll } from "./get-poll";

// Mock Prisma and Redis dependencies
jest.mock("../../../lib/prisma");
jest.mock("../../../lib/redis");

describe("getPoll", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = {} as FastifyInstance;
    app.get = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get a poll by pollId", async () => {
    const request = {
      params: {
        pollId: "12345",
      },
    };
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const mockPoll = {
      id: "12345",
      title: "Favorite Color",
      options: [
        {
          id: "option1",
          title: "Red",
        },
        {
          id: "option2",
          title: "Blue",
        },
      ],
    };

    const mockResult = ["option1", "1", "option2", "2"];

    // Mock Prisma and Redis methods
    (prisma.poll.findUnique as jest.Mock).mockResolvedValue(mockPoll);
    (redis.zrange as jest.Mock).mockResolvedValue(mockResult);

    await getPoll(app);

    expect(app.get).toHaveBeenCalledWith(
      "/polls/:pollId",
      expect.any(Function)
    );

    const routeHandler = (app.get as jest.Mock).mock.calls[0][1];
    await routeHandler(request, reply);

    expect(prisma.poll.findUnique).toHaveBeenCalledWith({
      where: {
        id: "12345",
      },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    expect(redis.zrange).toHaveBeenCalledWith(
      "poll:12345",
      0,
      -1,
      "WITHSCORES"
    );

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      poll: {
        id: "12345",
        title: "Favorite Color",
        options: [
          {
            id: "option1",
            title: "Red",
            score: 1,
          },
          {
            id: "option2",
            title: "Blue",
            score: 2,
          },
        ],
      },
    });
  });

  it("should return 400 if poll is not found", async () => {
    const request = {
      params: {
        pollId: "12345",
      },
    };
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock Prisma method to return null
    (prisma.poll.findUnique as jest.Mock).mockResolvedValue(null);

    await getPoll(app);

    const routeHandler = (app.get as jest.Mock).mock.calls[0][1];
    await routeHandler(request, reply);

    expect(prisma.poll.findUnique).toHaveBeenCalledWith({
      where: {
        id: "12345",
      },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "Poll not found" });
  });
});
