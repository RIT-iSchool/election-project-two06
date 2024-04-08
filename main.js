function sortCandidates() {
    var order = document.getElementById("orderSelect").value;
    var optionsContainer = document.getElementById("presidentOptions");
    var options = optionsContainer.querySelectorAll(".option");

    var sortedOptions = Array.from(options).sort(function(a, b) {
        var nameA = a.querySelector(".option-name").innerText;
        var nameB = b.querySelector(".option-name").innerText;

        if (order === "ascending") {
            return nameA.localeCompare(nameB);
        } else {
            return nameB.localeCompare(nameA);
        }
    });

    optionsContainer.innerHTML = "";
    sortedOptions.forEach(function(option) {
        optionsContainer.appendChild(option);
    });
}

function goToBallotInitiatives() {
    window.location.href = "ballot_initiatives.html";
}

function goToPresidentPage() {
    window.location.href = "president.html";
}

function goToVicePresidentPage() {
    window.location.href = "vice-president.html";
}
