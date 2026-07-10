import { requireAuth, requireAdmin } from "../src/middlewares/auth";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../src/middlewares/errorHandler";

jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {};
    jest.clearAllMocks();
  });

  it("should throw 401 if no authorization header", () => {
    requireAuth(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
  });

  it("should verify token and call next", () => {
    mockReq.headers = { authorization: "Bearer token123" };
    (jwt.verify as jest.Mock).mockReturnValue({ id: "1", role: "CUSTOMER" });
    requireAuth(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
    expect((mockReq as any).user.id).toBe("1");
  });

  it("should throw 401 if token invalid", () => {
    mockReq.headers = { authorization: "Bearer badtoken" };
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error("invalid") });
    requireAuth(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
  });

  it("requireAdmin should pass if admin", () => {
    mockReq = { user: { role: "ADMIN" } } as any;
    requireAdmin(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it("requireAdmin should throw 403 if not admin", () => {
    mockReq = { user: { role: "CUSTOMER" } } as any;
    requireAdmin(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
  });
});
