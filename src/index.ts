type Info = { [prop: string]: any; handled?: boolean };

export type ErrorProps = {
  code: string;
  info?: Info;
  message?: string;
  name?: string;
  stack?: string;
};

const CODE_MISSING = 'CODE_MISSING';
const MESSAGE_MISSING = 'Message Missing';

export default class ExtendedError extends Error {
  static errorName = 'Extended Error';

  static transform(error: any, defaultProps: ErrorProps, warn?: boolean) {
    let transformedError: ExtendedError;

    if (error instanceof ExtendedError) {
      transformedError = error;
    } else if (error instanceof Error) {
      const { name, message, stack, ...customProps } = error;
      const originalError = { name, message, ...customProps };

      transformedError = new ExtendedError(
        {
          message,
          stack,
          ...defaultProps,
          info: { originalError, ...defaultProps.info },
        },
        warn,
      );
    } else {
      transformedError = new ExtendedError(
        {
          ...defaultProps,
          info: { originalError: error, ...defaultProps.info },
        },
        warn,
      );
    }

    return transformedError;
  }

  static JSONreviver(key: string, value: any) {
    if (typeof value === 'object' && value._JSONrev === 'EE') {
      const { _JSONrev, ...props } = value;
      return new ExtendedError(props, false);
    }
    return value;
  }

  readonly code: string;
  readonly info: Info;

  constructor(props: ErrorProps, warn: boolean = true) {
    try {
      const { code, info, message, name, stack } = props || {};

      super(message);
      this.code = code || CODE_MISSING;
      this.info = { handled: false, ...info };
      this.message = message || MESSAGE_MISSING;
      this.name = name || ExtendedError.errorName;

      if (stack) this.stack = stack;

      if (warn) this.log('warn');
    } catch (error) {
      console.log({ error });
      throw new ExtendedError({
        code: 'EXTENDED_ERROR_CONSTRUCT_ERROR',
        message: 'Unable to construct extended error',
      });
    }
  }

  handle(handledInfo?: any) {
    this.info.handled = true;
    if (handledInfo) this.info.handledInfo = handledInfo;

    this.log();
  }

  log(type?: string) {
    type === 'warn'
      ? console.warn(this.toString())
      : console.log(this.toString());
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      info: this.info,
      stack: this.stack,
      _JSONrev: 'EE',
    };
  }

  toString() {
    const border =
      '\n---------------------------------------------------------------\n';

    const trace = this.stack.substring(this.stack.indexOf('\n') + 1);

    const contents =
      this.name +
      '\nMessage: ' +
      this.message +
      '\nCode: ' +
      this.code +
      '\nInfo: ' +
      JSON.stringify(this.info, null, 2) +
      '\n' +
      trace;

    return border + contents + border;
  }
}
