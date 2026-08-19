const projectSelect = document.getElementById("projectSelect");
const verifyBtn = document.getElementById("verifyBtn");

const projectId = document.getElementById("projectId");
const developer = document.getElementById("developer");
const area = document.getElementById("area");
const credits = document.getElementById("credits");

const evidenceLat = document.getElementById("evidenceLat");
const evidenceLon = document.getElementById("evidenceLon");
const inSituGpp = document.getElementById("inSituGpp");
const edGpp = document.getElementById("edGpp");

const riskScore = document.getElementById("riskScore");
const riskStatus = document.getElementById("riskStatus");
const riskFill = document.getElementById("riskFill");
const riskDescription = document.getElementById("riskDescription");

const findingsContainer = document.getElementById("findings");

const hash1 = document.getElementById("hash1");
const hash2 = document.getElementById("hash2");
const hash3 = document.getElementById("hash3");

const blockStatus = document.getElementById("blockStatus");
const projectsFlagged = document.getElementById("projectsFlagged");

let flagged = 0;

function getRecord() {
    const index = Number(projectSelect.value);
    return carbonGlobeData[index];
}

function loadProject() {
    const index = Number(projectSelect.value);
    const evidence = carbonGlobeData[index];

    projectId.value = `CV-EVID-${String(index + 1).padStart(3, "0")}`;
    developer.value = "Carbon Project Registry";
    area.value = `${1000 + index * 125} hectares`;
    credits.value = `${12000 + index * 850} tCO₂e`;

    evidenceLat.value = evidence.latitude;
    evidenceLon.value = evidence.longitude;
    inSituGpp.value = evidence.inSituGpp.toFixed(2);
    edGpp.value = evidence.edGpp.toFixed(2);

    riskScore.textContent = "--";
    riskStatus.textContent = "Awaiting Verification";
    riskStatus.className = "risk-status neutral";

    riskFill.style.width = "0%";

    riskDescription.textContent =
        "Select an evidence record and begin independent verification.";

    findingsContainer.innerHTML = `
        <div class="empty-state">
            <span>◌</span>
            <p>Environmental evidence will appear here.</p>
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

function calculateRisk(evidence) {
    const difference = Math.abs(
        evidence.inSituGpp - evidence.edGpp
    );

    const percentageDifference =
        (difference / evidence.inSituGpp) * 100;

    let risk = Math.round(percentageDifference * 5);

    if (percentageDifference > 8) {
        risk += 20;
    }

    if (percentageDifference > 15) {
        risk += 25;
    }

    risk = Math.min(100, risk);

    return {
        difference,
        percentageDifference,
        risk
    };
}

function createBlockHashes(evidence, result) {
    const first = simpleHash(
        `${evidence.latitude}|${evidence.longitude}|${evidence.date}`
    );

    const second = simpleHash(
        `${first}|${evidence.inSituGpp}|${evidence.edGpp}`
    );

    const third = simpleHash(
        `${second}|${result.risk}|${result.percentageDifference.toFixed(2)}`
    );

    hash1.textContent = "0x" + first;
    hash2.textContent = "0x" + second;
    hash3.textContent = "0x" + third;
}

function displayFindings(evidence, result) {
    const findings = [];

    findings.push([
        "pass",
        "✓",
        "Environmental coordinates found",
        `${evidence.latitude}, ${evidence.longitude}`
    ]);

    if (result.percentageDifference < 10) {
        findings.push([
            "pass",
            "✓",
            "Carbon evidence consistent",
            `GPP difference: ${result.percentageDifference.toFixed(1)}%`
        ]);
    } else {
        findings.push([
            "danger",
            "!",
            "Carbon evidence mismatch",
            `GPP difference: ${result.percentageDifference.toFixed(1)}%`
        ]);
    }

    if (result.risk <= 30) {
        findings.push([
            "pass",
            "✓",
            "Low environmental risk",
            "Independent evidence is broadly consistent."
        ]);
    } else if (result.risk <= 60) {
        findings.push([
            "warning",
            "!",
            "Review recommended",
            "Environmental evidence shows moderate inconsistency."
        ]);
    } else {
        findings.push([
            "danger",
            "!",
            "High-risk evidence signal",
            "Independent evidence shows significant inconsistency."
        ]);
    }

    findings.push([
        "pass",
        "✓",
        "Evidence hash generated",
        "Verification evidence linked to audit record."
    ]);

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

function updateRisk(result) {
    const risk = result.risk;

    riskScore.textContent = risk;

    if (risk <= 30) {
        riskStatus.textContent = "VERIFIED";
        riskStatus.className = "risk-status low";
        riskFill.style.background = "var(--green)";

        riskDescription.textContent =
            "Environmental evidence is broadly consistent with the submitted project.";
    } else if (risk <= 60) {
        riskStatus.textContent = "REVIEW REQUIRED";
        riskStatus.className = "risk-status medium";
        riskFill.style.background = "var(--yellow)";

        riskDescription.textContent =
            "Environmental evidence requires additional investigation.";
    } else {
        riskStatus.textContent = "FLAGGED";
        riskStatus.className = "risk-status high";
        riskFill.style.background = "var(--red)";

        riskDescription.textContent =
            "Independent environmental evidence indicates elevated project risk.";
    }

    riskFill.style.width = `${risk}%`;
}

function verifyProject() {
    const evidence = getRecord();

    verifyBtn.disabled = true;
    verifyBtn.innerHTML = "Analyzing Evidence...";

    findingsContainer.innerHTML = `
        <div class="empty-state">
            <span>◌</span>
            <p>Cross-checking environmental evidence...</p>
        </div>
    `;

    setTimeout(() => {
        const result = calculateRisk(evidence);

        updateRisk(result);
        displayFindings(evidence, result);
        createBlockHashes(evidence, result);

        blockStatus.textContent =
            result.risk <= 30
                ? "Verification accepted"
                : "Verification flagged";

        if (result.risk > 60) {
            flagged++;
        }

        projectsFlagged.textContent = flagged;

        verifyBtn.disabled = false;
        verifyBtn.innerHTML = "Verify Again <span>→</span>";
    }, 900);
}

projectSelect.addEventListener("change", loadProject);
verifyBtn.addEventListener("click", verifyProject);

loadProject();