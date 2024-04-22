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

// soc_assigned page

function goToSoc1() {
    window.location.href = "employee_create.html";
}

function goToSoc2() {
    window.location.href = "employee_create.html";
}

function goToSoc3() {
    window.location.href = "employee_create.html";
}

// employee_create page

function goToBallot() {
    window.location.href = "create_ballot.html";
}

function goToBallotInitiative() {
    window.location.href = "create_ballotinit.html";
}

// create_ballot page

function goToCreateBallot() {
    window.location.href = "ballot_info.html";
}

function goToEditBallot() {
    window.location.href = "";
}

function goToCreateInitBallot() {
    window.location.href = "ballotinit_info.html";
}

function goToElectionResults() {
    window.location.href = "election_results_employee.html";
}