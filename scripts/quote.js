document.addEventListener("DOMContentLoaded", function() {
    fetch("https://spaceapi.voidwarranties.be/quotes/random?tags=technology")
        .then(response => response.json())
        .then(data => {
        const quoteElement = document.getElementById("quote");
        quoteElement.innerHTML = `<blockquote>"${data[0].content}"<br /><div class="cite"><cite>${data[0].author}</cite></div></blockquote>`;
        })
        .catch(error => console.error('Error fetching quote:', error));
});