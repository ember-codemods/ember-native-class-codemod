import { computed } from '@ember/object';

const Foo = EmberObject.extend({
  authors: computed('post.comments.@each.authorName', async function () {
    let comments = await this.post.comments;
    return comments.mapBy('authorName');
  }),
});
