import classic from 'ember-classic-decorator';

/**
 * Program comments
 */
@classic
class Foo extends Test {
 location = ENV.locationType || 'history';
}
