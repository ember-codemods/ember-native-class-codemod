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

