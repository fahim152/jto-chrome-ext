document.addEventListener("DOMContentLoaded", function () {
    const boardLinkInput = document.getElementById("boardLink");
    const saveBoardLinkButton = document.getElementById("saveBoardLink");
    const ticketNumberInput = document.getElementById("ticketNumber");
    const openTicketButton = document.getElementById("openTicket");
    const saveAnotherProjectButton = document.getElementById("saveAnotherProject");
    const clearSavedProjectButton = document.getElementById("clearSavedProject");
    const addAnotherProjectButton = document.getElementById("addAnotherProject");
    const goBackButton = document.getElementById("goBack");
    const projectList = document.getElementById("projectList");
    const projectNameDisplay = document.getElementById("projectNameDisplay");
    const boardLinkLabel = document.getElementById("boardLinkLabel");
    const projectNameLabel = document.getElementById("projectNameLabel");
    const ticketNumberLabel = document.getElementById("ticketNumberLabel");
    const projectListContainer = this.getElementById("projectListContainer");

    function displayErrorMessage(inputElement, message) {
        inputElement.classList.add("error");
        alert(message);
    }

    chrome.storage.local.get(["projectList", "lastProjectName"], function (result) {
        const savedProjects = result.projectList || [];
        projectList.innerHTML = savedProjects.map(project => `<option value="${project.domain}|${project.name}">${project.name}</option>`).join("");

        const lastUsedProjectName = result.lastProjectName;
        if (lastUsedProjectName) {
            projectNameDisplay.value = lastUsedProjectName;
            const projectOption = Array.from(projectList.options).find(opt => opt.text === lastUsedProjectName);
            if (projectOption) {
                projectOption.selected = true;
            }
        }

        if (savedProjects.length > 0) {
            boardLinkInput.classList.add("hidden");
            saveBoardLinkButton.classList.add("hidden");
            boardLinkLabel.classList.add("hidden");
            projectNameDisplay.classList.remove("hidden");
            ticketNumberInput.classList.remove("hidden");
            openTicketButton.classList.remove("hidden");
            clearSavedProjectButton.classList.remove("hidden");
            addAnotherProjectButton.classList.remove("hidden");
            projectNameLabel.classList.remove("hidden");
            ticketNumberLabel.classList.remove("hidden");
            projectListContainer.classList.remove("hidden");
        } else {
            projectNameLabel.classList.add("hidden");
            ticketNumberLabel.classList.add("hidden");
            projectListContainer.classList.add("hidden");
        }
    });

    projectList.addEventListener('change', function() {
        const selectedValue = projectList.value.split("|");
        const selectedProjectName = selectedValue[1];
        projectNameDisplay.value = selectedProjectName;
        chrome.storage.local.set({ lastProjectName: selectedProjectName });
    });

    saveBoardLinkButton.addEventListener("click", function () {
        const boardLink = boardLinkInput.value;
        const regex = /^https:\/\/.+\/jira\/software\/projects\/.+\/boards\/\d+$/;
        if (!regex.test(boardLink)) {
            displayErrorMessage(boardLinkInput, "Invalid board link. Please check and try again.");
            return;
        }

        const urlParts = boardLink.split('/');
        const domain = urlParts[2];
        const projectName = urlParts[6];

        const project = { name: projectName, domain: domain };
        chrome.storage.local.get(["projectList"], function (result) {
            const savedProjects = result.projectList || [];
            const projectNames = savedProjects.map(project => project.name);
            if (!projectNames.includes(projectName)) {
                savedProjects.push(project);
                chrome.storage.local.set({ projectList: savedProjects }, function() {
                    projectList.innerHTML = savedProjects.map(project => `<option value="${project.domain}|${project.name}" selected>${project.name}</option>`).join("");
                });
            }
        });
        
        boardLinkInput.classList.add("hidden");
        saveBoardLinkButton.classList.add("hidden");
        goBackButton.classList.add("hidden");
        projectNameDisplay.classList.remove("hidden");
        ticketNumberInput.classList.remove("hidden");
        openTicketButton.classList.remove("hidden");
        clearSavedProjectButton.classList.remove("hidden");
        addAnotherProjectButton.classList.remove("hidden");
        projectListContainer.classList.remove("hidden");
        projectNameDisplay.value = projectName;
       
        chrome.storage.local.set({ lastProjectName: projectName });
    });

    saveAnotherProjectButton.addEventListener("click", function () {
        boardLinkInput.value = "";
        boardLinkInput.classList.remove("hidden");
        saveBoardLinkButton.classList.remove("hidden");
        goBackButton.classList.remove("hidden");
        projectNameDisplay.classList.add("hidden");
        ticketNumberInput.classList.add("hidden");
        openTicketButton.classList.add("hidden");
        saveAnotherProjectButton.classList.add("hidden");
        addAnotherProjectButton.classList.add("hidden");
        clearSavedProjectButton.classList.add("hidden");
    });

    addAnotherProjectButton.addEventListener("click", function() {
        boardLinkInput.value = "";
        boardLinkInput.classList.remove("hidden");
        saveBoardLinkButton.classList.remove("hidden");
        goBackButton.classList.remove("hidden");
        projectNameDisplay.classList.add("hidden");
        ticketNumberInput.classList.add("hidden");
        openTicketButton.classList.add("hidden");
        saveAnotherProjectButton.classList.add("hidden");
        addAnotherProjectButton.classList.add("hidden");
        clearSavedProjectButton.classList.add("hidden");
        projectNameLabel.classList.add("hidden");
        ticketNumberLabel.classList.add("hidden");
        
    });

    goBackButton.addEventListener("click", function() {
        boardLinkInput.classList.add("hidden");
        saveBoardLinkButton.classList.add("hidden");
        goBackButton.classList.add("hidden");
        projectNameDisplay.classList.remove("hidden");
        ticketNumberInput.classList.remove("hidden");
        openTicketButton.classList.remove("hidden");
        clearSavedProjectButton.classList.remove("hidden");
        addAnotherProjectButton.classList.remove("hidden");
        projectNameLabel.classList.add("hidden");
        ticketNumberLabel.classList.add("hidden");
    });

    clearSavedProjectButton.addEventListener("click", function () {
        chrome.storage.local.set({ projectList: [] }, function() {
            projectList.innerHTML = "";
            projectNameDisplay.value = "";
            boardLinkInput.classList.remove("hidden");
            saveBoardLinkButton.classList.remove("hidden");
            projectNameDisplay.classList.add("hidden");
            ticketNumberInput.classList.add("hidden");
            openTicketButton.classList.add("hidden");
            clearSavedProjectButton.classList.add("hidden");
            addAnotherProjectButton.classList.add("hidden");
            projectNameLabel.classList.add("hidden");
            ticketNumberLabel.classList.add("hidden");
            projectListContainer.classList.add("hidden");
        });
    });

    openTicketButton.addEventListener("click", function () {
        const ticketNumber = ticketNumberInput.value;
        if (!ticketNumber || isNaN(ticketNumber)) {
            displayErrorMessage(ticketNumberInput, "Invalid ticket number. Please enter a valid number.");
            return;
        }

        const selectedValue = projectList.value.split("|");
        const projectDomain = selectedValue[0];
        const projectName = projectNameDisplay.value;

        const jiraUrl = `https://${projectDomain}/browse/${projectName}-${ticketNumber}`;
        chrome.tabs.create({ url: jiraUrl });
    });
});
