/*
Expect error:
	ValidationError: Validation errors for class 'ChainedClassDefinition':
		class has chained definition (e.g. EmberObject.extend().reopenClass();
*/

import EmberObject from '@ember/object';

export default EmberObject.extend({}).reopenClass({});
