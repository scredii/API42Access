var exports = module.exports = {};

exports.loggedIn = function(){
  return function(req, res, next) {
    if (req.user)
      return next();
    res.redirect('/');
  }
}

exports.handleError = (err)=>{
  if (err)
    throw (err);
}