# Changelog

## v1.1.0 (2019-08-20)

#### :rocket: Enhancement
* [#177](https://github.com/ember-codemods/ember-native-class-codemod/pull/177) Fixup class naming logic and make it work with pods ([@pzuraq](https://github.com/pzuraq))
* [#176](https://github.com/ember-codemods/ember-native-class-codemod/pull/176) Removes `@className` and `@attribute` in favor of `@classNameBindings` and `@attributeBindings` ([@pzuraq](https://github.com/pzuraq))

#### :bug: Bug Fix
* [#179](https://github.com/ember-codemods/ember-native-class-codemod/pull/179) Ignore chained class definitions ([@pzuraq](https://github.com/pzuraq))
* [#152](https://github.com/ember-codemods/ember-native-class-codemod/pull/152) Remove remaining traces of wrapComputed. ([@rwjblue](https://github.com/rwjblue))
* [#150](https://github.com/ember-codemods/ember-native-class-codemod/pull/150) Do nothing for non-JS files. ([@rwjblue](https://github.com/rwjblue))

#### :memo: Documentation
* [#184](https://github.com/ember-codemods/ember-native-class-codemod/pull/184) Improve markup in codemod options table in the README.md. ([@chriskrycho](https://github.com/chriskrycho))
* [#164](https://github.com/ember-codemods/ember-native-class-codemod/pull/164) Fix typo in the readme ([@lolmaus](https://github.com/lolmaus))
* [#155](https://github.com/ember-codemods/ember-native-class-codemod/pull/155) Fix helpers link in README ([@rajasegar](https://github.com/rajasegar))

#### :house: Internal
* [#180](https://github.com/ember-codemods/ember-native-class-codemod/pull/180) Adds tests for reopening classes ([@pzuraq](https://github.com/pzuraq))
* [#173](https://github.com/ember-codemods/ember-native-class-codemod/pull/173) Swap out the telemetry helpers for the `ember-codemods-telemetry-helpers` package ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* [#143](https://github.com/ember-codemods/ember-native-class-codemod/pull/143) Add test for using ember-concurrency tasks in converted objects. ([@rwjblue](https://github.com/rwjblue))
* [#151](https://github.com/ember-codemods/ember-native-class-codemod/pull/151) Fixup typo in method name closet -> closest. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 7
- Andrey Mikhaylov (lolmaus) ([@lolmaus](https://github.com/lolmaus))
- Chris Garrett ([@pzuraq](https://github.com/pzuraq))
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- L. Preston Sego III ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
- Rajasegar Chandran ([@rajasegar](https://github.com/rajasegar))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v1.0.1 (2019-06-23)

#### :bug: Bug Fix
* [#140](https://github.com/ember-codemods/ember-native-class-codemod/pull/140) Avoid `**/tmp/**` when looking for `package.json`'s. ([@rwjblue](https://github.com/rwjblue))

#### :memo: Documentation
* [#137](https://github.com/ember-codemods/ember-native-class-codemod/pull/137) Add dependency installation to the README ([@pzuraq](https://github.com/pzuraq))
* [#136](https://github.com/ember-codemods/ember-native-class-codemod/pull/136) Update the README to match v1.0.0 refactors ([@pzuraq](https://github.com/pzuraq))

#### Committers: 3
- Chris Garrett ([@pzuraq](https://github.com/pzuraq))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v1.0.0 (2019-06-20)

#### :boom: Breaking Change
* [#134](https://github.com/ember-codemods/ember-native-class-codemod/pull/134) Rename to ember-native-class-codemod  ([@pzuraq](https://github.com/pzuraq))

#### :rocket: Enhancement
* [#132](https://github.com/ember-codemods/ember-native-class-codemod/pull/132) Adds the `classicDecorator` option and enable it by default ([@pzuraq](https://github.com/pzuraq))

#### :bug: Bug Fix
* [#129](https://github.com/ember-codemods/ember-native-class-codemod/pull/129) Fix issues identifying in-repo addon paths in getTelemetryFor. ([@rwjblue](https://github.com/rwjblue))
* [#130](https://github.com/ember-codemods/ember-native-class-codemod/pull/130) Ensure logging of modules that failed to gather telemetry. ([@rwjblue](https://github.com/rwjblue))
* [#126](https://github.com/ember-codemods/ember-native-class-codemod/pull/126) Wait for telemetry before starting transforms ([@pzuraq](https://github.com/pzuraq))

#### :house: Internal
* [#131](https://github.com/ember-codemods/ember-native-class-codemod/pull/131) Fix in-repo addon acceptance test to demonstrate real world failure with in-repo addons. ([@rwjblue](https://github.com/rwjblue))
* [#133](https://github.com/ember-codemods/ember-native-class-codemod/pull/133) Convert to single quotes in Prettier configuration ([@pzuraq](https://github.com/pzuraq))
* [#128](https://github.com/ember-codemods/ember-native-class-codemod/pull/128) Add in-repo addon to acceptance test. ([@rwjblue](https://github.com/rwjblue))
* [#127](https://github.com/ember-codemods/ember-native-class-codemod/pull/127) Split apart and add unit tests for getTelemetryFor. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Chris Garrett ([@pzuraq](https://github.com/pzuraq))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v0.2.1 (2019-06-19)

#### :bug: Bug Fix
* [#125](https://github.com/ember-codemods/ember-native-class-codemod/pull/125) Handle module failures gracefully while gathering telemetry. ([@rwjblue](https://github.com/rwjblue))
* [#124](https://github.com/ember-codemods/ember-native-class-codemod/pull/124) Add puppeteer launch flag to ignore https errors ([@ssutar](https://github.com/ssutar))

#### :memo: Documentation
* [#123](https://github.com/ember-codemods/ember-native-class-codemod/pull/123) Add some missing fields to package.json. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Santosh Sutar ([@ssutar](https://github.com/ssutar))

## v0.2.0 (2019-06-18)

#### :boom: Breaking Change
* [#118](https://github.com/ember-codemods/ember-native-class-codemod/pull/118) [FEATURE] Replace dyfactor with puppeteer ([@pzuraq](https://github.com/pzuraq))

#### :rocket: Enhancement
* [#118](https://github.com/ember-codemods/ember-native-class-codemod/pull/118) [FEATURE] Replace dyfactor with puppeteer ([@pzuraq](https://github.com/pzuraq))
* [#112](https://github.com/ember-codemods/ember-native-class-codemod/pull/112) Update to use official decorators from Ember as much as possible ([@ssutar](https://github.com/ssutar))
* [#89](https://github.com/ember-codemods/ember-native-class-codemod/pull/89) Import @service and @controller from @ember packages ([@ssutar](https://github.com/ssutar))

#### :bug: Bug Fix
* [#116](https://github.com/ember-codemods/ember-native-class-codemod/pull/116) Merge imports from the same module ([@ssutar](https://github.com/ssutar))
* [#94](https://github.com/ember-codemods/ember-native-class-codemod/pull/94) Add automatic detection of an infinite `@action` loop ([@ssutar](https://github.com/ssutar))

#### :memo: Documentation
* [#121](https://github.com/ember-codemods/ember-native-class-codemod/pull/121) Update README.md to match recent changes. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#122](https://github.com/ember-codemods/ember-native-class-codemod/pull/122) Add automated release setup and documentation. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 4
- Chris Garrett ([@pzuraq](https://github.com/pzuraq))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Santosh Sutar ([@ssutar](https://github.com/ssutar))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

