const projects = {
    clean: {
        name: "Green Valley Reforestation",
        id: "CV-2026-001",
        developer: "Green Valley Carbon Ltd.",
        area: "2,450 hectares",
        credits: "18,500 tCO₂e",
        risk: 12,
        status: "VERIFIED",
        description: "Low-risk project. Independent checks show strong consistency across submitted project information.",
        findings: [
            ["pass", "✓", "Project identity verified", "Registration data matches submitted records."],
            ["pass", "✓", "Credit quantity consistent", "Claimed credits are within the declared project capacity."],
            ["pass", "✓", "Spatial boundary verified", "No significant overlap with registered projects detected."],
            ["pass", "✓", "Project hash integrity verified", "Submitted project data has a valid verification hash."]
        ]
    },

    risky: {
        name: "Amazon Forest Restoration",
        id: "CV-2026-047",
        developer: "Amazonia Green Projects",
        area: "8,700 hectares",
        credits: "96,000 tCO₂e",
        risk: 78,
        status: "FLAGGED",
        description: "High-risk project. Multiple verification signals indicate inconsistencies requiring further investigation.",
        findings: [
            ["pass", "✓", "Project identity verified", "Project registration information is structurally valid."],
            ["danger", "!", "Spatial overlap detected", "18% of the claimed boundary overlaps another project."],
            ["warning", "!", "Credit quantity requires review", "Claimed issuance is unusually high relative to the project area."],
            ["danger", "!", "Independent evidence mismatch", "External verification signals conflict with submitted claims."]
        ]
    }
};

const projectSelect = document.getElementById("projectSelect");
const verifyBtn = document.getElementById("verifyBtn");

const projectId = document.getElementById("projectId");
const developer = document.getElementById("developer");
const area = document.getElementById("area");
const credits = document.getElementById("credits");

const riskScore = document.getElementById("riskScore");
const riskStatus = document.getElementById("riskStatus");
const riskFill = document.getElementById("riskFill");
const riskDescription = document.getElementById("riskDescription");

const findingsContainer = document.getElementById("findings");

const hash1 = document.getElementById("hash1");
const hash2 = document.getElementById("hash2");
const hash3 = document.getElementById("hash3");

const blockStatus = document.getElementById("blockStatus");

const projectsChecked = document.getElementById("projectsChecked");
const projectsFlagged = document.getElementById("projectsFlagged");

let checked = 0;
let flagged = 0;

function loadProject() {
    const project = projects[projectSelect.value];

    projectId.value = project.id;
    developer.value = project.developer;
    area.value = project.area;
    credits.value = project.credits;

    riskScore.textContent = "--";
    riskStatus.textContent = "Awaiting Verification";
    riskStatus.className = "risk-status neutral";

    riskFill.style.width = "0%";
    riskDescription.textContent = "Submit a project to begin independent verification.";

    findingsContainer.innerHTML = `
        <div class="empty-state">
            <span>◌</span>
            <p>Verification findings will appear here.</p>
        </div>
    `;

    hash1.textContent = "Waiting...";
    hash2.textContent = "Waiting...";
    hash3.textContent = "Waiting...";
    blockStatus.textContent = "Awaiting result";
}

function simpleHash(text) {
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }

    return Math.abs(hash).toString(16).padStart(8, "0") +
        Math.abs(hash * 31).toString(16).padStart(8, "0");
}

function createBlockHashes(project) {
    const first = simpleHash(
        project.id +
        project.name +
        project.developer
    );

    const second = simpleHash(
        first +
        project.area +
        project.credits
    );

    const third = simpleHash(
        second +
        project.risk +
        project.status
    );

    hash1.textContent = "0x" + first;
    hash2.textContent = "0x" + second;
    hash3.textContent = "0x" + third;
}

function displayFindings(findings) {
    findingsContainer.innerHTML = "";

    findings.forEach(finding => {
        const [type, icon, title, description] = finding;

        const element = document.createElement("div");

        element.className = `finding ${type}`;

        element.innerHTML = `
            <div class="finding-icon">${icon}</div>
            <div>
                <strong>${title}</strong>
                <span>${description}</span>
            </div>
        `;

        findingsContainer.appendChild(element);
    });
}

function updateRisk(project) {
    riskScore.textContent = project.risk;

    if (project.risk <= 30) {
        riskStatus.textContent = project.status;
        riskStatus.className = "risk-status low";
        riskFill.style.background = "var(--green)";
    } else if (project.risk <= 60) {
        riskStatus.textContent = "REVIEW REQUIRED";
        riskStatus.className = "risk-status medium";
        riskFill.style.background = "var(--yellow)";
    } else {
        riskStatus.textContent = project.status;
        riskStatus.className = "risk-status high";
        riskFill.style.background = "var(--red)";
    }

    riskFill.style.width = `${project.risk}%`;
    riskDescription.textContent = project.description;
}

function verifyProject() {
    const project = projects[projectSelect.value];

    verifyBtn.disabled = true;
    verifyBtn.innerHTML = "Verifying...";

    findingsContainer.innerHTML = `
        <div class="empty-state">
            <span>◌</span>
            <p>Cross-checking project evidence...</p>
        </div>
    `;

    setTimeout(() => {
        updateRisk(project);
        displayFindings(project.findings);
        createBlockHashes(project);

        blockStatus.textContent =
            project.status === "VERIFIED"
                ? "Verification accepted"
                : "Verification flagged";

        checked++;

        if (project.status === "FLAGGED") {
            flagged++;
        }

        projectsChecked.textContent = checked;
        projectsFlagged.textContent = flagged;

        verifyBtn.disabled = false;
        verifyBtn.innerHTML = "Verify Again <span>→</span>";
    }, 900);
}

projectSelect.addEventListener("change", loadProject);
verifyBtn.addEventListener("click", verifyProject);

loadProject();