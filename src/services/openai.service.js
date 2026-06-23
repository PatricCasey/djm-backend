const axios = require('axios');
const { CHATGPT_API_KEY } = require('../config');

function buildPrompt(jobDesc, companiesText, educationText) {
    return `
        Please make resume with perfect match with "${jobDesc}".

        CRITICAL — Job title and seniority matching:
        - Read the job description carefully. Identify the core job role and seniority level.
        - The FIRST line of your output must be: SUBTITLE: <a realistic, clean job title based on the job description>
        - IMPORTANT: The SUBTITLE and TITLE fields must be realistic job titles that a real company would use. Strip out any internal level codes (like "L5", "L6", "IC4", "P3"), team/department names (like "- Messaging", "- Platform", "- Growth"), and company-specific jargon. For example:
          * JD says "Data Engineer (L5) - Messaging" → use "Senior Data Engineer"
          * JD says "Software Engineer II - Payments" → use "Software Engineer"
          * JD says "Staff SWE, Infrastructure" → use "Staff Software Engineer"
          * JD says "Frontend Engineer (L4) - Growth" → use "Frontend Engineer"
          Keep only the standard industry job title that would appear on LinkedIn or a real offer letter.
        - The Summary must match the seniority level. If the job says "Junior", do NOT say "9 years of experience as a senior engineer". Instead say something appropriate like "A motivated developer with hands-on experience in..." matching the tone and level of the job description.
        - For TITLE in each company: make each job title closely related to the job description role. Use variations that show career progression toward that role. For example if the job is for a Senior Data Engineer, use titles like "Senior Data Engineer", "Data Engineer", "Junior Data Engineer", "Data Analyst" — NOT "Senior Architect" or "Lead Platform Engineer". The most recent company title should be the closest match to the target role. NEVER include level codes, team names, or internal designations in any TITLE field.

        Using the style of professional resume (clear headers, concise summary, bullet-pointed achievements with quantified results), generate a complete resume for this candidate.
        Format requirements:
        - Clear section headers: Summary, Skills, Professional Experience, Education.
        - Do NOT include a Certifications section at all.
        - Skills: Organize into 4-6 categories that make sense for THIS specific job. Choose category names that logically group the skills required in the job description. Each category label must accurately describe its contents — do NOT force unrelated skills into a mismatched category.
          Rules for skill categories:
          1. Read the job description and identify the major skill areas it requires.
          2. Create category names that genuinely fit those areas (e.g., for a Jira consultant role use "Project Management Tools", "Scripting & Automation", "Data Management" — NOT "Cloud, DevOps & Tools").
          3. Every skill listed under a category must logically belong there. "Microsoft Office Suite" is NOT a Cloud/DevOps tool. "API integrations" is NOT a Cloud/DevOps tool.
          4. Only list actual technologies, tools, platforms, languages, and frameworks — not vague concepts like "Data structures" or "Information Technology".
          5. Include all relevant technologies mentioned in the job description.
          Format: one category per line as "Category Name: skill1, skill2, skill3"
        Do NOT use markdown, asterisks, or special characters like ** or ##. Use plain text only.
        Do NOT include placeholder lines like [Candidate's Name] or [Phone Number].
        Remove all blank lines between skill categories.

        Writing style:
        - Use clear, professional language with easy-to-read sentences.
        - Avoid using asterisks (*) or markdown symbols; use plain text.
        - Focus on achievements, impact, and technical depth to attract client's focus.
        - SPELLING & GRAMMAR: Your output must be 100% free of spelling errors, grammatical mistakes, and typos. Double-check every word before finalizing. Use correct verb tenses (past tense for previous roles, present tense only for current role). Ensure subject-verb agreement, correct prepositions, and proper punctuation throughout. Common mistakes to avoid: "it's" vs "its", "effect" vs "affect", "insure" vs "ensure", run-on sentences, comma splices, and sentence fragments.
        - IMPACT-FIRST writing: Every bullet and every sentence in the Summary must demonstrate measurable impact. Do NOT describe what you were "responsible for" — describe what you ACHIEVED and the result. Recruiters scan for impact numbers within the first 3 words after the verb. Structure: [Verb] [thing] → [result with number]. Example: "Reduced API response time from 4s to 200ms by refactoring query logic and adding <<Redis>> caching layer, serving 15K daily active users."
        - Do NOT use any percentage numbers like "30 percent", "20 percent", "by 40%", "by 25%". Senior engineers describe impact with absolute numbers instead (e.g., "from 12s to 800ms", "processing 3M records daily", "across 40 microservices", "serving 10K concurrent users"). Use counts, durations, throughputs, or scale — never percentages.
        - Every bullet MUST mention specific technologies, tools, or frameworks by name.
        - Every bullet MUST include a measurable outcome with absolute numbers (not percentages).
        - Write like a senior engineer describing real project work, not generic responsibilities.
        - IMPORTANT: In the Summary section AND in bullet points, wrap every technical keyword (technology name, framework, tool, protocol, service name, language) inside double angle brackets like <<Kafka>>, <<React>>, <<PostgreSQL>>, <<Kubernetes>>, <<REST API>>, <<CI/CD>>. This is used for formatting only. Example: "Built a streaming pipeline with <<Apache Kafka>> and <<Spark Structured Streaming>>, processing 3M events daily."
        - Do NOT use <<>> in the SUBTITLE, COMPANY, DATES, DESCRIPTION, or TITLE fields. Only use <<>> inside the Summary text and the dash (-) bullet point lines.

        CRITICAL — Avoid buzzwords and repetition:
        - Do NOT use these overused cliché words/phrases ANYWHERE in the resume (Summary, bullets, descriptions — nowhere): "synergy", "leverage", "utilize", "spearheaded", "dynamic", "innovative", "cutting-edge", "best-in-class", "robust", "scalable solutions", "strategic", "proactive", "fast-paced environment", "go-to person", "think outside the box", "team player", "results-driven", "self-starter", "detail-oriented", "passion", "thrive", "adept at", "proven track record", "presentation skills", "strong communication skills", "highly skilled", "extensive experience", "seasoned professional", "committed to", "dedicated to", "responsible for", "in charge of", "various", "numerous", "several projects", "advanced knowledge", "expert in".
        - The Summary must contain ZERO vague phrases. Every sentence must state a specific technology, a concrete number, or a measurable domain scope — never generic self-descriptions like "proven track record" or "adept at problem-solving".
        - Instead use direct, concrete language. Say exactly what you did and what happened.
        - ABSOLUTE RULE — ZERO repeated action verbs: Every single bullet point across the ENTIRE resume must start with a UNIQUE action verb. No verb may appear more than ONCE in the entire document — not even across different companies. Before writing each bullet, check every previous bullet to make sure you have not already used that verb.
        - BANNED frequently-overused verbs (do NOT use these AT ALL): "Enhanced", "Improved", "Contributed", "Managed", "Assisted", "Helped", "Worked", "Handled", "Supported", "Utilized", "Developed". These are weak, generic verbs that ATS scanners and resume reviewers penalize.
        - Instead, use strong, specific action verbs. Here is a bank of 50+ verbs — pick each one ONLY ONCE:
          Architected, Engineered, Constructed, Formulated, Created, Configured, Established, Assembled, Deployed, Orchestrated, Migrated, Automated, Redesigned, Refactored, Streamlined, Consolidated, Integrated, Pioneered, Implemented, Executed, Transformed, Accelerated, Parallelized, Optimized, Eliminated, Reduced, Resolved, Diagnosed, Overhauled, Modernized, Decoupled, Provisioned, Instrumented, Benchmarked, Standardized, Documented, Authored, Directed, Mentored, Coordinated, Negotiated, Presented, Delivered, Launched, Scaled, Built, Programmed, Coded, Prototyped, Containerized, Virtualized, Partitioned, Indexed, Normalized, Catalogued, Secured, Hardened, Audited, Monitored, Tested, Validated, Certified.
        - NEVER repeat the same phrase or sentence structure more than once. Vary sentence length and pattern.
        - Do NOT start more than one bullet with the same word across all companies combined.
        - In the Summary, avoid generic filler phrases. Every sentence must state a concrete skill, domain, or accomplishment.

        CRITICAL — Strong accomplishment-driven bullets with HARD DATA:
        - Hiring managers at the senior level look for hard data above everything else. Every bullet MUST contain at least one concrete number. Not vague words like "significantly" or "greatly" — actual numbers.
        - Every bullet must follow this formula: [Action verb] + [what you built/did] + [with what technology] + [measurable result with a number].
        - Types of hard data to include: record counts (3M rows, 500K events/day), latency (from 12s to 800ms), user counts (serving 10K concurrent users), system scale (across 40 microservices, 15 data sources), time saved (reduced from 3 hours to 10 minutes), team/project scope (led team of 6, across 4 squads), SLA targets (99.9% uptime), data volume (processing 2TB daily), infrastructure (deployed to 8-node cluster).
        - BAD (no data): "Managed data pipelines" or "Contributed to system improvements" or "Improved system performance significantly"
        - GOOD (hard data): "Architected a real-time ingestion pipeline using <<Apache Kafka>> and <<Spark Structured Streaming>>, processing 5M events daily across 12 partitioned topics with sub-second latency"
        - BAD (vague): "Enhanced data quality across the organization"
        - GOOD (specific): "Built an automated data validation framework using <<Great Expectations>> and <<Python>>, catching 150+ schema violations per week across 30 production tables"
        - Every role must demonstrate IMPACT. For senior roles: show leadership, architecture decisions, scale. For mid roles: show ownership, technical depth, team contributions. For junior roles: show learning speed, hands-on delivery, initiative.
        - Each company section should read as a compelling narrative of accomplishments — not a list of generic duties or responsibilities.

        ATS (Applicant Tracking System) Optimization — this resume WILL be scored by AI resume scanners. You MUST maximize keyword match score:

        STEP 1 — Keyword extraction (do this mentally before writing):
        Read the entire job description and extract EVERY keyword, phrase, and term into these categories:
        a) Job title variations (e.g., "Software Engineer", "SWE", "Developer")
        b) Hard skills & technologies (e.g., "Python", "AWS", "Docker", "Kubernetes")
        c) Methodologies & processes (e.g., "Agile", "Scrum", "Kanban", "SDLC", "DevOps", "TDD", "BDD", "CI/CD")
        d) Domain/industry terms (e.g., "data pipeline", "ETL", "microservices", "cloud migration", "distributed systems", "machine learning")
        e) Certifications & standards mentioned (e.g., "AWS Certified", "ISO 27001", "SOC 2", "PCI DSS", "HIPAA")
        f) Soft skill phrases the JD uses (e.g., "cross-functional collaboration", "stakeholder communication", "technical mentorship", "code review")
        g) Business context terms (e.g., "SaaS", "B2B", "e-commerce", "fintech", "healthcare", "supply chain")
        h) Action/responsibility phrases (e.g., "troubleshoot", "root cause analysis", "capacity planning", "incident response", "performance tuning")

        STEP 2 — Keyword placement rules:
        - Use a realistic, clean version of the job title (without internal level codes, team names, or company-specific jargon) in the SUBTITLE and the most recent company TITLE.
        - EVERY keyword from categories (a) through (h) must appear at least ONCE somewhere in the resume — in Summary, Skills, bullet points, or company descriptions.
        - Use the EXACT phrasing from the job description. If the JD says "RESTful APIs", write "RESTful APIs" — not "REST services" or "API development". If the JD says "cross-functional teams", write "cross-functional teams" — not "working with other teams".
        - Include both the spelled-out form AND abbreviation where applicable (e.g., "Continuous Integration/Continuous Deployment (CI/CD)", "Amazon Web Services (AWS)", "Software Development Life Cycle (SDLC)").
        - Front-load the most important keywords in the Summary (first 2-3 sentences). The Summary should contain at least 60% of the JD's key terms.
        - In Skills, list every technology, tool, methodology, framework, and platform mentioned in the job description. Also include closely related industry-standard tools that someone in this role would use, even if not explicitly listed.
        - Distribute keywords across ALL sections — do not cluster them only in Skills. Bullet points should naturally embed 2-4 JD keywords each.
        - Use standard section headers: Summary, Skills, Professional Experience, Education.

        STEP 3 — Industry keyword coverage:
        - Beyond what the JD explicitly lists, include standard industry keywords that hiring managers in this field expect. For example, a backend engineer role should mention "API design", "database optimization", "system design", "load balancing", "caching", "logging and monitoring" even if the JD doesn't spell out every one.
        - If the JD mentions a cloud provider (AWS/Azure/GCP), include 3-5 specific services from that provider in your bullets (e.g., for AWS: "EC2", "S3", "Lambda", "RDS", "CloudWatch").
        - If the JD mentions "Agile" or "Scrum", reference sprint planning, retrospectives, or iterative development in at least one bullet.
        - If the JD mentions collaboration or leadership, include bullets about code reviews, mentoring junior developers, or leading technical discussions.

        Summary:
        Write 4-6 impactful sentences. Match the tone to the job description seniority:
        - If the job is senior/staff level: mention years of experience (use the number 9) and deep expertise.
        - If the job is mid-level: mention solid experience and growing expertise.
        - If the job is junior/entry level: focus on enthusiasm, hands-on skills, and foundational knowledge — do NOT mention "9 years of experience" for a junior role.
        Always mention the specific tech skills required in the job description.
        Wrap technical keywords in <<>> in the Summary too, e.g., "Experienced in <<Python>>, <<Jira>>, and <<REST API>> integrations."

        Skills:

        Professional Experience:
        For each company, use this EXACT structured format (one field per line):
        COMPANY: Company Name, Remote
        DATES: Month YYYY – Month YYYY (e.g., "February 2024 – January 2026", "March 2019 – May 2022". Always use full month name, NOT numeric format like "2024-02")
        DESCRIPTION: One-sentence company description that highlights work relevant to the job description. Frame the company's work using keywords and domain language from the job posting. For example, if the job is about "data engineering", describe the company as "A technology firm specializing in enterprise data platform solutions and cloud-based analytics infrastructure" — not just "A software company". Make it sound like every company the candidate worked at was doing work closely related to the target job.
        TITLE: Detailed Job Title
        - bullet point 1
        - bullet point 2
        ...
        IMPORTANT: For the COMPANY field, always use the company name followed by "Remote" — do NOT use City or State. Example: "COMPANY: Cibirix, Remote"

        MANDATORY bullet count per role — you MUST meet these minimums or the output is invalid:
        - Most recent company (latest dates): MINIMUM 10 bullet points, ideally 12. Do NOT write fewer than 10.
        - Second most recent company: MINIMUM 8 bullet points, ideally 10. Do NOT write fewer than 8.
        - Third company: MINIMUM 6 bullet points. Do NOT write fewer than 6.
        - Fourth and older companies: MINIMUM 4 bullet points.
        Count your bullets for each company before moving to the next. If a company has fewer than the minimum, add more bullets before proceeding.
        This is the most important formatting rule — recruiters judge experience depth by bullet count.

        Write bullet points for each role. Each bullet MUST:
        1. Start with a strong action verb (Architected, Engineered, Optimized, Orchestrated, Migrated, Automated, Implemented, Redesigned, Built, Constructed, Configured, Established, Formulated, Consolidated, Refactored, Streamlined, Integrated, Deployed).
        2. Name specific technologies wrapped in <<>> (e.g., "using <<Kafka>>, <<Spark>>, and <<Airflow>>").
        3. Describe the technical problem or project scope concretely (e.g., "real-time event streaming pipeline processing 5M events per day" not just "data pipeline").
        4. End with a measurable result using absolute numbers — NEVER percentages. Use counts, durations, throughput, or scale (e.g., "reducing query time from 12s to 800ms", "serving 10K concurrent users", "across 40 microservices").
        Do NOT write vague bullets like "Improved system performance" — always specify what system, what technology, and what measurable result.
        ABSOLUTE RULE: The resume must contain ZERO percentages. No "40%", no "25 percent", no "by 50%", no "increase of 30%". If you catch yourself writing a percentage, replace it with an absolute number (e.g., instead of "improved speed by 40%" write "improved speed from 5s to 800ms"). Scan your entire output and remove every single percentage before finishing.

        Example of GOOD bullets:
        - Architected a real-time data ingestion pipeline using <<Apache Kafka>> and <<Spark Structured Streaming>>, processing 3M events daily with sub-second latency across 12 partitioned topics.
        - Migrated 15 legacy monolithic <<ETL>> workflows to <<Apache Airflow>> DAGs on <<AWS MWAA>>, cutting pipeline recovery time from 3 hours to under 10 minutes.
        - Built a medallion architecture (Bronze/Silver/Gold) in <<Microsoft Fabric>> Lakehouse, enabling self-service analytics for 50 business users and reducing report generation from 4 hours to 15 minutes.

        CRITICAL — Company names: Below is the ONLY list of companies you may use. You MUST use the EXACT company names as written — do NOT rename, replace, or substitute them with the company from the job description or any other name. If a company name is a single letter like "A", "B", or "C", you MUST write exactly that letter. For example if the company is "C", write "COMPANY: C, Remote" — do NOT change it to "MoviePass", "Google", or any other name. This rule is absolute and non-negotiable.

        ${companiesText}

        Please show experience sorted by latest company.

        Education:
        For each degree, use this EXACT structured format (one field per line):
        UNIVERSITY: University Name, City, State
        GRADUATION: Month YYYY
        DEGREE: Full degree name (e.g., Bachelor of Science in Computer Science)
        COURSEWORK: course1 • course2 • course3

        ${educationText}
        `;
}

