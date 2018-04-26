module.exports = (email) => {
  return email.substr(0, email.indexOf("@"));
}