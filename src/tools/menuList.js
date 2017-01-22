module.exports = (req, res, next) => {
  if (!req.user) {
    next();
  } else if (req.user.admin) {
    req.menuList = [{
      name: 'Home',
      path: '/'
    }, {
      name: 'Activity',
      path: '/activities'
    }];
    next();
  }
};
