export type ErrorProps = {
  code: string;
  Error?: Error;
  handled?: any;
  info?: any;
  message: string;
  name?: string;
  stack?: string;
};

const CODE_MISSING = 'CODE_MISSING';
const MESSAGE_MISSING = 'Message Missing';

export default class ExtendedError extends Error {
  static errorName = 'Extended Error';

  static transform(error: Error, defaultProps: ErrorProps) {
    if (error instanceof ExtendedError) {
      return error;
    }
    return new ExtendedError({
      Error: error,
      message: error.message,
      stack: error.stack,
      ...defaultProps,
    });
  }

  static JSONreviver(key: string, value: any) {
    if (typeof value === 'object' && value._JSONrev === 'EE') {
      const { _JSONrev, ...props } = value;
      return new ExtendedError(props);
    }
    return value;
  }

  code: string;
  Error?: Error;
  handled: boolean;
  info: any;

  constructor(props: ErrorProps) {
    const { code, Error, handled, info, message, name, stack } = props || {};

    super(message);

    this.code = code || CODE_MISSING;
    this.handled = handled || false;
    this.info = info || null;
    this.message = message || MESSAGE_MISSING;
    this.name = name || ExtendedError.errorName;

    if (Error) this.Error = Error;
    if (stack) this.stack = stack;

    if (!handled) this.log('warn');
  }

  handle(handledInfo?: any) {
    this.handled = handledInfo || true;

    this.log();
  }

  log(type?: string) {
    type === 'warn' ? console.warn(this) : console.log(this);
  }

  toJSON() {
    return {
      _JSONrev: 'EE',
      name: this.name,
      code: this.code,
      message: this.message,
      handled: this.handled,
      info: this.info,
      stack: this.stack,
      ...(this.Error && { Error: this.Error }),
    };
  }

  toString() {
    const { _JSONrev, ...props } = this.toJSON();

    return JSON.stringify(props, null, 2);
  }
}
