import { FastifyInstance } from "fastify";
import { voteOnPoll } from "./vote-on-poll";

describe("voteOnPoll", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = {} as FastifyInstance;
    app.post = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should vote on a poll", async () => {
    const request = {
      params: {
        pollId: "12345",
      },
      body: {
        pollOptionId: "67890",
      },
      cookies: {
        sessionId: "abcdef",
      },
    };
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      setCookie: jest.fn(),
    };

    await voteOnPoll(app);

    expect(app.post).toHaveBeenCalledWith(
      "/polls/:pollId/votes",
      expect.any(Function)
    );

    const routeHandler = (app.post as jest.Mock).mock.calls[0][1];
    await routeHandler(request, reply);

    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalled();
  });

  it("should handle user already voted for this option", async () => {
    const request = {
      params: {
        pollId: "12345",
      },
      body: {
        pollOptionId: "67890",
      },
      cookies: {
        sessionId: "abcdef",
      },
    };
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock userPreviousVoteOnPoll
    const userPreviousVoteOnPoll = {
      id: "xyz",
      pollOptionId: "67890",
    };
    const prismaVoteFindUniqueMock = jest
      .fn()
      .mockResolvedValue(userPreviousVoteOnPoll);
    const prismaVoteDeleteMock = jest.fn().mockResolvedValue(undefined);
    jest.mock("prisma", () => ({
      vote: {
        findUnique: prismaVoteFindUniqueMock,
        delete: prismaVoteDeleteMock,
      },
    }));

    await voteOnPoll(app);

    expect(app.post).toHaveBeenCalledWith(
      "/polls/:pollId/votes",
      expect.any(Function)
    );

    const routeHandler = (app.post as jest.Mock).mock.calls[0][1];
    await routeHandler(request, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(
      "You have already voted for this option"
    );
  });

  it("should handle user not voted before", async () => {
    const request = {
      params: {
        pollId: "12345",
      },
      body: {
        pollOptionId: "67890",
      },
      cookies: {
        sessionId: "abcdef",
      },
    };
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      setCookie: jest.fn(),
    };

    // Mock userPreviousVoteOnPoll
    const userPreviousVoteOnPoll = null;
    const prismaVoteFindUniqueMock = jest
      .fn()
      .mockResolvedValue(userPreviousVoteOnPoll);
    jest.mock("prisma", () => ({
      vote: {
        findUnique: prismaVoteFindUniqueMock,
      },
    }));

    await voteOnPoll(app);

    expect(app.post).toHaveBeenCalledWith(
      "/polls/:pollId/votes",
      expect.any(Function)
    );

    const routeHandler = (app.post as jest.Mock).mock.calls[0][1];
    await routeHandler(request, reply);

    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalled();
  });

  it("should handle missing sessionId", async () => {
    const request = {
      params: {
        pollId: "12345",
      },
      body: {
        pollOptionId: "67890",
      },
      cookies: {},
    };
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      setCookie: jest.fn(),
    };

    // Mock userPreviousVoteOnPoll
    const userPreviousVoteOnPoll = null;
    const prismaVoteFindUniqueMock = jest
      .fn()
      .mockResolvedValue(userPreviousVoteOnPoll);
    jest.mock("prisma", () => ({
      vote: {
        findUnique: prismaVoteFindUniqueMock,
      },
    }));

    await voteOnPoll(app);

    expect(app.post).toHaveBeenCalledWith(
      "/polls/:pollId/votes",
      expect.any(Function)
    );

    const routeHandler = (app.post as jest.Mock).mock.calls[0][1];
    await routeHandler(request, reply);

    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalled();
    expect(reply.setCookie).toHaveBeenCalledWith(
      "sessionId",
      expect.any(String),
      {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        signed: true,
        httpOnly: true,
      }
    );
  });
});
