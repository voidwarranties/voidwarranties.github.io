document.addEventListener("DOMContentLoaded", function() {
    const quoteElement = document.getElementById("quote");
    fetch("https://spaceapi.voidwarranties.be/quotes/random?tags=technology")
    .then(response => response.json())
    .then(data => {
        quoteElement.innerHTML = `<blockquote>"${data[0].content}"<br /><div class="cite"><cite>${data[0].author}</cite></div></blockquote>`;
    })
    .catch(error => {
        console.error('Error fetching quote:', error);
        const content = "(3276019 row(s) affected)";
        const author = "SQL server";
        quoteElement.innerHTML = '<blockquote>"'+ content +'"<br /><div class="cite"><cite>'+ author +'</cite></div></blockquote>';
        console.log("Fallback quote set.");
    });
});
