function spaceApi() {
  fetch("https://spaceapi.voidwarranties.be")
    .then(response => response.json())
    .then(data => {
      if (data.state.open) {
        document.getElementById("logo").setAttribute("src", "img/voidlogo-on.png");
        document.getElementById("logo").setAttribute("alt", "logo - space open");
      } else {
        document.getElementById("logo").setAttribute("src", "img/voidlogo-off.png");
        document.getElementById("logo").setAttribute("alt", "logo - space closed");
      }
    })
    .catch(error => console.error('Error fetching data:', error));
}

document.addEventListener("DOMContentLoaded", spaceApi);

setInterval(spaceApi, 10000);
  