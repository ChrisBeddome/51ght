new Vue({
  template: loginTemplate,
  el: '#app',
  data: function () {
    return {
      firebaseInit: false,
      login: true,
      swapMessage: "",
      username: "",
      password: "",
      passwordConfirm: "",
      usernamePlaceholder: "username",
      passwordPlaceholder: "password",
      passwordConfirmPlaceholder: "confirm password",
      errorMessage: false,
      loading: false
    }
  },
  methods: {
    swapLogin: function () {
      this.errorMessage = false;
      this.username = "";
      this.password = "";
      this.login = !this.login;
      this.swapText();
    },
    swapText: function () {
      if (this.login) {
        this.swapMessage = "Don't have an account? Click here to Register";
        if (this.firebaseInit) {
          setTimeout(() => this.$refs.loginUserInput.focus(), 0);
        }
      } else {
        this.swapMessage = "Already have an account? Click here to Log in";
        setTimeout(() => this.$refs.regUserInput.focus(), 0);
      }
    },
    checkPasswords: function () {
      return (this.password.length > 0 && this.password === this.passwordConfirm) ? true : false;
    },
    handleLoginClick: function () {
      this.loading = true;
      this.errorMessage = false;
      this.loginUser(this.username, this.password).then((response) => {
        window.location.href = "map.html";
      }).catch((error) => {
        this.errorMessage = error.message
        this.loading = false;
      });
    },
    handleRegisterClick: function () {
      this.errorMessage = false;

      var passwordsMatch = this.checkPasswords();

      if (!passwordsMatch) {
        this.errorMessage = "passwords do not match";
        return;
      }

      this.loading = true;

      this.registerUser(this.username, this.password).then(response => {
        window.location.href = "map.html";
      }).catch((error) => {
        this.errorMessage = error.message;
        this.loading = false;
      });
    },
    loginUser: function (username, password) {
      return new Promise(function (resolve, reject) {
        var userWithDomain = username + "@51ght.com";

        firebase.auth().signInWithEmailAndPassword(userWithDomain, password).catch(function (error) {
          reject(error)
        }).then(function (data) {
          resolve(data);
        });
      });
    },
    registerUser: function (username, password) {
      return new Promise(function (resolve, reject) {
        var userWithDomain = username + "@51ght.com";

        firebase.auth().createUserWithEmailAndPassword(userWithDomain, password).catch(function (error) {
          reject(error)
        }).then(function (data) {
          resolve(data);
        });
      });
    },
    keymonitor: function (event) {
      if (event.key !== "Enter") {
        return;
      }
      this.login ? this.handleLoginClick() : this.handleRegisterClick();
    }
  },
  created: function () {
    firebaseInit();
    firebase.auth().onAuthStateChanged(user => {
      if (this.firebaseInit) {
        return;
      }
      if (user) {
        window.location.href = "map.html";
      }
      setTimeout(() => this.firebaseInit = true, 700); //REMOVE THIS FOR PRODUCTION, settimout to test loading icon
    });
  },
  mounted: function () {
    this.swapText();
  }
});