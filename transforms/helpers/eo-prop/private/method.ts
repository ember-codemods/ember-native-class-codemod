import type { EOMethod } from '../../ast';
import AbstractEOProp from './abstract';

export default class EOMethodProp extends AbstractEOProp<EOMethod> {
  get value(): EOMethod {
    return this._prop;
  }

  get kind(): 'get' | 'set' | 'method' {
    return this._prop.kind;
  }
}
