// ui.js - User Interface rendering and manipulation logic
import {
    db,
    collection,
    getDocs
} from './firebase-init.js'; // Use mock Firebase functions


/**
 * Renders the dashboard statistics and recent activity.
 * @param {number} totalSkills - Total count of skills.
 * @param {number} totalQuestions - Total count of questions.
 * @param {number} assessmentsTaken - Total count of assessments taken.
 * @param {Array<string>} recentActivity - Array of strings for recent activities.
 * @param {HTMLElement} totalSkillsCountElem - DOM element for total skills count.
 * @param {HTMLElement} totalQuestionsCountElem - DOM element for total questions count.
 * @param {HTMLElement} assessmentsTakenCountElem - DOM element for assessments taken count.
 * @param {HTMLElement} recentActivityListElem - DOM element for recent activity list.
 */
export function renderDashboard(
    totalSkills,
    totalQuestions,
    assessmentsTaken,
    recentActivity,
    totalSkillsCountElem,
    totalQuestionsCountElem,
    assessmentsTakenCountElem,
    recentActivityListElem
) {
    if (totalSkillsCountElem) totalSkillsCountElem.textContent = totalSkills;
    if (totalQuestionsCountElem) totalQuestionsCountElem.textContent = totalQuestions;
    if (assessmentsTakenCountElem) assessmentsTakenCountElem.textContent = assessmentsTaken;

    if (recentActivityListElem) {
        recentActivityListElem.innerHTML = '';
        if (recentActivity.length > 0) {
            recentActivity.forEach(activity => {
                const li = document.createElement('li');
                li.textContent = activity;
                recentActivityListElem.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No recent activity to display.';
            recentActivityListElem.appendChild(li);
        }
    }
}

/**
 * Shows a specific content section and hides others.
 * @param {string} sectionId - The ID of the section to show (e.g., 'dashboard', 'assessments').
 */
export function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none'; // Explicitly hide to prevent layout issues during transition
    });
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block'; // Show block first
        activeSection.classList.add('active'); // Then add active for animation
    }
}

/**
 * Renders a question in the assessment player.
 * @param {Object} question - The question object to render.
 * @param {HTMLElement} container - The DOM element to render the question into.
 */
export function renderQuestion(question, container) {
    if (!container) return;

    container.innerHTML = `
        <p class="question-text">${question.text}</p>
        <div class="options-container"></div>
    `;
    const optionsContainer = container.querySelector('.options-container');

    if (question.type === 'mcq') {
        question.options.forEach((option, index) => {
            const radioOption = document.createElement('label');
            radioOption.classList.add('radio-option');
            
            // Create input element
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'question_option';
            input.value = option;
            input.setAttribute('data-index', index);
            
            // Create checkmark span
            const checkmark = document.createElement('span');
            checkmark.classList.add('checkmark');
            
            // Create text node for the option text
            const textNode = document.createTextNode(option);
            
            // Append elements
            radioOption.appendChild(input);
            radioOption.appendChild(checkmark);
            radioOption.appendChild(textNode);
            
            optionsContainer.appendChild(radioOption);
        });
    } else if (question.type === 'short') {
        const shortAnswerInput = document.createElement('input');
        shortAnswerInput.type = 'text';
        shortAnswerInput.classList.add('short-answer-input');
        shortAnswerInput.placeholder = 'Type your answer here...';
        optionsContainer.appendChild(shortAnswerInput);
    }
}

/**
 * Clears the content of the question container.
 * @param {HTMLElement} container - The DOM element representing the question container.
 */
export function clearQuestionContainer(container) {
    if (container) {
        container.innerHTML = '<p class="question-text">Loading question...</p><div class="options-container"></div>';
    }
}

