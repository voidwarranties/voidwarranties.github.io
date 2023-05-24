<h2 id="BBQ">Inschrijvingen BBQ '23</h2>
<div id="BBQform"><script>
	// update total
    function calcTotal() {
      var prijsPerPersoon = 15;
      var aantalVleeseters = parseInt(document.getElementById("meat").value);
        //console.log("vlees: " + aantalVleeseters);
      var aantalVegetariers = parseInt(document.getElementById("vegi").value);
        //console.log("vegi: " + aantalVegetariers);
      var totaalAantal = aantalVleeseters + aantalVegetariers;
        //console.log("totaal: " + totaalAantal);
      var totaalPrijs = totaalAantal * prijsPerPersoon;
      document.getElementById("total").value = totaalAantal + " (€" + totaalPrijs + ")";
        console.log("total: " + totaalAantal + " (€" + totaalPrijs + ")");
	if(totaalAantal > 0) {
		document.getElementById("submit").disabled = false;
	} else {
		document.getElementById("submit").disabled = true;
	}
    }
	function submitForm() {
      // Get form data
      var name = document.getElementById("name").value;
      var email = document.getElementById("email").value;
      var contact = document.getElementById("contact").value;
      var vegi = parseInt(document.getElementById("vegi").value);
      var vlees = parseInt(document.getElementById("meat").value);

      // Create JSON object
      var formData = {
        naam: name,
        email: email,
        contact: contact,
        vegi: vegi,
        vlees: vlees
      };

      // Send JSON data to server
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "https://spaceapi.voidwarranties.be/bbq", true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      if( (vegi+vlees) > 0 ) xhr.send(JSON.stringify(formData));

      // Handle response
      xhr.onload = function() {
        if (xhr.status === 200) {
          // Form submission success
          alert("Form submitted successfully!");
        } else if (xhr.status === 201) {
          // Form submission success
          alert("Form submitted successfully!");
	  console.log(xhr);
        } else {
          // Form submission failed
          alert("Form submission failed. Please try again.");
        }
      };
    }
  </script>
    
<form onsubmit="event.preventDefault(); submitForm();" onchange="calcTotal()">
    <i>€15 per persoon.<br>
    Betaling kan via overschrijving op IBAN:  BE79 8918 7416 6333
Om zeker te zijn dat we eten voor je voorzien, gelieve er voor te zorgen dat je betaling ons voor 26/8 bereikt.</i><br>
    <label for="name">Reservatie naam:</label><br>
    <input type="text" name="name" required="" autofocus="" placeholder="H4CK3R" id="name">
    <span class="error-message">Verplicht! (te vernoemen in mededeling van betaling)</span>
    <label for="email">Email adres:</label>(optioneel)<br>
    <input type="email" name="email" id="email" pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}">
    <span class="error-message">Ongeldig e-mailadres</span>
    <label for="contact">Bijkomende informatie:</label><br>
    <textarea type="text" name="contact" rows="2" cols="50" id="contact" style="width: 282px; height: 47px;"></textarea><br>
    <label for="meat">Aantal vlees:</label>
    <input type="number" name="meat" value="0" min="0" max="99" required="" id="meat"><br>
    <label for="vegi">Aantal vegetarisch:</label>
    <input type="number" name="vegi" value="0" min="0" max="99" required="" id="vegi"><br>
    <label for="total">Totaal:</label><br>
    <input type="text" name="total" id="total" placeholder="0 (€0)" disabled>
    <br>
    <input type="submit" value="Inschrijven" id="submit" disabled>
</form>
</div>
<div id="response">
</div>
