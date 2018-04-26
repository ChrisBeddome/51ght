const firebase = require('firebase-admin');

module.exports = (req, res, next) => {
  try {
    firebase.auth().verifyIdToken(req.body.idToken)
      .then(function (decodedToken) {
        const user = {
          id : decodedToken.uid,
          email : decodedToken.email
        } 
        next(user);
      }).catch(function (error) {
        res.status(403).json({
          message: "unauthorized"
        });
      });
  } catch (err) {
    res.status(403).json({
      message: "must provide valid credentials"
    });
  }
}