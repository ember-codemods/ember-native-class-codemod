# ember-es6-class-codemod

[![Build Status](https://travis-ci.org/ember-codemods/ember-es6-class-codemod.svg?branch=master)](https://travis-ci.org/ember-codemods/ember-es6-class-codemod)
[![npm version](https://badge.fury.io/js/ember-es6-class-codemod.svg)](https://badge.fury.io/js/ember-es6-class-codemod)

Codemods for transforming ember app code to native ES6 class syntax with decorators.

## Usage

The Ember ES6 codemods can be run using the following command:

```
npx ember-es6-class-codemod http://localhost:4200/path/to/server [OPTIONS] path/of/files/ or/some**/*glob.js
```

The codemods accept the following options:

| Option                | Value     | Default                         | Details                                                                                                            |
| --------------------- | --------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| --class-fields        | boolean   | true                            | Enable/disable transformation using class fields                                                                   |
| --decorators          | boolean   | true                            | Enable/disable transformation using decorators                                                                     |
| --type                | String    | Empty (match all types in path) | Apply transformation to only passed type. The type can be one of `services`, `routes`, `components`, `controllers` |

### Class Fields

Class fields are currently defined as a [stage 3 proposal](https://github.com/tc39/proposal-class-fields) in the [ECMA TC39 process](https://tc39.github.io/process-document/). As such, they are added as a configurable option in the transforms, enabled by default. If set to **false**, it will NOT transform the object properties to class fields but instead error out.

For example, the below declaration

```
const Foo = EmberObject.extend({
 prop: "defaultValue",
});
```

Will be transformed to

```
class Foo extends EmberObject {
 prop = "defaultValue";
}
```

### Decorators

Decorators are currently a [stage 2 proposal](https://github.com/tc39/proposal-decorators) in the [ECMA TC39 process](https://tc39.github.io/process-document/). They are added as a configurable option in the transforms. If set to true, it will transform the object's properties to decorators wherever required.

For example, the below declaration

```
import { inject as service } from "@ember/service";
const Foo = EmberObject.extend({
 store: service(),
});
```

Will be transformed to

```
import { service } from "@ember-decorators/service";
class Foo extends EmberObject {
 @service store;
}
```

**Note** The decorators support is built into Ember by way of ember-cli-babel@7.7.0 or higher.

### Types

The option `type` can be used to further target transforms to a particular type of ember object within the application or addon. The types can be any of the following:

| Type        | Option             |
| ----------- | ------------------ |
| Services    | --type=services    |
| Routes      | --type=routes      |
| Components  | --type=components  |
| Controllers | --type=controllers |

The path of the file being transformed is matched against the glob pattern of the type to determine whether to run the specific transforms.

If a type is not provided, the codemods will run against all the **_types_** in the path provided.

### Runtime Config

As per conventional codemods, the code is converted from one API to another by statically analyzing patterns within it. While this works well most of the time, there are cases that can only be analyzed at runtime to determine the full shape of the code to transform. For example, if we need to determine the class hierarchy, it is not possible with static analysis to determine the parent classes and their properties.

The codemods are designed with `runtime data` as input to correctly transform the code. For each file currently being transformed, the codemods need a `configuration file`, which will provide additional metadata about the properties of the ember object.

## Debugging

The codemods log execution information in the `codemods.log` file in the current directory from where the codemods are being executed. Specifically, details such as failures and reasons for failures, are logged. This would be the recommended starting point for debugging issues related to these codemods.

## Unsupported Types

While the codemods transforms all types of ember objects, it does not support transformation of

- `ember-data` entities for example `DS.Model`, `DS.Adapter` etc
- Mixins
- Ember Object having a property with `ObjectExpression` as value (`actions` and `queryParams` are exception) See `eslint-plugin-ember/avoid-leaking-state-in-ember-objects` for more details.
- Ember object having property with `meta` or `property` modifiers

## More Transform Examples

<!--TRANSFORMS_START-->
* [ember-object](transforms/ember-object/README.md)
* [helpers](transforms/helpers/README.md)
<!--TRANSFORMS_END-->

## Contributing

### Installation

- clone the repo
- change into the repo directory
- `yarn`

### Running Tests

- `yarn test`

### Update Documentation

- `yarn update-docs`
