module.exports = {
  port: process.env.PORT || 3000,
  connectionString: process.env.CONNECT_STRING || "mongodb://localhost/51ght",
  firebaseConnection: process.env.FIREBASE_CONNECTION || "https://ght-759fd.firebaseio.com"
};