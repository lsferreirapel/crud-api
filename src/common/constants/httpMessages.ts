export const httpErrors = {
  BAD_REQUEST: {
    message:
      "The server cannot process the request. caused by malformed request syntax, invalid request message framing, or deceptive request routing",
    code: 400,
    alias: "BAD_REQUEST",
  },
  UNAUTHORIZED: {
    message:
      "The client must authenticate itself to get the requested response.",
    code: 401,
    alias: "UNAUTHORIZED",
  },
  FORBIDDEN: {
    message: "The client does not have access rights to the content.",
    code: 403,
    alias: "FORBIDDEN",
  },
  NOT_FOUND: {
    message: "The server cannot find the requested resource.",
    code: 404,
    alias: "NOT_FOUND",
  },
  INTERNAL_SERVER_ERROR: {
    message:
      "The server has encountered a situation it does not know how to handle.",
    code: 500,
    alias: "INTERNAL_SERVER_ERROR",
  },
};

export const httpSuccess = {
  OK: {
    message: "The request succeeded.",
    code: 200,
    alias: "OK",
  },
  CREATED: {
    message:
      "The request succeeded, and a new resource was created as a result.",
    code: 201,
    alias: "CREATED",
  },
  ACCEPTED: {
    message: "The request has been received but not yet acted upon. ",
    code: 202,
    alias: "ACCEPTED",
  },
  NO_CONTENT: {
    message:
      "There is no content to send for this request, but the headers may be useful.",
    code: 204,
    alias: "OK",
  },
};
