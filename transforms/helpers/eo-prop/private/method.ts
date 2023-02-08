import type {
  EOMethod,
  EOPropertyForMethod,
  FunctionExpression,
  Identifier,
} from '../../ast';
import AbstractEOProp from './abstract';

// FIXME: Split into two classes
export default class EOMethodProp extends AbstractEOProp<EOPropertyForMethod> {
  get value(): EOMethod | FunctionExpression {
    return 'value' in this._prop ? this._prop.value : this._prop;
  }

  private overriddenKind?: 'init' | 'get' | 'set' | 'method';

  get kind(): 'init' | 'get' | 'set' | 'method' {
    return (
      this.overriddenKind ?? ('kind' in this.value ? this.value.kind : 'method')
    );
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

  get params(): EOMethod['params'] | FunctionExpression['params'] {
    return this.value.params;
  }

  get body(): EOMethod['body'] | FunctionExpression['body'] {
    return this.value.body;
  }
}
