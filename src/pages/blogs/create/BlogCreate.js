import React from 'react';
import moment from 'moment';
import slugify from 'slugify';

import BlogEditor from '../editor/BlogEditor';
import removeRegex from '../../../utils/removeRegex';

export default class BlogCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
    };
  }

  handleSave = (data) => {
    this.setState({ saving: true });

    const permalink = slugify(data.title, {
      remove: removeRegex,
      lower: true,
    });

    const post = {
      approved: true,
      author: data.author,
      content: data.content,
      date: moment().unix(),
      image: data.image,
      imageAttribution: data.imageAttribution,
      published: data.published,
      title: data.title,
      topics: {
        [data.category]: true,
      },
      permalink,
    };

    window.firebase.database().ref(`blogContents/${permalink}`)
      .set(post, () => {
        window.firebase.database()
          .ref(`blogMeta/${post.date}`)
          .set({
            approved: post.approved,
            author: post.author.name,
            image: post.image,
            published: post.published,
            title: post.title,
            topics: post.topics,
            permalink,
          }, () => {
            if (post.published && post.topics && post.topics.devotionals) {
              fetch('https://api.flatlandchurch.com/v2/emails/devotional?key=202f1c42-7054-46ee-8ca2-ddc85f9c789b', {
                body: JSON.stringify({
                  permalink,
                  userId: JSON.parse(window.localStorage.getItem('flatland:adminUser') || '{}').id
                }),
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                }
              }).then(() => {
                window.location.href = `/blog/${permalink}?status=created`;
              });
            } else {
              window.location.href = `/blog/${permalink}?status=created`;
            }
          })
      });
  };

  render() {
    return (
      <BlogEditor
        onSave={this.handleSave}
        mode="create"
        saving={this.state.saving}
      />
    );
  }
}