document.addEventListener("DOMContentLoaded", function () {
    const boardLinkInput = document.getElementById("boardLink");
    const saveBoardLinkButton = document.getElementById("saveBoardLink");
    const ticketNumberInput = document.getElementById("ticketNumber");
    const openTicketButton = document.getElementById("openTicket");
    const clearSavedProjectButton = document.getElementById("clearSavedProject");
    const addAnotherProjectButton = document.getElementById("addAnotherProject");
    const goBackButton = document.getElementById("goBack");
    const projectList = document.getElementById("projectList");
    const projectNameDisplay = document.getElementById("projectNameDisplay");
    const boardLinkLabel = document.getElementById("boardLinkLabel");
    const projectNameLabel = document.getElementById("projectNameLabel");
    const ticketNumberLabel = document.getElementById("ticketNumberLabel");
    const projectListContainer = this.getElementById("projectListContainer");
    const recentTicketsList = document.getElementById("recentTicketsList");
    const clearRecentTicketsButton = document.getElementById("clearRecentTickets");
    const mostRecentContainer = document.getElementById("mostRecentContainer");
    
    displayRecentTickets();

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
            displayErrorMessage(boardLinkInput, "Invalid board link. Please select board and copy link from the address bar");
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
        
        boardLinkLabel.classList.add("hidden");
        boardLinkInput.classList.add("hidden");
        saveBoardLinkButton.classList.add("hidden");
        goBackButton.classList.add("hidden");
        projectNameDisplay.classList.remove("hidden");
        ticketNumberInput.classList.remove("hidden");
        openTicketButton.classList.remove("hidden");
        projectNameLabel.classList.remove("hidden");
        ticketNumberLabel.classList.remove("hidden");
        clearSavedProjectButton.classList.remove("hidden");
        addAnotherProjectButton.classList.remove("hidden");
        projectListContainer.classList.remove("hidden");
        projectNameDisplay.value = projectName;
       
        chrome.storage.local.set({ lastProjectName: projectName });
    });

    addAnotherProjectButton.addEventListener("click", function() {
        boardLinkInput.value = "";
        boardLinkInput.classList.remove("hidden");
        saveBoardLinkButton.classList.remove("hidden");
        goBackButton.classList.remove("hidden");
        projectNameDisplay.classList.add("hidden");
        ticketNumberInput.classList.add("hidden");
        openTicketButton.classList.add("hidden");
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
        let userResponse = confirm("This action will remove all saved project(s)");

        if (!userResponse) {
            return;
        } 
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
        addRecentTicket(jiraUrl, projectName, ticketNumber);

        chrome.tabs.create({ url: jiraUrl });
    });

    clearRecentTicketsButton.addEventListener("click", function() {
        chrome.storage.local.set({ recentTickets: [] }, function() {
            displayRecentTickets();
        });
    });

    function addRecentTicket(jiraUrl, projectName, ticketNumber) {
        chrome.storage.local.get(["recentTickets"], function(result) {
            const recentTickets = result.recentTickets || [];
            const isDuplicate = recentTickets.some(ticket => ticket.label === `${projectName}-${ticketNumber}`);
    
            if (!isDuplicate) {
                recentTickets.unshift({ url: jiraUrl, label: `${projectName}-${ticketNumber}` });
                if (recentTickets.length > 6) recentTickets.pop();
                chrome.storage.local.set({ recentTickets }, function() {
                    displayRecentTickets();
                });
            }
        });
    }

    function displayRecentTickets() {
        chrome.storage.local.get(["recentTickets"], function(result) {
            const recentTickets = result.recentTickets || [];
            if (recentTickets.length === 0) {
                mostRecentContainer.classList.add("hidden");
            } else {
                mostRecentContainer.classList.remove("hidden");
            }
            recentTicketsList.innerHTML = '';
            for (let ticket of recentTickets) {
                const ticketLink = document.createElement("a");
                ticketLink.href = ticket.url;
                ticketLink.target = '_blank';
                ticketLink.textContent = ticket.label;
                ticketLink.className = "ticket-button"; 
                recentTicketsList.appendChild(ticketLink);
                const separator = document.createElement("br");
                recentTicketsList.appendChild(separator);
            }
        });
    }

    function displayErrorMessage(inputElement, message) {
        inputElement.classList.add("error");
        alert(message);
    }
});
