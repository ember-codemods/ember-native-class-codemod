import type { EOMethod, Identifier } from '../../ast';
import AbstractEOProp from './abstract';

export default class EOMethodProp extends AbstractEOProp<EOMethod> {
  get value(): EOMethod {
    return this._prop;
  }

  private overriddenKind?: 'init' | 'get' | 'set' | 'method';

  get kind(): 'init' | 'get' | 'set' | 'method' {
    return this.overriddenKind ?? this.value.kind;
  }

  set kind(kind: 'init' | 'get' | 'set' | 'method') {
    this.overriddenKind = kind;
  }

  private overriddenKey?: Identifier;

  override get key(): Identifier {
    return this.overriddenKey ?? this._prop.key;
  }

  override set key(key: Identifier) {
    this.overriddenKey = key;
  }

  get params(): EOMethod['params'] {
    return this.value.params;
  }

  get body(): EOMethod['body'] {
    return this.value.body;
  }
}