/**
 * Renders the assessment results, including score, feedback, skill graph, and breakdown.
 * @param {number} overallScore - The overall assessment score (0.0 - 1.0).
 * @param {string} feedbackMessage - A textual feedback message.
 * @param {Object} skillProficiency - A map of skillId to proficiency score (0.0 - 1.0).
 * @param {number} totalQuestionsInAssessment - Total questions in the just-completed assessment.
 * @param {HTMLElement} graphContainerElem - The DOM element for the skill graph.
 * @param {HTMLElement} skillBreakdownListElem - The DOM element for the skill breakdown list.
 * @param {HTMLElement} resultsJsonPreElem - The <pre> element to display raw JSON.
 * @param {Object} fullAssessmentResult - The full assessment result object to display in raw JSON.
 */
export function renderAssessmentResults(
    overallScore,
    feedbackMessage,
    skillProficiency,
    totalQuestionsInAssessment,
    graphContainerElem,
    skillBreakdownListElem,
    resultsJsonPreElem,
    fullAssessmentResult
) {
    document.getElementById('overallScore').textContent = `${(overallScore * 100).toFixed(0)}%`;
    document.getElementById('feedbackMessage').textContent = feedbackMessage;

    renderSkillProficiencyGraph(skillProficiency, graphContainerElem);
    renderSkillBreakdown(skillProficiency, skillBreakdownListElem);

    if (resultsJsonPreElem) {
        resultsJsonPreElem.textContent = JSON.stringify(fullAssessmentResult, null, 2);
    }

    // Hide raw results by default when new results are shown
    document.getElementById('rawResults').hidden = true;
}


/**
 * Renders a force-directed graph of skill proficiencies using D3.js.
 * @param {Object} skillProficiency - Map of skill IDs to their proficiency scores.
 * @param {HTMLElement} container - The SVG container element.
 */
