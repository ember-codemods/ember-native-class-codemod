import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';

@classic
class Foo extends EmberObject {
  @computed('post.comments.@each.authorName')
  get authors() {
    return this._authors();
  }
  async _authors() {
    let comments = await this.post.comments;
    return comments.mapBy('authorName');
  }
}
