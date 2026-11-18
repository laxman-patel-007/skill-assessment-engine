// algorithms.js - Placeholder for assessment logic functions

/**
 * Selects a subset of questions for an assessment based on target skills and max questions.
 * @param {Array<Object>} allQuestions - All available questions from the database.
 * @param {Array<Object>} allSkills - All available skills from the database.
 * @param {Array<string>} targetSkillIds - Optional array of skill IDs to focus on.
 * @param {number} maxQuestions - Maximum number of questions to select.
 * @returns {Array<Object>} An array of selected questions.
 */
export function selectQuestionsForAssessment(allQuestions, allSkills, targetSkillIds = [], maxQuestions = 10) {
    console.log("Selecting questions...");
    console.log("All Questions:", allQuestions);
    console.log("All Skills:", allSkills);
    console.log("Target Skill IDs:", targetSkillIds);
    console.log("Max Questions:", maxQuestions);

    let eligibleQuestions = [];

    if (targetSkillIds.length > 0) {
        // Filter questions that have at least one of the target skills
        eligibleQuestions = allQuestions.filter(q =>
            q.skillTags && q.skillTags.some(tag => targetSkillIds.includes(tag.skillId))
        );
    } else {
        // If no target skills, all questions are eligible
        eligibleQuestions = [...allQuestions];
    }

    // Shuffle and pick up to maxQuestions
    const shuffledQuestions = eligibleQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffledQuestions.slice(0, maxQuestions);

    console.log("Eligible Questions:", eligibleQuestions);
    console.log("Selected Questions:", selected);
    return selected;
}

/**
 * Calculates user proficiency across different skills based on assessment results.
 * @param {Array<Object>} evaluationResults - Array of user answers and their correctness.
 *   Each object should contain { questionId, userAnswer, correctAnswer, skillTags, isCorrect }
 * @param {Array<Object>} allSkills - All available skill objects.
 * @returns {Object} A map of skillId to proficiency score (0.0 to 1.0).
 */
export function calculateProficiency(evaluationResults, allSkills) {
    const skillScores = {};
    const skillMaxScores = {};

    // Initialize skill scores and max scores
    allSkills.forEach(skill => {
        skillScores[skill.id] = 0;
        skillMaxScores[skill.id] = 0;
    });

    evaluationResults.forEach(result => {
        if (result.skillTags) {
            result.skillTags.forEach(tag => {
                const skillId = tag.skillId;
                const weight = tag.weight || 1.0; // Default weight to 1.0 if not specified

                skillMaxScores[skillId] = (skillMaxScores[skillId] || 0) + weight;

                if (result.isCorrect) {
                    skillScores[skillId] = (skillScores[skillId] || 0) + weight;
                }
            });
        }
    });

    const proficiencyMap = {};
    for (const skillId in skillScores) {
        if (skillMaxScores[skillId] > 0) {
            proficiencyMap[skillId] = skillScores[skillId] / skillMaxScores[skillId];
        } else {
            proficiencyMap[skillId] = 0; // No questions for this skill
        }
    }
    // console.log("Calculated Proficiency Map:", proficiencyMap);
    return proficiencyMap;
}


/**
 * Evaluates a user's answer against the correct answer.
 * @param {*} userAnswer - The answer provided by the user.
 * @param {*} correctAnswer - The correct answer.
 * @param {string} questionType - The type of question ('mcq', 'short').
 * @returns {boolean} True if the answer is correct, false otherwise.
 */
export function evaluateAnswer(userAnswer, correctAnswer, questionType) {
    if (userAnswer === null || userAnswer === undefined || userAnswer.toString().trim() === '') {
        return false; // No answer provided
    }

    if (questionType === 'mcq') {
        // For MCQ, a direct string comparison should work if `userAnswer` is the option text.
        return userAnswer === correctAnswer;
    } else if (questionType === 'short') {
        // For short answer, perform a case-insensitive trim comparison.
        return userAnswer.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase();
    }
    return false; // Unknown question type
}

/**
 * Generates a feedback message based on the overall assessment score.
 * @param {number} score - The overall assessment score (0.0 to 1.0).
 * @returns {string} A feedback message.
 */
export function generateFeedback(score) {
    if (score >= 0.9) {
        return "Excellent work! You have a strong grasp of the assessed skills.";
    } else if (score >= 0.7) {
        return "Good job! You're doing well, with some areas for minor improvement.";
    } else if (score >= 0.5) {
        return "Keep practicing! You've got a decent foundation, but consistent effort will help you improve significantly.";
    } else {
        return "Looks like there are quite a few areas to focus on. Don't be discouraged, every expert was once a beginner!";
    }
}