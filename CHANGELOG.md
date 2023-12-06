# Changelog
## Release (2023-12-06)

ember-native-class-codemod 4.0.0 (major)

#### :boom: Breaking Change
* `ember-native-class-codemod`
  * [#544](https://github.com/ember-codemods/ember-native-class-codemod/pull/544) drop support for node 14 ([@mansona](https://github.com/mansona))

#### :rocket: Enhancement
* `ember-native-class-codemod`
  * [#533](https://github.com/ember-codemods/ember-native-class-codemod/pull/533) Allow 'helpers' and 'adapters' in type config ([@gitKrystan](https://github.com/gitKrystan))

#### :bug: Bug Fix
* `ember-native-class-codemod`
  * [#545](https://github.com/ember-codemods/ember-native-class-codemod/pull/545) convert to pnpm ([@mansona](https://github.com/mansona))
  * [#534](https://github.com/ember-codemods/ember-native-class-codemod/pull/534) Only get telemetry if transform is actually needed ([@gitKrystan](https://github.com/gitKrystan))

#### :house: Internal
* `ember-native-class-codemod`
  * [#546](https://github.com/ember-codemods/ember-native-class-codemod/pull/546) start using release-plan ([@mansona](https://github.com/mansona))

#### Committers: 2
- Chris Manson ([@mansona](https://github.com/mansona))
- Krystan HuffMenne ([@gitKrystan](https://github.com/gitKrystan))



## v3.2.0 (2023-04-26)

#### :rocket: Enhancement
* [#525](https://github.com/ember-codemods/ember-native-class-codemod/pull/525) Utilize jscodeshift CLI results output ([@gitKrystan](https://github.com/gitKrystan))

#### :bug: Bug Fix
* [#524](https://github.com/ember-codemods/ember-native-class-codemod/pull/524) Retain async / generator behavior on class methods (Closes [#521](https://github.com/ember-codemods/ember-native-class-codemod/issues/521)) ([@gitKrystan](https://github.com/gitKrystan))

#### :memo: Documentation
* [#531](https://github.com/ember-codemods/ember-native-class-codemod/pull/531) Fix typos in readme ([@gitKrystan](https://github.com/gitKrystan))

#### :house: Internal
* [#529](https://github.com/ember-codemods/ember-native-class-codemod/pull/529) Upgrade Dependencies + Fix CI ([@gitKrystan](https://github.com/gitKrystan))

#### Committers: 1
- Krystan HuffMenne ([@gitKrystan](https://github.com/gitKrystan))

## v3.1.0 (2023-03-10)

#### :rocket: Enhancement
* [#502](https://github.com/ember-codemods/ember-native-class-codemod/pull/502) Support legacy decorators in object literals (and related improvements) ([@gitKrystan](https://github.com/gitKrystan))

#### :bug: Bug Fix
* [#520](https://github.com/ember-codemods/ember-native-class-codemod/pull/520) Handle 'true'/'false' stringified boolean options and better config error handling ([@gitKrystan](https://github.com/gitKrystan))
* [#211](https://github.com/ember-codemods/ember-native-class-codemod/pull/211) Don't append object name when type is already at the end of the filename ([@patocallaghan](https://github.com/patocallaghan))

#### :house: Internal
* [#519](https://github.com/ember-codemods/ember-native-class-codemod/pull/519) Remove node 12 from package.json engines / Upgrade release-it dependencies ([@gitKrystan](https://github.com/gitKrystan))
* [#518](https://github.com/ember-codemods/ember-native-class-codemod/pull/518) Run yarn upgrade ([@gitKrystan](https://github.com/gitKrystan))
* [#517](https://github.com/ember-codemods/ember-native-class-codemod/pull/517) Upgrade typescript ([@gitKrystan](https://github.com/gitKrystan))
* [#516](https://github.com/ember-codemods/ember-native-class-codemod/pull/516) Upgrade release-it dependencies ([@gitKrystan](https://github.com/gitKrystan))
* [#515](https://github.com/ember-codemods/ember-native-class-codemod/pull/515) Upgrade prettier ([@gitKrystan](https://github.com/gitKrystan))
* [#514](https://github.com/ember-codemods/ember-native-class-codemod/pull/514) Upgrade execa ([@gitKrystan](https://github.com/gitKrystan))
* [#513](https://github.com/ember-codemods/ember-native-class-codemod/pull/513) Upgrade eslint dependencies ([@gitKrystan](https://github.com/gitKrystan))
* [#512](https://github.com/ember-codemods/ember-native-class-codemod/pull/512) Upgrade jest dependencies ([@gitKrystan](https://github.com/gitKrystan))
* [#511](https://github.com/ember-codemods/ember-native-class-codemod/pull/511) Upgrade zod ([@gitKrystan](https://github.com/gitKrystan))
* [#510](https://github.com/ember-codemods/ember-native-class-codemod/pull/510) Upgrade winston ([@gitKrystan](https://github.com/gitKrystan))
* [#508](https://github.com/ember-codemods/ember-native-class-codemod/pull/508) Upgrade walk-sync ([@gitKrystan](https://github.com/gitKrystan))
* [#507](https://github.com/ember-codemods/ember-native-class-codemod/pull/507) Upgrade minimatch ([@gitKrystan](https://github.com/gitKrystan))
* [#506](https://github.com/ember-codemods/ember-native-class-codemod/pull/506) Remove unused dependencies ([@gitKrystan](https://github.com/gitKrystan))
* [#505](https://github.com/ember-codemods/ember-native-class-codemod/pull/505) Upgrade cosmiconfig ([@gitKrystan](https://github.com/gitKrystan))
* [#504](https://github.com/ember-codemods/ember-native-class-codemod/pull/504) Upgrade @babel dependencies ([@gitKrystan](https://github.com/gitKrystan))
* [#498](https://github.com/ember-codemods/ember-native-class-codemod/pull/498) Convert to TypeScript ([@gitKrystan](https://github.com/gitKrystan))

#### Committers: 3
- Berkan Ünal ([@brkn](https://github.com/brkn))
- Krystan HuffMenne ([@gitKrystan](https://github.com/gitKrystan))
- Pat O'Callaghan ([@patocallaghan](https://github.com/patocallaghan))

## v3.0.0 (2022-11-14)

#### :boom: Breaking Change
* [#490](https://github.com/ember-codemods/ember-native-class-codemod/pull/490) Drop support for EOL Node versions ([@mansona](https://github.com/mansona))

#### :house: Internal
* [#491](https://github.com/ember-codemods/ember-native-class-codemod/pull/491) update codemods-telemetry-helpers ([@mansona](https://github.com/mansona))
* [#486](https://github.com/ember-codemods/ember-native-class-codemod/pull/486) update to the latest puppeteer ([@mansona](https://github.com/mansona))
* [#487](https://github.com/ember-codemods/ember-native-class-codemod/pull/487) move from travis to github actions ([@mansona](https://github.com/mansona))

#### Committers: 1
- Chris Manson ([@mansona](https://github.com/mansona))

## v2.1.0 (2021-04-13)

#### :rocket: Enhancement
* [#432](https://github.com/ember-codemods/ember-native-class-codemod/pull/432) Support running codemod against an addon's dummy app ([@tylerbecks](https://github.com/tylerbecks))

#### Committers: 1
- Tyler Becks ([@tylerbecks](https://github.com/tylerbecks))


## v2.0.0 (2020-12-14)

#### :boom: Breaking Change
* [#391](https://github.com/ember-codemods/ember-native-class-codemod/pull/391) Drop Node < 10 and bump telemetry helpers ([@suchitadoshi1987](https://github.com/suchitadoshi1987))

#### :memo: Documentation
* [#280](https://github.com/ember-codemods/ember-native-class-codemod/pull/280) docs: add lint rule link ([@bmish](https://github.com/bmish))

#### :house: Internal
* [#213](https://github.com/ember-codemods/ember-native-class-codemod/pull/213) Update telemetry helpers ([@tylerturdenpants](https://github.com/tylerturdenpants))

#### Committers: 4
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Ryan Mark ([@tylerturdenpants](https://github.com/tylerturdenpants))
- Suchita Doshi ([@suchitadoshi1987](https://github.com/suchitadoshi1987))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


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

