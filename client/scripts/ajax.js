const ajax = function () {

  //keep track of requests and initTime to allow request throttling
  let initTime = new Date();
  let requests = 0;

  //reset init time and requests every 10 seconds to keep throttle window reasonable
  setInterval(() => {
    requests = 0;
    initTime = new Date() - 500;
  }, 10000);

  function getRequestsPerSecond() {
    let now = new Date();
    timeElapsed = (now - initTime) / 1000;
    requestsPerSecond = requests / timeElapsed;
    return requestsPerSecond;
  }

  function checkRequestThrottle() {
    const maxRequestsPerSecond = 1;
    return getRequestsPerSecond() > maxRequestsPerSecond ? false : true;
  }

  function getAllSightings() {
    return new Promise((res, rej) => {

      if (!checkRequestThrottle()) {
        rej(new Error("Too many requests, try again shortly"));
      }

      requests++;

      fetch("/api/sightings")
        .then(response => {
          response.json().then(data => {
            if (!response.ok) {
              rej(new Error(response.statusText));
            }
            if (data.count > 0) {
              res(data.sightings);
            } else {
              rej(new Error("No Sightings to Display"));
            }
          })
        })
        .catch(err => {
          rej(new Error(err.message));
        })
    });
  }

  function getUserSightings(userId) {
    return new Promise((res, rej) => {

      if (!checkRequestThrottle()) {
        rej(new Error("Too many requests, try again shortly"));
      }

      requests++;

      fetch(`/api/users/${userId}/sightings`)
        .then(response => {
          response.json().then(data => {
            if (!response.ok) {
              rej(new Error(response.statusText));
            }
            if (data.count > 0) {
              res(data.sightings);
            } else {
              rej(new Error("No Sightings to Display"));
            }
          })
        })
        .catch(err => {
          rej(new Error(err.message));
        })
    });
  }

  function getSingleSighting(sightingId) {
    return new Promise((res, rej) => {
      if (!checkRequestThrottle()) {
        rej(new Error("Too many requests, try again shortly"));
      }

      requests++;

      fetch(`/api/sightings/${sightingId}`)
        .then(response => {
          response.json().then(data => {
            if (!response.ok) {
              rej(new Error(response.statusText));
            }
            res(data);
          })
        })
        .catch(err => {
          rej(new Error(err.message));
        })
    });
  }

  function addSighting(data) {
    return new Promise((res, rej) => {
      fetch("/api/sightings", {
          method: 'POST',
          body: JSON.stringify(data),
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }).then(response => {
          response.json().then(data => {
            if (!response.ok) {
              rej(new Error(response.statusText));
            }
            res(data);
          })
        })
        .catch(err => {
          rej(new Error(err.message));
        });
    });
  }

  function uploadPhoto(sightingId, formData) {
    return new Promise((res, rej) => {
      fetch(`/api/sightings/${sightingId}/image`, {
          method: "POST",
          body: formData
        }).then(response => response.json()
        .then(data => {
          if (!response.ok) {
            rej(new Error(response.statusText));
          }
          res(data);
        })).catch(err => {
          rej(new Error(err.message));
        });
    });
  }

  function deleteSighting(sightingID, idToken) {
    return new Promise((res, rej) => {
      fetch(`/api/sightings/${sightingID}`, {
          method: 'DELETE',
          body: JSON.stringify({idToken}),
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }).then(response => {
          response.json().then(data => {
            if (!response.ok) {
              rej(new Error(response.statusText));
            }
            res(data);
          })
        })
        .catch(err => {
          rej(new Error(err.message));
        });
    });
  }

  function addComment(sightingID, userToken, commentText) {
    return new Promise((res, rej) => {
      fetch(`/api/sightings/${sightingID}/comments`, {
          method: 'POST',
          body: JSON.stringify({
            idToken : userToken,
            content: commentText
          }),
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }).then(response => {
          response.json().then(data => {
            if (!response.ok) {
              rej(new Error(response.statusText));
            }
            res(data);
          })
        })
        .catch(err => {
          rej(new Error(err.message));
        });
    });
  }

  //TESTING ONLY
  function addRandomSightings(amt) {
    firebase.auth().currentUser.getIdToken().then(token => {

      for (var i = 0; i < amt; i++) {
        let data = {
          title: "Sighting " + new Date().toDateString(),
          description: "auto generated",
          position: {
            lat: Math.floor(Math.random() * Math.floor(180)) - 90,
            long: Math.floor(Math.random() * Math.floor(360)) - 180
          },
          idToken: token
        }

        fetch("/api/sightings/", {
          method: 'POST',
          body: JSON.stringify(data),
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        });
      }
    });
  }

  return {
    getAllSightings,
    getUserSightings,
    getSingleSighting,
    addSighting,
    uploadPhoto,
    addComment,
    deleteSighting
  };

}();