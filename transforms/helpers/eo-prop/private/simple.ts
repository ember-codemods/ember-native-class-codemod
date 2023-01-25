import type { EOPropertySimple } from '../../ast';
import AbstractEOProp from './abstract';

export default class EOSimpleProp extends AbstractEOProp<EOPropertySimple> {
  get value(): EOPropertySimple['value'] {
    return this._prop.value;
  }
}
