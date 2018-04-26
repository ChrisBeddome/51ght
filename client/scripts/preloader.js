const imageUrls= ["loading.svg", "ufoHighlight.png", "mk_shadow_highlight.png", "mk_shadow2.png"];

//there must be a better way to do this...
imageUrls.map(imageUrl => {
  let img = document.createElement("img");
  img.style.display = "none";
  img.src = "./images/" + imageUrl;
  return img;
}).forEach(element => {
  document.body.appendChild(element);
  document.body.removeChild(element);
});