const loginTemplate = `
<div id="root">
  
  <embed id="loadingImg" src="images/loading.svg" v-if="!firebaseInit || loading" />
  <div id="loginContainer" v-else>
  
  <header>
      <img id="logo" src="images/logo-500px.png" alt="Header Logo">
  </header>

      <div id="login" class="userForm" v-if="login">
          <input ref="loginUserInput" id="loginUser" type="text" :placeholder="usernamePlaceholder" v-model="username" v-on:keyup="keymonitor"
              autofocus>
          <input id="loginPassword" type="password" :placeholder="passwordPlaceholder" v-on:keyup="keymonitor" v-model="password">
          <div class="hr"></div>
          <button v-on:click="handleLoginClick">login</button>
      </div>

      <div id="register" class="userForm" v-else>
          <input ref="regUserInput" id="regUser" type="text" :placeholder="usernamePlaceholder" v-on:keyup="keymonitor" v-model="username">
          <input id="regPassword" type="password" :placeholder="passwordPlaceholder" v-on:keyup="keymonitor" v-model="password">
          <input id="regPasswordConfirm" type="password" :placeholder="passwordConfirmPlaceholder" v-on:keyup="keymonitor" v-model="passwordConfirm">
          <div class="hr"></div>
          <button v-on:click="handleRegisterClick">register</button>
      </div>

      <span id="swapLogin" v-on:click="swapLogin">{{ swapMessage }}</span>
      <span id="errorOutput" v-if="errorMessage">{{ errorMessage }}</span>
      
  </div>
</div>
`;