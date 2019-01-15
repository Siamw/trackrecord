class ApiError extends Error {
	constructor({status, source = null, title = null, message = null, stack = null, errors = null}) {
	  super();
	  this.status = status;
	  this.source = source;
	  this.title = title;
	  this.message = message;
		this.stack = stack;
		this.errors = errors;
	}
  }

class HttpError extends Error {
	constructor(status, message, stack = null) {
	  super();
	  this.status = status;
	  this.message = message
	  this.stack = stack;
	}
  }
class HttpForbidden extends HttpError {
	constructor(message, stack = null) {
		super(403, message, stack);
	}
}
class HttpUnauthorized extends HttpError {
	constructor(message, stack = null) {
		super(401, message, stack);
	}
}
class HttpNotFound extends HttpError {
	constructor(message, stack = null) {
		super(404, message, stack);
	}
}

class HttpInternalServer extends HttpError {
	constructor(message, stack = null) {
		super(500, message, stack);
	}
}

class HttpBadRequest extends HttpError {
	constructor(message, stack = null) {
		super(400, message, stack);
	}
}

module.exports = {
	HttpError,
	HttpForbidden,
	HttpUnauthorized,
	HttpNotFound,
	HttpInternalServer,
	HttpBadRequest,
	ApiError
}
