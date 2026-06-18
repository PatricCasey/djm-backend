const cleanJobTitle = require('../../utils/cleanJobTitle');

function parseResumeText(text) {
    const result = {
        summary: [],
        skills: [],
        experience: [],
        education: [],
        subtitle: ""
    };

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    let currentSection = null;
    let currentJob = null;
    let currentEdu = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Capture explicit SUBTITLE line from GPT output
        if (line.startsWith("SUBTITLE:")) {
            result.subtitle = cleanJobTitle(line.replace(/^SUBTITLE:\s*/, "").replace(/<<|>>/g, ""));
            continue;
        }

        // Detect section headers — use startsWith to handle "Summary:" or "Summary" with trailing text
        const lowerTrimmed = line.toLowerCase().replace(/[:\s]+$/g, "").trim();
        if (lowerTrimmed === "summary" || lowerTrimmed === "professional summary") {
            currentSection = "summary";
            currentJob = null;
            currentEdu = null;
            continue;
        }
        if (lowerTrimmed === "skills" || lowerTrimmed === "technical skills") {
            currentSection = "skills";
            currentJob = null;
            currentEdu = null;
            continue;
        }
        if (lowerTrimmed === "professional experience" || lowerTrimmed === "experience" || lowerTrimmed === "work experience") {
            currentSection = "experience";
            currentJob = null;
            currentEdu = null;
            continue;
        }
        if (lowerTrimmed === "education") {
            currentSection = "education";
            currentJob = null;
            currentEdu = null;
            continue;
        }
        if (lowerTrimmed === "certifications" || lowerTrimmed === "certification") {
            currentSection = "certifications";
            currentJob = null;
            currentEdu = null;
            continue;
        }

        // Skip certifications content entirely
        if (currentSection === "certifications") continue;

        if (currentSection === "summary") {
            result.summary.push(line);
        } else if (currentSection === "skills") {
            result.skills.push(line);
        } else if (currentSection === "experience") {
            // Structured format: COMPANY: ..., DATES: ..., DESCRIPTION: ..., TITLE: ...
            if (line.startsWith("COMPANY:")) {
                currentJob = {
                    companyAndLocation: line.replace(/^COMPANY:\s*/, "").replace(/<<|>>/g, ""),
                    dates: "",
                    description: "",
                    title: "",
                    bullets: []
                };
                result.experience.push(currentJob);
                continue;
            }
            if (line.startsWith("DATES:") && currentJob) {
                currentJob.dates = line.replace(/^DATES:\s*/, "").replace(/<<|>>/g, "");
                continue;
            }
            if (line.startsWith("DESCRIPTION:") && currentJob) {
                currentJob.description = line.replace(/^DESCRIPTION:\s*/, "").replace(/<<|>>/g, "");
                continue;
            }
            if (line.startsWith("TITLE:") && currentJob) {
                currentJob.title = line.replace(/^TITLE:\s*/, "").replace(/<<|>>/g, "");
                if (!result.subtitle) result.subtitle = cleanJobTitle(currentJob.title);
                continue;
            }

            // Fallback: old format "Title at Company (YYYY-MM – YYYY-MM)"
            const oldFmt = line.match(/^(.+?)\s+at\s+(.+?)\s*\((\d{4}-\d{2}\s*[–-]\s*\d{4}-\d{2})\)/i);
            if (oldFmt) {
                currentJob = {
                    companyAndLocation: oldFmt[2].trim().replace(/<<|>>/g, ""),
                    dates: oldFmt[3].trim(),
                    description: "",
                    title: oldFmt[1].trim().replace(/<<|>>/g, ""),
                    bullets: []
                };
                if (!result.subtitle) result.subtitle = cleanJobTitle(currentJob.title);
                result.experience.push(currentJob);
                continue;
            }

            // Bullet points
            if ((line.startsWith("-") || line.startsWith("•") || line.startsWith("●")) && currentJob) {
                currentJob.bullets.push(line.replace(/^[-•●]\s*/, ""));
            }
        } else if (currentSection === "education") {
            // Structured format: UNIVERSITY: ..., GRADUATION: ..., DEGREE: ..., COURSEWORK: ...
            if (line.startsWith("UNIVERSITY:")) {
                currentEdu = {
                    university: line.replace(/^UNIVERSITY:\s*/, "").replace(/<<|>>/g, ""),
                    graduation: "",
                    degree: "",
                    coursework: ""
                };
                result.education.push(currentEdu);
                continue;
            }
            if (line.startsWith("GRADUATION:") && currentEdu) {
                currentEdu.graduation = line.replace(/^GRADUATION:\s*/, "").replace(/<<|>>/g, "");
                continue;
            }
            if (line.startsWith("DEGREE:") && currentEdu) {
                currentEdu.degree = line.replace(/^DEGREE:\s*/, "").replace(/<<|>>/g, "");
                continue;
            }
            if (line.startsWith("COURSEWORK:") && currentEdu) {
                currentEdu.coursework = line.replace(/^COURSEWORK:\s*/, "").replace(/<<|>>/g, "");
                continue;
            }

            // Fallback: old format "Degree - University (Date)"
            const eduMatch = line.match(/^(Bachelor|Master|Associate|PhD|Doctor).+/i);
            if (eduMatch && !currentEdu) {
                currentEdu = {
                    university: "",
                    graduation: "",
                    degree: line,
                    coursework: ""
                };
                // Try to parse "Degree - University (Date)"
                const parts = line.match(/^(.+?)\s*-\s*(.+?)\s*\((.+?)\)/);
                if (parts) {
                    currentEdu.degree = parts[1].trim();
                    currentEdu.university = parts[2].trim();
                    currentEdu.graduation = parts[3].trim();
                }
                result.education.push(currentEdu);
                continue;
            }
            if (/Relevant Coursework/i.test(line) && currentEdu) {
                currentEdu.coursework = line.replace(/^Relevant Coursework[:\s]*/i, "");
                continue;
            }
        }
    }

    return result;
}

module.exports = parseResumeText;