function renderSkillProficiencyGraph(skillProficiency, container) {
    if (!container) return;

    container.innerHTML = ''; // Clear previous graph
    const placeholder = container.querySelector('.graph-placeholder');
    if (placeholder) placeholder.remove(); // Remove placeholder if present

    if (Object.keys(skillProficiency).length === 0) {
        container.innerHTML = '<p class="graph-placeholder">No graph available yet. Complete an assessment.</p>';
        return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);

    const skillsCol = collection(db, 'skills'); // Reference to skills collection
    getDocs(skillsCol).then(snapshot => {
        const allSkillsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const nodes = Object.entries(skillProficiency).map(([skillId, score]) => {
            const skill = allSkillsData.find(s => s.id === skillId);
            return {
                id: skillId,
                name: skill ? skill.name : skillId,
                score: score,
                radius: 15 + score * 20 // Bigger radius for higher proficiency
            };
        });

        // Filter out nodes that don't have associated skills (shouldn't happen if proficiency map is based on actual skills)
        const validNodes = nodes.filter(node => node.name);

        const links = [];
        validNodes.forEach(nodeA => {
            const skillA = allSkillsData.find(s => s.id === nodeA.id);
            if (skillA && skillA.prerequisites) {
                skillA.prerequisites.forEach(prereqId => {
                    const nodeB = validNodes.find(n => n.id === prereqId);
                    if (nodeB) {
                        links.push({
                            source: nodeA.id,
                            target: nodeB.id
                        });
                    }
                });
            }
        });


        const simulation = d3.forceSimulation(validNodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(d => d.radius + 5)); // Prevent overlap


        const link = svg.append("g")
            .attr("class", "skill-edges")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("class", "skill-edge");

        const node = svg.append("g")
            .attr("class", "skill-nodes")
            .selectAll("circle")
            .data(validNodes)
            .join("circle")
            .attr("class", "skill-node")
            .attr("r", d => d.radius)
            .attr("fill", d => {
                if (d.score >= 0.75) return "var(--color-green)";
                if (d.score >= 0.5) return "var(--color-orange)";
                return "var(--color-red)";
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        const labels = svg.append("g")
            .attr("class", "skill-node-labels")
            .selectAll("text")
            .data(validNodes)
            .join("text")
            .attr("class", "skill-node-text")
            .text(d => d.name)
            .attr("dy", "0.35em"); // Center vertically

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            labels
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }).catch(error => {
        console.error("Error fetching skills for graph rendering:", error);
        container.innerHTML = '<p class="graph-placeholder">Error loading graph data.</p>';
    });
}


/**
 * Renders the skill breakdown list.
 * @param {Object} skillProficiency - Map of skill IDs to their proficiency scores.
 * @param {HTMLElement} listElem - The DOM element for the list.
 */
export function renderSkillBreakdown(skillProficiency, listElem) {
    if (!listElem) return;

    listElem.innerHTML = ''; // Clear previous list

    if (Object.keys(skillProficiency).length === 0) {
        listElem.innerHTML = '<li>No skill breakdown available yet.</li>';
        return;
    }

    const skillsCol = collection(db, 'skills'); // Reference to skills collection
    getDocs(skillsCol).then(snapshot => {
        const allSkillsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const sortedProficiencies = Object.entries(skillProficiency)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA); // Sort highest to lowest

        sortedProficiencies.forEach(([skillId, score]) => {
            const skillData = allSkillsData.find(s => s.id === skillId);
            const skillName = skillData ? skillData.name : skillId; // Fallback to ID if name not found

            const li = document.createElement('li');
            const scorePercent = (score * 100).toFixed(0);
            let proficiencyClass = 'proficiency-low';
            if (score >= 0.75) proficiencyClass = 'proficiency-high';
            else if (score >= 0.5) proficiencyClass = 'proficiency-medium';

            li.innerHTML = `
                <span class="skill-name">${skillName}</span>
                <span class="skill-proficiency ${proficiencyClass}">${scorePercent}%</span>
            `;
            listElem.appendChild(li);
        });
    }).catch(error => {
        console.error("Error fetching skills for breakdown list:", error);
        listElem.innerHTML = '<li>Error loading skill breakdown.</li>';
    });
}

/**
 * Updates the assessment progress bar.
 * @param {number} current - Current question number (1-based).
 * @param {number} total - Total number of questions.
 * @param {HTMLElement} progressBarElem - The DOM element for the progress bar fill.
 */
export function updateProgressBar(current, total, progressBarElem) {
    if (progressBarElem) {
        const percentage = total > 0 ? (current / total) * 100 : 0;
        progressBarElem.style.width = `${percentage}%`;
    }
}

/**
 * Shows a loading indicator and disables a button.
 * @param {HTMLElement} loadingElem - The loading indicator element.
 * @param {HTMLElement} buttonElem - The button to disable.
 */
export function showLoading(loadingElem, buttonElem) {
    if (loadingElem) loadingElem.hidden = false;
    if (buttonElem) buttonElem.disabled = true;
}

/**
 * Hides a loading indicator and enables a button.
 * @param {HTMLElement} loadingElem - The loading indicator element.
 * @param {HTMLElement} buttonElem - The button to enable.
 */
export function hideLoading(loadingElem, buttonElem) {
    if (loadingElem) loadingElem.hidden = true;
    if (buttonElem) buttonElem.disabled = false;
}

/**
 * Updates a status message element.
 * @param {HTMLElement} messageElem - The element to display the message in.
 * @param {string} message - The message text.
 * @param {string} type - 'success', 'error', or 'info' for styling.
 */
export function updateStatusMessage(messageElem, message, type = 'info') {
    if (messageElem) {
        messageElem.textContent = message;
        messageElem.className = `status-message ${type}`;
        messageElem.hidden = false;
        // Optionally hide after a few seconds
        setTimeout(() => {
            messageElem.hidden = true;
        }, 5000);
    }
}

/**
 * Populates the skill form with existing skill data (for editing).
 * (Placeholder - actual implementation would require fetching a skill by ID)
 * @param {Object} skillData - The skill object to populate the form with.
 * @param {HTMLElement} formElem - The form element.
 */
export function populateSkillForm(skillData, formElem) {
    // This function would be called when an admin selects a skill to edit
    // and would fill in the form fields based on `skillData`.
    // For now, it's a placeholder.
    if (formElem) {
        formElem.querySelector('#skillId').value = skillData.id;
        formElem.querySelector('#skillName').value = skillData.name;
        formElem.querySelector('#skillDescription').value = skillData.description;
        formElem.querySelector('#skillPrerequisites').value = skillData.prerequisites ? skillData.prerequisites.join(', ') : '';
        formElem.querySelector('#skillDifficulty').value = skillData.difficulty;
    }
}

/**
 * Clears the skill form.
 * @param {HTMLElement} formElem - The form element.
 */
export function clearSkillForm(formElem) {
    if (formElem) {
        formElem.reset();
        formElem.querySelector('#skillId').value = '';
        formElem.querySelector('#skillDifficulty').value = '1'; // Reset to default
        updateStatusMessage(formElem, '', 'info'); // Clear status
    }
}

/**
 * Populates the question form with existing question data (for editing).
 * (Placeholder - actual implementation would require fetching a question by ID)
 * @param {Object} questionData - The question object to populate the form with.
 * @param {HTMLElement} formElem - The form element.
 */
export function populateQuestionForm(questionData, formElem) {
    // This function would be called when an admin selects a question to edit
    // and would fill in the form fields based on `questionData`.
    // For now, it's a placeholder.
    if (formElem) {
        formElem.querySelector('#questionId').value = questionData.id;
        formElem.querySelector('#questionText').value = questionData.text;
        formElem.querySelector('#questionType').value = questionData.type;
        toggleMcqShortAnswerFields(questionData.type,
            formElem.querySelector('#mcqOptionsGroup'),
            formElem.querySelector('#shortAnswerGroup')
        );
        if (questionData.type === 'mcq') {
            formElem.querySelector('#mcqOptions').value = questionData.options ? questionData.options.join('\n') : '';
            formElem.querySelector('#mcqCorrectIndex').value = questionData.correctIndex;
        } else if (questionData.type === 'short') {
            formElem.querySelector('#shortAnswerCorrect').value = questionData.correctAnswer;
        }
        formElem.querySelector('#questionSkillTags').value = questionData.skillTags ?
            questionData.skillTags.map(tag => `${tag.skillId}:${tag.weight}`).join(', ') : '';
        formElem.querySelector('#estimatedTime').value = questionData.estimatedTime;
    }
}

/**
 * Clears the question form.
 * @param {HTMLElement} formElem - The form element.
 */
export function clearQuestionForm(formElem) {
    if (formElem) {
        formElem.reset();
        formElem.querySelector('#questionId').value = '';
        formElem.querySelector('#estimatedTime').value = '30'; // Reset to default
        formElem.querySelector('#questionType').value = 'mcq'; // Reset type
        toggleMcqShortAnswerFields('mcq', // Reset visibility based on default type
            formElem.querySelector('#mcqOptionsGroup'),
            formElem.querySelector('#shortAnswerGroup')
        );
        updateStatusMessage(formElem, '', 'info'); // Clear status
    }
}

/**
 * Toggles the visibility of MCQ-specific or Short Answer-specific fields in the question form.
 * @param {string} questionType - The selected question type ('mcq' or 'short').
 * @param {HTMLElement} mcqGroupElem - The DOM element for the MCQ options group.
 * @param {HTMLElement} shortAnswerGroupElem - The DOM element for the short answer group.
 */
export function toggleMcqShortAnswerFields(questionType, mcqGroupElem, shortAnswerGroupElem) {
    if (mcqGroupElem) mcqGroupElem.hidden = (questionType !== 'mcq');
    if (shortAnswerGroupElem) shortAnswerGroupElem.hidden = (questionType !== 'short');
}

/**
 * Shows the "Clear All Data" button in the admin panel.
 * @param {HTMLElement} clearButtonElem - The clear data button element.
 */
export function showAdminClearDataButton(clearButtonElem) {
    if (clearButtonElem) {
        clearButtonElem.hidden = false;
    }
}

/**
 * Hides the "Clear All Data" button in the admin panel.
 * @param {HTMLElement} clearButtonElem - The clear data button element.
 */
export function hideAdminClearDataButton(clearButtonElem) {
    if (clearButtonElem) {
        clearButtonElem.hidden = true;
    }
}