async function generateResumeText(jobDesc, user) {
    const educationText = user.education
        ? Object.entries(user.education)
            .map(([type, degree]) =>
                `Degree: ${type.charAt(0).toUpperCase() + type.slice(1)}
Institution: ${degree.university}
Graduation Date: ${degree.graduation}`)
            .join('\n\n')
        : '';

    const companiesText = user.companies
        .map(c => `Company: ${c.name} From:${c.start} To:${c.end}`)
        .join('\n\n');

    const prompt = buildPrompt(jobDesc, companiesText, educationText);

    let gptRes;
    try {
        gptRes = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 7000
            },
            {
                headers: {
                    "Authorization": `Bearer ${CHATGPT_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
    } catch (apiErr) {
        if (apiErr.response) {
            console.error('OpenAI API error status:', apiErr.response.status);
            console.error('OpenAI API error data:', apiErr.response.data);
            if (apiErr.response.status === 401 || apiErr.response.status === 403) {
                const err = new Error('OpenAI API authentication/authorization failed. Check CHATGPT_API_KEY and model access.');
                err.status = 502;
                throw err;
            }
            const err = new Error(`OpenAI API error: ${apiErr.response.status}`);
            err.status = 502;
            throw err;
        }
        console.error('OpenAI request failed:', apiErr.message);
        const err = new Error('Failed to call OpenAI API');
        err.status = 502;
        throw err;
    }

    // Post-process: strip any remaining percentages GPT may have included
    const resumeText = gptRes.data.choices[0].message.content
        .replace(/\bby\s+\d+(\.\d+)?%/g, 'significantly')
        .replace(/\b\d+(\.\d+)?%\s*/g, '')
        .replace(/\bby\s+\d+(\.\d+)?\s*percent/gi, 'significantly')
        .replace(/\b\d+(\.\d+)?\s*percent\b/gi, '')
        .replace(/ {2,}/g, ' ')
        .trim();

    return resumeText;
}

async function generateApplicationAnswer({ question, jobDesc, resumeText, profile }) {
    const prompt = `
You are helping a job applicant answer a general application question.

Use ONLY the context below:

Candidate profile:
Name: ${profile.name || ''}
Email: ${profile.email || ''}

Job description:
${jobDesc || ''}

Generated resume:
${resumeText || ''}

Application question:
${question}

Silently analyze the application question first. If it contains multiple questions or asks about multiple skills, tools, modules, domains, salary expectations, or experience requirements, split it into separate sub-questions before answering.

Output format:
Question: <first sub-question exactly and clearly>
Answer: <direct answer>

Question: <next sub-question>
Answer: <direct answer>

Formatting rules:
- Start immediately with the first "Question:" line.
- Do not show analysis, notes, summaries, counts, "total questions", introductions, or conclusions.
- Always show the question first, then its answer.
- Use one Question/Answer block per sub-question.
- If the input contains only one question, still use one Question/Answer block.
- Do not combine separate skill-experience questions into one paragraph.
- If a sub-question is a yes/no experience question, answer with only "Yes" or "No". Do not add explanation.
- For yes/no experience questions, answer "Yes" when the resume, job description, or closely related Microsoft/enterprise IT experience reasonably supports the skill. In most cases, prefer "Yes" unless the context clearly contradicts it.
- If you do not know the answer from the provided context and no special rule below applies, answer exactly "N/A".
- For "how many years of experience" questions, answer with the best truthful estimate from the resume. If the context does not clearly support a specific number, answer exactly "N/A".
- For salary, compensation, expected pay, hourly rate, or desired salary questions, first find salary/range/rate information in the job description. If salary information exists, answer with that salary information. If it does not exist in the job description, answer exactly "80000-120000".
- For sponsorship, visa sponsorship, or work authorization sponsorship questions, answer that I do not require any sponsorship. If it is a yes/no question asking whether I require sponsorship, answer exactly "No".
- For questions asking whether I have worked at, interviewed with, applied to, or been contacted by this company or these companies before, answer that I have never worked or interviewed at those companies before. If it is a yes/no question, answer exactly "No".
- For LinkedIn ID, LinkedIn profile URL, portfolio, portfolio URL, GitHub URL, personal website, or website fields, answer exactly "N/A".
- For voluntary self-identification disability status questions, answer exactly "No, I do not have a disability and have not had one in the past".
- For protected veteran or veteran status questions, answer exactly "I am not a protected veteran".
- For race or ethnicity questions, answer exactly "American".
- For gender questions, answer exactly "Male".
- Preserve important skill names exactly, such as "SAP SuccessFactors", "WorkForce Software", "Employee Central", or "Overtime Calculation Modules".

Answer-writing rules:
- Answer in first person.
- Keep it truthful to the resume and job description.
- Do not invent credentials, employers, degrees, clearance, certifications, or work authorization details not present in the context.
- If the question asks about relocation, availability, or legal/work-authorization status and the context does not include the answer, answer exactly "N/A".
- Keep each answer concise: usually 1-3 sentences.
- Do not use markdown.
`;

    let gptRes;
    try {
        gptRes = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 800,
                temperature: 0.4
            },
            {
                headers: {
                    "Authorization": `Bearer ${CHATGPT_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
    } catch (apiErr) {
        if (apiErr.response) {
            console.error('OpenAI API error status:', apiErr.response.status);
            console.error('OpenAI API error data:', apiErr.response.data);
            if (apiErr.response.status === 401 || apiErr.response.status === 403) {
                const err = new Error('OpenAI API authentication/authorization failed. Check CHATGPT_API_KEY and model access.');
                err.status = 502;
                throw err;
            }
            const err = new Error(`OpenAI API error: ${apiErr.response.status}`);
            err.status = 502;
            throw err;
        }
        console.error('OpenAI request failed:', apiErr.message);
        const err = new Error('Failed to call OpenAI API');
        err.status = 502;
        throw err;
    }

    return gptRes.data.choices[0].message.content
        .split('\n')
        .filter(line => !/^\s*(total\s+questions?|number\s+of\s+questions?)\s*:/i.test(line))
        .join('\n')
        .trim();
}

module.exports = { generateResumeText, generateApplicationAnswer };
