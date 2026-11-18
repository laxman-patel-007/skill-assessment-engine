// app.js - Main application logic

// Import functions from other modules
import {
    getSkills,
    getQuestions,
    getAssessments,
    addSkill,
    updateSkill,
    addQuestion,
    updateQuestion,
    addAssessmentResult,
    seedSampleData,
    clearAllData
} from './db.js'; // Assumes db.js exports these functions
import {
    renderDashboard,
    showSection,
    renderQuestion,
    clearQuestionContainer,
    renderAssessmentResults,
    updateProgressBar,
    showLoading,
    hideLoading,
    updateStatusMessage,
    populateSkillForm,
    populateQuestionForm,
    clearSkillForm,
    clearQuestionForm,
    toggleMcqShortAnswerFields,
    showAdminClearDataButton,
    hideAdminClearDataButton
} from './ui.js'; // Assumes ui.js exports these functions
import {
    selectQuestionsForAssessment,
    calculateProficiency,
    evaluateAnswer,
    generateFeedback
} from './algorithms.js'; // Assumes algorithms.js exports these functions

// --- Global Application State ---
let currentAssessment = null;
let currentQuestionIndex = 0;
let assessmentQuestions = [];
let userAnswers = [];
let allSkills = [];
let allQuestions = [];
let allAssessments = [];

// --- DOM Element References ---
const dashboardSection = document.getElementById('dashboard');
const assessmentsSection = document.getElementById('assessments');
const adminSection = document.getElementById('admin');

// Dashboard elements
const totalSkillsCountElem = document.getElementById('totalSkillsCount');
const totalQuestionsCountElem = document.getElementById('totalQuestionsCount');
const assessmentsTakenCountElem = document.getElementById('assessmentsTakenCount');
const recentActivityListElem = document.getElementById('recentActivityList');

// Assessment Starter elements
const targetSkillsInput = document.getElementById('targetSkillsInput');
const maxQsInput = document.getElementById('maxQsInput');
const startBtn = document.getElementById('startBtn');
const assessmentLoading = document.getElementById('assessmentLoading');

// Assessment Player elements
const playerSection = document.getElementById('player');
const questionCounterElem = document.getElementById('questionCounter');
const assessmentProgressBar = document.getElementById('assessmentProgressBar');
const questionContainer = document.getElementById('questionContainer');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');

// Assessment Results elements
const resultsSection = document.getElementById('results');
const overallScoreElem = document.getElementById('overallScore');
const feedbackMessageElem = document.getElementById('feedbackMessage');
const skillGraphContainer = document.getElementById('skillGraphContainer');
const skillBreakdownList = document.getElementById('skillBreakdownList');
const resultsJsonPre = document.getElementById('resultsJson');
const toggleRawResultsBtn = document.getElementById('toggleRawResults');

// Admin elements
const seedBtn = document.getElementById('seedBtn');
const clearDbBtn = document.getElementById('clearDbBtn');
const seedStatusElem = document.getElementById('seedStatus');

const skillForm = document.getElementById('skillForm');
const skillIdInput = document.getElementById('skillId');
const skillNameInput = document.getElementById('skillName');
const skillDescriptionInput = document.getElementById('skillDescription');
const skillPrerequisitesInput = document.getElementById('skillPrerequisites');
const skillDifficultyInput = document.getElementById('skillDifficulty');

const questionForm = document.getElementById('questionForm');
const questionIdInput = document.getElementById('questionId');
const questionTextInput = document.getElementById('questionText');
const questionTypeSelect = document.getElementById('questionType');
const mcqOptionsGroup = document.getElementById('mcqOptionsGroup');
const mcqOptionsInput = document.getElementById('mcqOptions');
const mcqCorrectIndexInput = document.getElementById('mcqCorrectIndex');
const shortAnswerGroup = document.getElementById('shortAnswerGroup');
const shortAnswerCorrectInput = document.getElementById('shortAnswerCorrect');
const questionSkillTagsInput = document.getElementById('questionSkillTags');
const estimatedTimeInput = document.getElementById('estimatedTime');


