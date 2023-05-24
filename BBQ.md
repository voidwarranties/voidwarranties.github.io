<h2 id="BBQ">Inschrijvingen BBQ '23</h2>
<div id="BBQform"><script>
    function calcTotal() {
      var aantalVleeseters = parseInt(document.getElementById("meat").value);
        console.log("vlees: " + aantalVleeseters);
      var aantalVegetariers = parseInt(document.getElementById("vegi").value);
        console.log("vegi: " + aantalVegetariers);
      var totaalAantal = aantalVleeseters + aantalVegetariers;
        console.log("totaal: " + totaalAantal);
      document.getElementById("total").value = totaalAantal;
        console.log("totalvalue: " + document.getElementById("total").value);
    }
	function submitForm() {
      // Get form data
      var naam = document.getElementById("naam").value;
      var email = document.getElementById("email").value;
      var contact = document.getElementById("contact").value;
      var vegi = parseInt(document.getElementById("vegi").value);
      var vlees = parseInt(document.getElementById("meat").value);

      // Create JSON object
      var formData = {
        naam: naam,
        email: email,
        contact: contact,
        vegi: vegi,
        vlees: meat
      };

      // Send JSON data to server
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "https://spaceapi.voidwarranties.be/bbq", true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.send(JSON.stringify(formData));

      // Handle response
      xhr.onload = function() {
        if (xhr.status === 200) {
          // Form submission success
          alert("Form submitted successfully!");
        } else {
          // Form submission failed
          alert("Form submission failed. Please try again.");
        }
      };
    }
  </script>
    
<form onsubmit="event.preventDefault(); submitForm();" onchange="calcTotal()">
    <i>€15 per persoon.
    Betaling kan via overschrijving op IBAN:  BE79 8918 7416 6333
Om zeker te zijn dat we eten voor je voorzien, gelieve er voor te zorgen dat je betaling ons voor 26/8 bereikt.</i><br>
    <label for="name">Reservatie naam:</label>(te vernoemen in mededeling van betaling)<br>
    <input type="text" name="name" required="" autofocus="" id="name"><br>
    <label for="email">Email adres:</label>(optioneel)<br>
    <input type="email" name="email" id="email"><br>
    <label for="contact">Bijkomende contactinformatie:</label><br>
    <textarea type="text" name="contact" rows="2" cols="50" id="contact"></textarea><br>
    <label for="meat">Aantal vlees:</label>
    <input type="number" name="meat" value="0" min="0" max="99" required="" id="meat"><br>
    <label for="vegi">Aantal vegetarisch:</label>
    <input type="number" name="vegi" value="0" min="0" max="99" required="" id="vegi"><br>
    <label for="total">Totaal:</label><br>
    <input type="number" name="total" min="0" max="99" id="total" readonly="">
    <br>
    <input type="submit" value="Inschrijven">
</form>
</div>
<div id="response">
</div>
