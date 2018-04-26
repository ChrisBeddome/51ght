new Vue({
  template: mapTemplate,
  el: '#app',

  data: function () {
    return {
      sightings: [],
      selectedSighting: null,
      map: null,
      showDetails: false,
      firebaseInit: false,
      loadingData: false,
      loadDetailsError: null,
      loadSightingsError: null,
      addSightingError: null,
      commentError: null,
      addMode: false,
      ufoIcon: L.icon({
        iconUrl: 'images/mk_dot.png',
        iconSize: [25, 25],
        shadowUrl: "images/mk_shadow2.png",
        shadowSize: [110, 110]
      }),
      highlightIcon: L.icon({
        iconUrl: 'images/mk_dot.png',
        iconSize: [35, 35],
        shadowUrl: "images/mk_shadow_highlight.png",
        shadowSize: [130, 130]
      }),
      getAllSightingsIcon: "./images/allIcon.svg",
      getUsersSightingsIcon: "./images/userIcon.svg",
      addSightingsIcon: "./images/addIcon.svg",
      logoutIcon: "./images/logoutIcon.svg",
      exitHover: false,
      firstHover: false,
      secondHover: false,
      thirdHover: false,
      fourthHover: false,
      firstSelected: false,
      secondSelected: false,
      thirdSelected: false,
      newSightingInfo: {
        marker: null,
        title: null,
        desc: null,
        image: null
      },
      addSightingStage: 0,
      addSightingInstruct: null,
      newCommentText: ""
    };
  },

  methods: {
    getAllSightings: async function () {
      this.clearErrors();
      if (this.loadingData) {
        return;
      }

      if (this.sightings.length > 0) {
        this.removeSightings();
      }

      this.removeNavHighlights();
      this.getAllSightingsIcon = "./images/allIconGreen.svg";
      this.firstSelected = true;
      this.addMode = false;

      this.loadingData = true;

      try {
        let sightings = await ajax.getAllSightings();
        //REMOVE THIS FOR PRODUCTION, settimout to test loading icon
        setTimeout(() => {
          this.bindSightings(sightings);
          this.loadingData = false;
        }, 500);
      } catch (err) {
        this.loadSightingsError = err.message;
        this.loadingData = false;
      }
    },

    getUserSightings: async function (userId) {
      return new Promise(async (res, rej) => {
        this.clearErrors();

        if (this.loadingData) {
          return;
        }

        if (!this.firebaseInit) {
          this.loadSightingsError = "authentication error";
          return;
        }

        if (this.sightings.length > 0) {
          this.removeSightings();
        }

        this.removeNavHighlights();
        this.getUsersSightingsIcon = "./images/userIconGreen.svg";
        this.secondSelected = true;
        this.addMode = false;

        this.loadingData = true;

        try {
          let sightings = await ajax.getUserSightings(userId);

          //REMOVE THIS FOR PRODUCTION, settimout to test loading icon
          setTimeout(() => {
            this.bindSightings(sightings);
            this.loadingData = false;
            res("done");
          }, 500);
        } catch (err) {
          this.loadSightingsError = err.message;
          this.loadingData = false;
        }
      });
    },

    removeSightings: function () {
      this.clearErrors();
      this.thirdSelected = true;
      this.sightings.forEach(sighting => {
        sighting.marker.removeEventListener("click", sighting.marker.onClick);
        this.map.removeLayer(sighting.marker);
      });
      this.sightings = [];
      this.removeSelectedSighting();

      if (this.showDetails) {
        this.hideDetails();
      }
    },

    bindSightings: function (sightings) {
      sightings.forEach(sighting => {
        sighting.active = false;
        let marker = sighting.marker = L.marker([sighting.position.lat, sighting.position.long], {
          icon: this.ufoIcon
        }).addTo(this.map);
        //store reference to parent sighting on marker
        marker.sighting = sighting;
        sighting.marker.onClick = () => {
          this.selectSighting(marker.sighting, true);
        }
        sighting.marker.addEventListener("click", sighting.marker.onClick);
      });
      this.sightings = sightings;
    },

    selectSighting: function (selectedSighting, scroll) {
      if (this.loadingData) {
        return;
      }

      this.clearErrors();
      this.loadingData = true;

      this.removeSelectedSighting();
      selectedSighting.active = true;
      selectedSighting.marker.setIcon(this.highlightIcon);
      selectedSighting.marker.setZIndexOffset(1000);
      selectedSighting.marker._shadow.style.zIndex = 300;

      setTimeout(() => {
        //map gets resized so center changes, must invalidate previous size 
        this.map.invalidateSize();
        this.map.setView(selectedSighting.marker.getLatLng());
      }, 20);

      if (scroll) {
        let index = this.sightings.indexOf(selectedSighting);
        this.scrollContainer(this.$refs.sightings[index]);
      }

      this.getSightingDetails(selectedSighting._id);
    },

    getSightingDetails: async function (id) {
      this.showDetails = true;
      this.newCommentText = "";

      try {
        let sightingDetails = await ajax.getSingleSighting(id);

        //REMOVE THIS FOR PRODUCTION, settimout to test loading icon
        setTimeout(() => {
          this.selectedSighting = sightingDetails;
          this.loadingData = false;
        }, 500);
      } catch (err) {
        this.loadDetailsError = err.message;
        this.loadingData = false;
      }
    },

    addComment: async function () {
      if (this.loadingData) {
        return;
      }

      if (this.newCommentText.length < 5) {
        this.commentError = "comment too short"
        return;
      }

      this.clearErrors();
      this.loadingData = true;

      try {
        let token = await this.getIdToken();
        let response = await ajax.addComment(this.selectedSighting._id, token, this.newCommentText);
        this.selectedSighting.comments.push(response.comment);
        this.newCommentText = "";
        this.loadingData = false;
      } catch (err) {
        this.commentError = err.message;
        this.loadingData = false;
      }
    },

    initializeAddSighting: function () {
      if (this.loadingData) {
        return;
      }

      this.clearErrors();
      this.showDetails = false;
      this.removeSelectedSighting();
      this.removeSightings();
      this.removeNavHighlights();
      this.addSightingsIcon = "./images/addIconGreen.svg";
      this.thirdSelected = true;
      this.addMode = true;
      this.addSightingStage = 1;
      this.addSightingInstruct = "<span class='highlightP'>click</span> on the map to add sighting location";

      this.map.addSightingClick = (e) => {
        if (this.newSightingInfo.marker) {
          this.map.removeLayer(this.newSightingInfo.marker);
        }

        this.newSightingInfo.marker = L.marker([e.latlng.lat, e.latlng.lng], {
          icon: this.ufoIcon
        }).addTo(this.map);
      };

      this.map.addEventListener("click", this.map.addSightingClick);

      setTimeout(() => {
        //map gets resized so center changes, must invalidate previous size 
        this.map.invalidateSize();
      }, 20);
    },

    nextAddStage: function (e) {
      this.clearErrors();
      if (!this.addMode) {
        return;
      }

      //allow shift+enter to be used for line breaks
      if (e.which === 13 && e.shiftKey) {
        return;
      }

      if (this.addSightingStage === 1) {
        if (!this.newSightingInfo.marker) {
          return;
        }
        this.map.removeEventListener("click", this.map.addSightingClick);
        this.addSightingInstruct = "enter a <span class='highlightP'>title</span> for your sighting";
        setTimeout(() => this.$refs.newSightingTitleInput.focus(), 0);
      }

      if (this.addSightingStage === 2) {
        if (!this.newSightingInfo.title || this.newSightingInfo.title.length < 3) {
          return;
        }
        this.addSightingInstruct = "enter a <span class='highlightP'>description</span> for your sighting";
        setTimeout(() => this.$refs.newSightingDescInput.focus(), 0);
      }

      if (this.addSightingStage === 3) {
        if (!this.newSightingInfo.desc || this.newSightingInfo.title.desc < 6) {
          return;
        }
        this.addSightingInstruct = "add a <span class='highlightP'>photo</span> for your sighting (optional)";
      }

      if (this.addSightingStage === 4) {
        this.submitNewSighting();
        return;
      }

      this.addSightingStage++;
    },

    submitNewSighting: async function () {
      if (this.loadingData) {
        return;
      }

      this.clearErrors();
      let newSighting = this.newSightingInfo;
      let data = {};
      data.title = newSighting.title;
      data.description = newSighting.desc;
      data.position = {
        lat: newSighting.marker._latlng.lat,
        long: newSighting.marker._latlng.lng
      };

      this.loadingData = true;

      try {
        data.idToken = await this.getIdToken();
        let response = await ajax.addSighting(data);
        if (this.newSightingInfo.image) {
          this.uploadPhoto(response.sighting._id, data.idToken);
        } else {
          //remove this
          setTimeout(() => {
            this.loadingData = false;
            this.cancelAddSighting(response.sighting._id);
          }, 500);
        }
      } catch (err) {
        this.addSightingError = "upload error";
        this.loadingData = false;
      }
    },

    uploadPhoto: async function (sightingId, idToken) {
      let formData = new FormData();
      formData.append("idToken", idToken);
      formData.append("image", this.newSightingInfo.image);

      try {
        let response = await ajax.uploadPhoto(sightingId, formData);
        setTimeout(() => {
          this.loadingData = false;
          this.cancelAddSighting(sightingId);
        }, 500);
      } catch (err) {
        this.addSightingError = "upload error";
        this.loadingData = false;
      }
    },

    cancelAddSighting: async function (newSightingId) {
      if (this.newSightingInfo.marker) {
        this.map.removeLayer(this.newSightingInfo.marker);
      }

      this.newSightingInfo = {
        marker: null,
        title: null,
        desc: null,
        image: null
      }

      this.addSightingInstruct = null;
      this.addSightingStage = 0;
      this.addMode = false;
      this.exitHover = false;
      this.clearErrors();
      this.map.removeEventListener("click", this.map.addSightingClick);

      let response = await this.getUserSightings(this.getUserId());
      //once user sightings are loaded, select sighting that was just added
      if (newSightingId) {
        let newSighting = this.sightings.filter(sighting => sighting._id === newSightingId)[0];
        this.selectSighting(newSighting);
      }
    },

    deleteSighting: async function () {
      this.clearErrors();
      if (this.loadingData) {
        return;
      }

      this.loadingData = true;

      try {
        let userToken = await this.getIdToken();
        let sightingID = this.selectedSighting._id;
        let response = await ajax.deleteSighting(sightingID, userToken);
        let marker = this.sightings.find(sighting => sighting._id = sightingID).marker;
        this.map.removeLayer(marker);
        this.sightings = this.sightings.filter(sighting => sighting._id !== this.selectedSighting._id);
        this.hideDetails();
        this.loadingData = false;
      } catch (err) {
        this.comment = err.message;
        this.loadingData = false;
      }
    },

    clearErrors: function () {
      this.loadDetailsError = null;
      this.loadSightingsError = null;
      this.addSightingError = null;
      this.commentError = null;
    },

    initializeMap: function () {
      let map = L.map('map', {
        worldCopyJump: true,
        attributionControl: false
      }).setView([42.008, -92.397], 5);
      map.zoomControl.setPosition('topright');

      L.tileLayer('https://api.mapbox.com/styles/v1/ecuerden/cje4otjmf6pgh2rmpsipmmmjv/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        minZoom: 3,
        accessToken: 'pk.eyJ1IjoiZWN1ZXJkZW4iLCJhIjoiY2pjejFydDlhMG5vNzMzcW8wa3NrYTgzZiJ9.YsJvZf4dEX_r1we10yHheQ'
      }).addTo(map);

      this.map = map;
    },

    hideDetails: function () {
      this.clearErrors();
      this.showDetails = false;
      this.removeSelectedSighting();
      setTimeout(() => {
        //map gets resized so center changes, must invalidate previous size 
        this.map.invalidateSize();
      }, 20);
    },

    removeSelectedSighting: function () {
      this.selectedSighting = null;
      this.sightings.forEach(sighting => {
        sighting.active = false;
        sighting.marker.setIcon(this.ufoIcon);
        sighting.marker.setZIndexOffset(500);
        sighting.marker._shadow.style.zIndex = 0;
      });
    },

    getUserId: function () {
      if (this.firebaseInit) {
        return firebase.auth().currentUser.uid;
      }
    },

    removeNavHovers: function () {
      this.firstHover = false;
      this.secondHover = false;
      this.thirdHover = false;
      this.fourthHover = false;
    },

    removeNavHighlights: function () {
      this.getAllSightingsIcon = "./images/allIcon.svg";
      this.getUsersSightingsIcon = "./images/userIcon.svg";
      this.addSightingsIcon = "./images/addIcon.svg";
      this.firstSelected = false;
      this.secondSelected = false;
      this.thirdSelected = false;
    },

    openUploadPrompt: function () {
      this.$refs.uploadPhotoInput.click();
    },

    newImageAdded: function () {
      if (this.$refs.uploadPhotoInput.files.length > 0) {
        if (this.$refs.uploadPhotoInput.files[0].type != "image/jpeg" && this.$refs.uploadPhotoInput.files[0].type != "image/png") {
          return;
        }
        this.newSightingInfo.image = this.$refs.uploadPhotoInput.files[0];
      } else {
        this.newSightingInfo.image = null;
      }
    },

    getImageFromFile: function () {
      return URL.createObjectURL(this.newSightingInfo.image);
    },

    getIdToken: function () {
      return new Promise((res, rej) => {
        firebase.auth().currentUser.getIdToken()
          .then(token => {
            res(token);
          })
          .catch((err) => {
            rej(err.message);
          });
      });
    },

    logout: function () {
      this.clearErrors();
      if (!this.firebaseInit) {
        return;
      }
      firebase.auth().signOut().then(() => {
        window.location.href = "index.html";
      });
    },

    //when sighting is clicked on the map, corresponding sighting is highlighted in list,
    //if sighting is not in view, smooth scroll the list so the sighting is in view.
    scrollContainer: function (target) {
      let scrollContainer = target;
      do {
        scrollContainer = scrollContainer.parentNode;
        if (!scrollContainer) return;
        scrollContainer.scrollTop += 1;
      } while (scrollContainer.scrollTop == 0);

      let targetY = 0;
      do {
        if (target == scrollContainer) break;
        targetY += target.offsetTop;
      } while (target = target.offsetParent);

      scroll = function (c, a, b, i) {
        i++;
        if (i > 10) return;
        c.scrollTop = a + (b - a) / 10 * i;
        setTimeout(function () {
          scroll(c, a, b, i);
        }, 1);
      }
      scroll(scrollContainer, scrollContainer.scrollTop, targetY, 0);
    }
  },

  created: function () {
    firebaseInit();
    firebase.auth().onAuthStateChanged(user => {
      if (!firebase.auth().currentUser) {
        this.logout();
      }
      if (this.firebaseInit) {
        return;
      } else {
        this.firebaseInit = true;
      }
    });
    this.getAllSightings();
  },

  mounted: function () {
    this.initializeMap();
  }
});