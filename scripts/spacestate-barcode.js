function spaceApi() {
  fetch("https://spaceapi.voidwarranties.be")
    .then(response => response.json())
    .then(data => {
      if (data.state.open) {
        document.getElementById("content").classList.add("open");
        document.getElementById("content").classList.remove("closed");
        document.getElementById("status").innerHTML = "OPEN";
        document.title = "[OPEN] VoidWarranties";
      } else if (data.state.open == false) {
        document.getElementById("content").classList.add("closed");
        document.getElementById("content").classList.remove("open");
        document.getElementById("status").innerHTML = "CLOSED";
        document.title = "[CLOSED] VoidWarranties";
      } else {
        document.getElementById("content").classList.remove("closed");
        document.getElementById("content").classList.remove("open");
        document.getElementById("status").innerHTML = "error loading space state";
        document.title = "VoidWarranties";
      }
    })
    .catch(error => console.error('Error fetching data:', error));
}

document.addEventListener("DOMContentLoaded", spaceApi);

setInterval(spaceApi, 10000);
