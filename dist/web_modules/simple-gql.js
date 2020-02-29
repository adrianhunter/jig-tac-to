function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var extractMessage = function extractMessage(response) {
  if (response.errors && response.errors.length) return response.errors[0].message;
  return "GraphQL Error (Code: " + response.status + ")";
};

var ClientError =
/*#__PURE__*/
function (_Error) {
  _inheritsLoose(ClientError, _Error);

  function ClientError(response, request) {
    return _Error.call(this, extractMessage(response) + ": " + JSON.stringify({
      response: response,
      request: request
    })) || this;
  }

  return ClientError;
}(
/*#__PURE__*/
_wrapNativeSuper(Error));

var _request = function request(_ref) {
  var url = _ref.url,
      query = _ref.query,
      variables = _ref.variables,
      _ref$options = _ref.options,
      options = _ref$options === void 0 ? {
    fetch: window && window.fetch
  } : _ref$options;

  try {
    var headers = options.headers,
        baseFetch = options.fetch,
        otherOptions = _objectWithoutPropertiesLoose(options, ["headers", "fetch"]);

    var fetch = baseFetch || window && window.fetch; // TODO: Throw an invariant error if fetch is not provided

    var body = JSON.stringify({
      query: query,
      variables: variables
    });
    return Promise.resolve(fetch(url, _extends({
      method: 'POST',
      headers: Object.assign({
        'Content-Type': 'application/json'
      }, headers),
      body: body
    }, otherOptions))).then(function (request) {
      var contentType = request.headers.get('Content-Type');
      return Promise.resolve(contentType && contentType.startsWith('application/json') ? request.json() : request.text()).then(function (response) {
        if (!request.ok || response.errors || !response.data) {
          var error = typeof response === 'string' ? {
            error: response
          } : response;
          throw new ClientError(_extends({}, error, {
            status: request.status
          }), {
            query: query,
            variables: variables
          });
        }

        return response;
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var createClient = function createClient(url, options) {
  if (options === void 0) {
    options = {
      fetch: window && window.fetch
    };
  }

  return {
    request: function request(query, variables) {
      return _request({
        url: url,
        query: query,
        variables: variables,
        options: options
      });
    }
  };
};

/**
 * Simple `gql` tag for syntax highlighting in code editors.
 *
 * @param query - GraphQL query template string
 */
var gql = function gql(query) {
  return String(query).replace('\n', ' ');
};

export { createClient, gql, _request as request };