// --- Initial Load and Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded. Initializing app...');

    try {
        // Check if data exists, if not seed it
        const skills = await getSkills();
        const questions = await getQuestions();
        
        if (skills.length === 0 || questions.length === 0) {
            console.log('No data found, seeding sample data...');
            await seedSampleData();
            console.log('Sample data seeded successfully!');
        }
        
        // Set initial active section (Dashboard)
        showSection('dashboard');
        document.querySelector('.main-nav .nav-link[data-section="dashboard"]').classList.add('active');

        // Load initial data for dashboard
        await loadAndRenderDashboard();
    } catch (error) {
        console.error('Error during app initialization:', error);
        // Show a user-friendly error message
        const dashboardSection = document.getElementById('dashboard');
        if (dashboardSection) {
            dashboardSection.innerHTML = `
                <div class="card">
                    <h2>Application Error</h2>
                    <p>There was an error initializing the application. Please refresh the page.</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    }

    // Setup Navigation
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            try {
                e.preventDefault();
                document.querySelectorAll('.main-nav .nav-link').forEach(nav => nav.classList.remove('active'));
                e.target.classList.add('active');
                showSection(e.target.dataset.section);

                // Special handling for admin section to show/hide clear button
                if (e.target.dataset.section === 'admin') {
                    showAdminClearDataButton(clearDbBtn);
                } else {
                    hideAdminClearDataButton(clearDbBtn);
                }
            } catch (error) {
                console.error('Navigation error:', error);
            }
        });
    });

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            try {
                mainNav.classList.toggle('active');
            } catch (error) {
                console.error('Mobile menu toggle error:', error);
            }
        });
    }

    // --- Assessment Event Listeners ---
    startBtn.addEventListener('click', startAssessment);
    nextBtn.addEventListener('click', handleNextQuestion);
    submitBtn.addEventListener('click', handleSubmitAssessment);
    toggleRawResultsBtn.addEventListener('click', () => {
        document.getElementById('rawResults').toggleAttribute('hidden');
    });

    // --- Admin Panel Event Listeners ---
    seedBtn.addEventListener('click', handleSeedData);
    clearDbBtn.addEventListener('click', handleClearData);

    skillForm.addEventListener('submit', handleSkillFormSubmit);
    questionForm.addEventListener('submit', handleQuestionFormSubmit);
    questionTypeSelect.addEventListener('change', () => {
        toggleMcqShortAnswerFields(questionTypeSelect.value, mcqOptionsGroup, shortAnswerGroup);
    });
    // Initial call to set correct visibility for question form
    toggleMcqShortAnswerFields(questionTypeSelect.value, mcqOptionsGroup, shortAnswerGroup);
});


// --- Functions for Application Logic ---

async function loadAndRenderDashboard() {
    try {
        allSkills = await getSkills();
        allQuestions = await getQuestions();
        allAssessments = await getAssessments(); // Get all assessments

        // Filter and process recent activities from allAssessments
        const recentActivity = allAssessments
            .sort((a, b) => {
                // Handle both Firestore Timestamp and regular Date objects
                const timestampA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp).getTime();
                const timestampB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp).getTime();
                return timestampB - timestampA; // Sort by latest
            })
            .slice(0, 5) // Get top 5
            .map(assessment => {
                // Handle both Firestore Timestamp and regular Date objects
                const dateObj = assessment.timestamp?.toDate ? assessment.timestamp.toDate() : new Date(assessment.timestamp);
                const date = dateObj.toLocaleDateString();
                const time = dateObj.toLocaleTimeString();
                const score = assessment.overallScore ? `${(assessment.overallScore * 100).toFixed(0)}%` : 'N/A';
                return `Assessment taken on ${date} at ${time} - Score: ${score}`;
            });

        renderDashboard(
            allSkills.length,
            allQuestions.length,
            allAssessments.length, // Pass the count of all assessments
            recentActivity,
            totalSkillsCountElem,
            totalQuestionsCountElem,
            assessmentsTakenCountElem,
            recentActivityListElem
        );
        
        // No need to populate dropdown since we're using text input
    } catch (error) {
        console.error("Failed to load dashboard data:", error);
        // Optionally update UI to show error
        updateStatusMessage(recentActivityListElem, 'Error loading dashboard data.', 'error');
    }
}

// populateSkillDropdown function removed - using text input instead

async function startAssessment() {
    showLoading(assessmentLoading, startBtn);
    clearQuestionContainer(questionContainer); // Clear previous question if any

    try {
        // Get target skills from text input
        const targetSkillIds = targetSkillsInput.value
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== '');
        
        const maxQuestions = parseInt(maxQsInput.value, 10);

        // Fetch the latest skills and questions to ensure data is up-to-date
        allSkills = await getSkills();
        allQuestions = await getQuestions();

        console.log("Data loaded for assessment:");
        console.log("Skills:", allSkills.length);
        console.log("Questions:", allQuestions.length);
        console.log("Target skill IDs:", targetSkillIds);
        console.log("Max questions:", maxQuestions);

        assessmentQuestions = selectQuestionsForAssessment(allQuestions, allSkills, targetSkillIds, maxQuestions);

        if (assessmentQuestions.length === 0) {
            alert('Could not find enough questions for the specified skills/criteria. Please check your input or seed more data.');
            hideLoading(assessmentLoading, startBtn);
            return;
        }

        currentAssessment = {
            id: `assessment_${Date.now()}`,
            timestamp: new Date(),
            questions: assessmentQuestions.map(q => ({
                id: q.id,
                skillTags: q.skillTags,
                type: q.type,
                correctAnswer: q.type === 'mcq' ? q.options[q.correctIndex] : q.correctAnswer // Store the actual correct answer
            })),
            userResponses: [],
            overallScore: 0,
            skillProficiency: {}
        };

        currentQuestionIndex = 0;
        userAnswers = [];

        // Hide starter, show player
        document.querySelector('.assessment-starter').hidden = true;
        playerSection.hidden = false;
        resultsSection.hidden = true; // Ensure results are hidden

        loadQuestion();
    } catch (error) {
        console.error("Error starting assessment:", error);
        alert('Failed to start assessment: ' + error.message);
    } finally {
        hideLoading(assessmentLoading, startBtn);
    }
}

function loadQuestion() {
    if (currentQuestionIndex < assessmentQuestions.length) {
        const question = assessmentQuestions[currentQuestionIndex];
        const totalQuestions = assessmentQuestions.length;

        questionCounterElem.textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;
        updateProgressBar(currentQuestionIndex + 1, totalQuestions, assessmentProgressBar);

        renderQuestion(question, questionContainer);
        nextBtn.disabled = true; // Disable next until an answer is selected/entered
        submitBtn.hidden = true; // Ensure submit is hidden

        // Add event listener for answer selection/input
        const optionsContainer = questionContainer.querySelector('.options-container');
        if (question.type === 'mcq' && optionsContainer) {
            optionsContainer.addEventListener('change', enableNextButton);
        } else if (question.type === 'short' && optionsContainer) {
            const shortAnswerInput = optionsContainer.querySelector('input[type="text"]');
            if (shortAnswerInput) {
                shortAnswerInput.addEventListener('input', enableNextButton);
            }
        }

        // Check if it's the last question
        if (currentQuestionIndex === assessmentQuestions.length - 1) {
            nextBtn.hidden = true;
            submitBtn.hidden = false;
        } else {
            nextBtn.hidden = false;
            submitBtn.hidden = true;
        }
    } else {
        // This case should ideally not be reached if submit is triggered correctly
        console.warn("Attempted to load question beyond assessment length.");
        handleSubmitAssessment();
    }
}

function enableNextButton() {
    let hasAnswer = false;
    const question = assessmentQuestions[currentQuestionIndex];

    if (question.type === 'mcq') {
        const selectedOption = questionContainer.querySelector('input[name="question_option"]:checked');
        hasAnswer = !!selectedOption;
    } else if (question.type === 'short') {
        const shortAnswerInput = questionContainer.querySelector('.short-answer-input');
        hasAnswer = shortAnswerInput && shortAnswerInput.value.trim() !== '';
    }
    nextBtn.disabled = !hasAnswer;
    submitBtn.disabled = !hasAnswer; // Also disable submit if no answer for last question
}


function handleNextQuestion() {
    saveCurrentAnswer();
    currentQuestionIndex++;
    if (currentQuestionIndex < assessmentQuestions.length) {
        loadQuestion();
    } else {
        // Should not happen if submit button is used for the last question
        handleSubmitAssessment();
    }
}

function saveCurrentAnswer() {
    const question = assessmentQuestions[currentQuestionIndex];
    let userAnswer = null;

    if (question.type === 'mcq') {
        const selectedOption = questionContainer.querySelector('input[name="question_option"]:checked');
        if (selectedOption) {
            userAnswer = selectedOption.value;
        }
    } else if (question.type === 'short') {
        const shortAnswerInput = questionContainer.querySelector('.short-answer-input');
        if (shortAnswerInput) {
            userAnswer = shortAnswerInput.value.trim();
        }
    }

    userAnswers.push({
        questionId: question.id,
        userAnswer: userAnswer,
        correctAnswer: question.type === 'mcq' ? question.options[question.correctIndex] : question.correctAnswer,
        skillTags: question.skillTags,
        type: question.type
    });
}


async function handleSubmitAssessment() {
    saveCurrentAnswer(); // Save the answer for the last question

    // Evaluate all answers
    let correctCount = 0;
    const evaluationResults = userAnswers.map(answer => {
        const isCorrect = evaluateAnswer(answer.userAnswer, answer.correctAnswer, answer.type);
        if (isCorrect) {
            correctCount++;
        }
        return { ...answer,
            isCorrect
        };
    });

    currentAssessment.userResponses = evaluationResults;
    currentAssessment.overallScore = assessmentQuestions.length > 0 ? correctCount / assessmentQuestions.length : 0;

    // Calculate skill proficiency for all skills based on assessment results
    const proficiencyMap = calculateProficiency(evaluationResults, allSkills);
    currentAssessment.skillProficiency = proficiencyMap;

    // Save assessment result to DB
    await addAssessmentResult(currentAssessment);

    // Render results
    document.querySelector('.assessment-starter').hidden = false; // Show starter again
    playerSection.hidden = true; // Hide player
    resultsSection.hidden = false; // Show results

    // Update the dashboard counts right after a new assessment is added
    await loadAndRenderDashboard();

    renderAssessmentResults(
        currentAssessment.overallScore,
        generateFeedback(currentAssessment.overallScore),
        currentAssessment.skillProficiency,
        currentAssessment.questions.length, // Number of questions in assessment
        skillGraphContainer,
        skillBreakdownList,
        resultsJsonPre,
        currentAssessment // Pass the full assessment object for raw JSON
    );

    // Reset for next assessment
    currentAssessment = null;
    currentQuestionIndex = 0;
    assessmentQuestions = [];
    userAnswers = [];
    targetSkillsInput.value = ''; // Clear target skills input
    maxQsInput.value = '10'; // Reset max questions
    nextBtn.hidden = false; // Show next button again
    submitBtn.hidden = true; // Hide submit button again
}


// --- Admin Panel Handlers ---

async function handleSeedData() {
    updateStatusMessage(seedStatusElem, 'Seeding sample data...', 'info');
    seedBtn.disabled = true;
    clearDbBtn.disabled = true;
    try {
        await seedSampleData();
        updateStatusMessage(seedStatusElem, 'Sample data seeded successfully!', 'success');
        await loadAndRenderDashboard(); // Refresh dashboard with new data
    } catch (error) {
        console.error("Error seeding data:", error);
        updateStatusMessage(seedStatusElem, `Error seeding data: ${error.message}`, 'error');
    } finally {
        seedBtn.disabled = false;
        clearDbBtn.disabled = false;
    }
}

async function handleClearData() {
    if (confirm('Are you sure you want to clear ALL data (Skills, Questions, Assessments)? This action cannot be undone!')) {
        updateStatusMessage(seedStatusElem, 'Clearing all data...', 'info');
        seedBtn.disabled = true;
        clearDbBtn.disabled = true;
        try {
            await clearAllData();
            updateStatusMessage(seedStatusElem, 'All data cleared successfully!', 'success');
            await loadAndRenderDashboard(); // Refresh dashboard
        } catch (error) {
            console.error("Error clearing data:", error);
            updateStatusMessage(seedStatusElem, `Error clearing data: ${error.message}`, 'error');
        } finally {
            seedBtn.disabled = false;
            clearDbBtn.disabled = false;
        }
    }
}

async function handleSkillFormSubmit(event) {
    event.preventDefault();
    const skill = {
        name: skillNameInput.value.trim(),
        description: skillDescriptionInput.value.trim(),
        prerequisites: skillPrerequisitesInput.value.split(',').map(s => s.trim()).filter(s => s !== ''),
        difficulty: parseInt(skillDifficultyInput.value, 10),
    };

    try {
        if (skillIdInput.value) {
            // Update existing skill
            await updateSkill(skillIdInput.value, skill);
            updateStatusMessage(skillForm, 'Skill updated successfully!', 'success');
        } else {
            // Add new skill
            const newSkillId = `s_${skill.name.toLowerCase().replace(/\s/g, '_')}`; // Simple ID generation
            await addSkill(newSkillId, skill);
            updateStatusMessage(skillForm, 'Skill added successfully!', 'success');
        }
        clearSkillForm(skillForm);
        await loadAndRenderDashboard(); // Refresh dashboard
    } catch (error) {
        console.error("Error saving skill:", error);
        updateStatusMessage(skillForm, `Error saving skill: ${error.message}`, 'error');
    }
}

async function handleQuestionFormSubmit(event) {
    event.preventDefault();

    const skillTagsParsed = questionSkillTagsInput.value
        .split(',')
        .map(tag => {
            const parts = tag.trim().split(':');
            if (parts.length === 2 && parts[0] && !isNaN(parseFloat(parts[1]))) {
                return {
                    skillId: parts[0].trim(),
                    weight: parseFloat(parts[1])
                };
            }
            return null;
        })
        .filter(tag => tag !== null);

    if (skillTagsParsed.length === 0 && questionSkillTagsInput.value.trim() !== '') {
        updateStatusMessage(questionForm, 'Invalid skill tags format. Use "skillId:weight, skillId2:weight2".', 'error');
        return;
    }


    const question = {
        text: questionTextInput.value.trim(),
        type: questionTypeSelect.value,
        skillTags: skillTagsParsed,
        estimatedTime: parseInt(estimatedTimeInput.value, 10),
        // Additional properties based on type
    };

    if (question.type === 'mcq') {
        question.options = mcqOptionsInput.value.split('\n').map(opt => opt.trim()).filter(opt => opt !== '');
        question.correctIndex = parseInt(mcqCorrectIndexInput.value, 10);
        if (question.correctIndex < 0 || question.correctIndex >= question.options.length) {
            updateStatusMessage(questionForm, 'Correct option index is out of bounds.', 'error');
            return;
        }
    } else if (question.type === 'short') {
        question.correctAnswer = shortAnswerCorrectInput.value.trim();
        if (!question.correctAnswer) {
            updateStatusMessage(questionForm, 'Short answer question requires a correct answer.', 'error');
            return;
        }
    }

    try {
        if (questionIdInput.value) {
            // Update existing question
            await updateQuestion(questionIdInput.value, question);
            updateStatusMessage(questionForm, 'Question updated successfully!', 'success');
        } else {
            // Add new question
            // A simple ID generation for new questions (e.g., q_timestamp)
            const newQuestionId = `q_${Date.now()}`;
            await addQuestion(newQuestionId, question);
            updateStatusMessage(questionForm, 'Question added successfully!', 'success');
        }
        clearQuestionForm(questionForm);
        await loadAndRenderDashboard(); // Refresh dashboard
    } catch (error) {
        console.error("Error saving question:", error);
        updateStatusMessage(questionForm, `Error saving question: ${error.message}`, 'error');
    }
}