const OPTIONS = [
  { type: 'content', uri: '/blog', permissions: ['blog_writer'], label: 'Blog' },
  { type: 'content', uri: '/sermons', permissions: ['sermon_publisher'], label: 'Sermons' },
  { type: 'content', uri: '/series', permissions: ['sermon_publisher'], label: 'Series' },
  { type: 'content', uri: '/events', permissions: ['events_publisher'], label: 'Events' },
  { type: 'content', uri: '/feed', permissions: ['feed_publisher'], label: 'Feed (Legacy)' },
  { type: 'content', uri: '/pages', permissions: ['page_editor'], label: 'Pages' },
  { type: 'management', uri: '/users', permissions: ['add_users'], label: 'Users' },
  { type: 'management', uri: '/templates', permissions: ['template_editor'], label: 'Email Templates' },
  { type: 'management', uri: '/media', permissions: ['media_editor'], label: 'Media' },
  { type: 'publish', uri: '/groups', permissions: ['groups_editor'], label: 'Groups' },
  { type: 'publish', uri: '/classes', permissions: ['class_editor'], label: 'Classes' },
  { type: 'publish', uri: '/emails', permissions: ['send_email'], label: 'Send Email' },
  { type: 'publish', uri: '/notif', permissions: ['send_notification'], label: 'Send Notification' },
  { type: 'publish', uri: '/today', permissions: ['today_editor'], label: 'Today' },
];

export default () => {
  const user = JSON.parse(window.localStorage.getItem('flatland:adminUser') || '{}');
  const menuItems = {};

  OPTIONS.forEach((option) => {
    option.permissions.forEach((permission) => {
      if (user.roles[permission]) {
        menuItems[option.type] = Array.isArray(menuItems[option.type]) ?
          [...menuItems[option.type], { uri: option.uri, label: option.label }] :
          [{ uri: option.uri, label: option.label }];
      }
    });
  });

  return menuItems;
};
