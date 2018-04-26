const mapTemplate = 
`
  <div id="root">
    <div id="nav" v-show="!addMode">
      <div v-bind:class="{navSelected: firstSelected}" class="navIcon" v-on:click="getAllSightings" v-on:mouseover="firstHover = true"
        v-on:mouseleave="removeNavHovers">
        <transition name="navFade">
          <img v-if="!firstHover" :src="getAllSightingsIcon" />
          <p v-else>All Sightings</p>
        </transition>
      </div>
      <div v-bind:class="{navSelected: secondSelected}" class="navIcon" v-on:click="getUserSightings(getUserId())" v-on:mouseover="secondHover = true"
        v-on:mouseleave="removeNavHovers">
        <transition name="navFade">
          <img v-if="!secondHover" :src="getUsersSightingsIcon" />
          <p v-else>My Sightings</p>
        </transition>
      </div>
      <div v-bind:class="{navSelected: thirdSelected}" class="navIcon" v-on:click="initializeAddSighting" v-on:mouseover="thirdHover = true"
        v-on:mouseleave="removeNavHovers">
        <transition name="navFade">
          <img v-if="!thirdHover" :src="addSightingsIcon" />
          <p v-else>Add Sighting</p>
        </transition>
      </div>
      <div class="navIcon" v-on:click="logout" v-on:mouseover="fourthHover = true" v-on:mouseleave="removeNavHovers">
        <transition name="navFade">
          <img v-if="!fourthHover" :src="logoutIcon" />
          <p v-else>Logout</p>
        </transition>
      </div>
    </div>
    <div id="mapPanel" v-bind:class="{mapTopMargin: addMode}" v-on:keyup.13="nextAddStage">
      <div id="map"></div>
    </div>
    <div id="sightingDetails" v-if="showDetails">
      <div v-if="selectedSighting">
        <img v-if="selectedSighting.imageURL" :src="selectedSighting.imageURL" />
        <h2>{{selectedSighting.title}}</h2>
        <p>author: <span class="highlightP" v-on:click="getUserSightings(selectedSighting.userId)">{{selectedSighting.userName}}</span><p>
        <p>{{new Date(selectedSighting.date).toLocaleString()}}</p>
        <p>{{selectedSighting.description}}</p>
        <hr />
        <h3>comments</h3>
        <p v-if="selectedSighting.comments.length < 1">no comments to display</p>
        <div class="commentContainer" v-for="comment in selectedSighting.comments">
          <p>by: <span class="highlightP" v-on:click="getUserSightings(comment.userId)">{{comment.userName}}</span></p>
          <p>{{new Date(comment.date).toLocaleString()}}</p>
          <p>{{comment.content}}</p>
        </div>
        <textarea class="addCommentText" v-model="newCommentText" placeholder="add a comment"></textarea>
        <p v-if="commentError" class="error commentError">{{commentError}}</p>
        <button v-on:click="addComment">add comment</button>
        <div v-if="selectedSighting.userId === getUserId()">
          <button v-on:click="deleteSighting">delete sighting</button>
        </div>
        <button v-on:click="hideDetails">close</button>
      </div>
      <embed v-else-if="!loadDetailsError" id="loadingImg" src="images/loading.svg" />
      <p v-else class="error">{{loadDetailsError}}</p>
    </div>
    <div id="leftPanel" v-if="!addMode">
      <p v-if="loadSightingsError" class="error">{{loadSightingsError}}</p>
      <embed v-else-if="sightings.length < 1" id="loadingImg" src="images/loading.svg" />
      <div v-else id="sightingsContainer">
        <div class="sighting" ref="sightings" v-for="(sighting in sightings" v-on:click="selectSighting(sighting, false)" v-bind:class="{active: sighting.active}">
          <div class="imageContain">
            <img v-if="!sighting.active" src="images/ufoGrey.png" alt="ufo">
            <img v-else src="images/ufoHighlight.png" alt="ufo">
          </div>
          <div class="textContain">
            <h3>{{sighting.title}}</h3>
            <span>{{sighting.date.split('T')[0]}}</span>
          </div>
        </div>
      </div>
    </div>
    <div id="addPanel" v-if="addMode" v-on:keyup.13="nextAddStage">
      <div id="addPanelNav">
        <div class="addNavIcon" v-on:click="cancelAddSighting(null)" v-on:mouseover="exitHover = true" v-on:mouseleave="exitHover = false">
          <transition name="addNavFade">
            <img v-if="!exitHover" src="./images/exitIcon.svg" />
            <p v-else>cancel</p>
          </transition>
        </div>
        <p v-if="addSightingError"><span class="highlightP">{{addSightingError}}</span></p>
        <p v-else v-html="addSightingInstruct"></p>
      </div>
      <button v-on:click="nextAddStage" v-if="newSightingInfo.marker && addSightingStage === 1">next</button>
      <button v-on:click="nextAddStage" v-if="addSightingStage === 2 && newSightingInfo.title && newSightingInfo.title.length > 2">next</button>
      <button v-on:click="nextAddStage" v-if="addSightingStage === 3 && newSightingInfo.desc && newSightingInfo.desc.length > 5">next</button>
      <button v-on:click="submitNewSighting" v-if="addSightingStage === 4 && newSightingInfo.desc && newSightingInfo.desc.length > 5">submit sighting</button>
      <div id="addSightingOverlay" v-if="addSightingStage > 1">
        <embed id="loadingImgAdd" v-if="loadingData" src="./images/loading.svg" />
        <div v-else>
          <transition name="addFade">
            <div id="addSightingTitle" v-if="addSightingStage === 2">
              <input ref="newSightingTitleInput" type="text" v-model="newSightingInfo.title">
            </div>
          </transition>
          <transition name="addFade">
            <div id="addSightingDesc" v-if="addSightingStage === 3">
              <textarea ref="newSightingDescInput" v-model="newSightingInfo.desc"></textarea>
            </div>
          </transition>
          <transition name="addFade">
            <div id="addSightingPhoto" v-if="addSightingStage === 4">
              <img v-if="newSightingInfo.image" :src="getImageFromFile()">
              <input type="file" accept="image/*" ref="uploadPhotoInput" v-on:change="newImageAdded" />
              <div id="uploadButton" v-on:click="openUploadPrompt"></div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
 `   
