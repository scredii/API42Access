var userSchema = mongoose.Schema({
  login       : String,
  email       : String,
  password    : String,
  name        : String,
  firstName   : String,
  language    : {"type": String, "default": "english"},
  intraID     : String,
  token       : String,
  photo       : {"type": String, "default": "https://www.wallstreetotc.com/wp-content/uploads/2014/10/facebook-anonymous-app.jpg"},
  resetToken  : String,
  tokenDate   : Date,
});

module.exports = mongoose.model('User', userSchema);