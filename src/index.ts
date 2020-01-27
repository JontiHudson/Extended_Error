export type ErrorSeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | 'HANDLED';

export type ErrorInfo = {
  [prop: string]: any;
};

export type ErrorProps = {
  code: string;
  info?: ErrorInfo;
  message?: string;
  name?: string;
  severity: ErrorSeverity;
  stack?: string;
};

const CODE_MISSING = 'CODE_MISSING';
const MESSAGE_MISSING = 'Message Missing';

export default class ExtendedError extends Error {
  readonly code: string;
  readonly info: ErrorInfo;
  readonly message: string;
  readonly name: string;
  readonly stack: string;
  severity: ErrorSeverity;

  static errorName = 'Extended Error';

  static transform(error: any, defaultProps: ErrorProps, warn?: boolean) {
    let transformedError: ExtendedError;

    if (error instanceof ExtendedError) {
      transformedError = error;
      transformedError.addInfo(defaultProps.info);
    } else if (error instanceof Error) {
      const { name, message, stack, ...customProps } = error;
      const parentError = { name, message, ...customProps };

      transformedError = new ExtendedError({
        message,
        stack,
        ...defaultProps,
        info: { parentError, ...defaultProps.info },
      });
    } else {
      transformedError = new ExtendedError({
        ...defaultProps,
        info: { parentError: error, ...defaultProps.info },
      });
    }

    return transformedError;
  }

  static JSONparse(JSONstring: string, returnError?: boolean) {
    try {
      return JSON.parse(JSONstring, this.JSONreviver);
    } catch (error) {
      const parseError = ExtendedError.transform(error, {
        code: 'PARSE_ERROR',
        message: 'Unable to parse string',
        severity: 'HIGH',
        info: { JSONstring },
      });

      if (returnError) return parseError;
      throw parseError;
    }
  }

  static JSONreviver(key: string, value: any) {
    if (typeof value === 'object' && value._JSONrev === 'EE') {
      const { _JSONrev, ...props } = value;
      return new ExtendedError(props);
    }
    return value;
  }

  constructor(props: ErrorProps, warn: boolean = true) {
    try {
      super(props.message);

      const defaultProps = {
        _severity: 'HIGH',
        code: CODE_MISSING,
        info: {},
        message: MESSAGE_MISSING,
        name: ExtendedError.errorName,
      };

      const { severity, ...rest } = props;
      Object.assign(this, defaultProps, rest, { _severity: severity });

      if (warn) this.log();
    } catch (error) {
      throw new ExtendedError({
        code: 'EXTENDED_ERROR_CONSTRUCT_ERROR',
        message: 'Unable to construct extended error',
        severity: 'HIGH',
      });
    }
  }

  get handled() {
    return this.severity === 'HANDLED';
  }

  addInfo(info?: ErrorInfo) {
    if (info) Object.assign(this.info, info);
  }

  changeSeverity(newSeverity: ErrorSeverity) {
    this.severity = newSeverity;
  }

  handle(handledInfo?: any) {
    if (this.severity === 'HANDLED') {
      return false;
    }

    this.severity = 'HANDLED';
    if (handledInfo) this.info.handledInfo = handledInfo;

    console.log('Handled: ' + this.toString());
    return true;
  }

  log() {
    switch (this.severity) {
      case 'HIGH':
      case 'MEDIUM':
        console.warn(this.print());
        break;
      case 'LOW':
        console.log(this.print());
        break;
      default:
    }
  }

  print() {
    const border =
      '\n---------------------------------------------------------------\n';

    const name = this.toString();
    const info = Object.keys(this.info).length
      ? '\nInfo: ' + JSON.stringify(this.info, null, 2)
      : '';
    const trace = this.stack.substring(this.stack.indexOf('\n') + 1);

    const contents = name + '\n' + this.message + info + '\n' + trace;

    return border + contents + border;
  }

  toObject(): ErrorProps {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      info: this.info,
      stack: this.stack,
    };
  }

  toJSON() {
    return {
      ...this.toObject(),
      _JSONrev: 'EE',
    };
  }

  toString() {
    return `${this.name} - ${this.code} (${this.severity})`;
  }
}
