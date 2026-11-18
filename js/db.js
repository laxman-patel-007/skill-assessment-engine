// db.js - Database interaction logic using localStorage mock

// Import the mock Firestore functions from firebase-init.js
import {
    db,
    collection,
    getDocs,
    getDoc,
    doc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    writeBatch
} from './firebase-init.js';


// --- Collection References ---
const skillsCol = collection(db, 'skills');
const questionsCol = collection(db, 'questions');
const assessmentsCol = collection(db, 'assessments');


// --- Public Functions ---

/**
 * Fetches all skills from the database.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of skill objects.
 */
export async function getSkills() {
    try {
        const snapshot = await getDocs(skillsCol);
        const skills = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log("Retrieved skills from database:", skills.length, "skills");
        return skills;
    } catch (error) {
        console.error("Error getting skills:", error);
        return [];
    }
}

/**
 * Fetches all questions from the database.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of question objects.
 */
export async function getQuestions() {
    try {
        const snapshot = await getDocs(questionsCol);
        const questions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log("Retrieved questions from database:", questions.length, "questions");
        return questions;
    } catch (error) {
        console.error("Error getting questions:", error);
        return [];
    }
}

/**
 * Fetches all assessment results from the database.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of assessment result objects.
 */
export async function getAssessments() {
    try {
        const snapshot = await getDocs(assessmentsCol);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting assessments:", error);
        return [];
    }
}

/**
 * Adds a new skill to the database.
 * @param {string} skillId - The ID for the new skill (e.g., 's_js_basics').
 * @param {Object} skillData - The data for the skill (name, description, prerequisites, difficulty).
 * @returns {Promise<void>}
 */
export async function addSkill(skillId, skillData) {
    try {
        await setDoc(doc(db, 'skills', skillId), skillData);
        console.log("Skill added with ID:", skillId);
    } catch (error) {
        console.error("Error adding skill:", error);
        throw error; // Re-throw to be caught by calling function
    }
}

/**
 * Updates an existing skill in the database.
 * @param {string} skillId - The ID of the skill to update.
 * @param {Object} skillData - The updated data for the skill.
 * @returns {Promise<void>}
 */
export async function updateSkill(skillId, skillData) {
    try {
        await updateDoc(doc(db, 'skills', skillId), skillData);
        console.log("Skill updated with ID:", skillId);
    } catch (error) {
        console.error("Error updating skill:", error);
        throw error;
    }
}

/**
 * Adds a new question to the database.
 * @param {string} questionId - The ID for the new question (e.g., 'q_1678912345').
 * @param {Object} questionData - The data for the question.
 * @returns {Promise<void>}
 */
export async function addQuestion(questionId, questionData) {
    try {
        await setDoc(doc(db, 'questions', questionId), questionData);
        console.log("Question added with ID:", questionId);
    } catch (error) {
        console.error("Error adding question:", error);
        throw error;
    }
}

/**
 * Updates an existing question in the database.
 * @param {string} questionId - The ID of the question to update.
 * @param {Object} questionData - The updated data for the question.
 * @returns {Promise<void>}
 */
export async function updateQuestion(questionId, questionData) {
    try {
        await updateDoc(doc(db, 'questions', questionId), questionData);
        console.log("Question updated with ID:", questionId);
    } catch (error) {
        console.error("Error updating question:", error);
        throw error;
    }
}

/**
 * Adds a new assessment result to the database.
 * @param {Object} assessmentResult - The assessment result object.
 * @returns {Promise<void>}
 */
export async function addAssessmentResult(assessmentResult) {
    try {
        // Firestore automatically creates an ID if addDoc is used without a specific doc(id)
        const docRef = await addDoc(assessmentsCol, assessmentResult);
        console.log("Assessment result added with ID:", docRef.id);
    } catch (error) {
        console.error("Error adding assessment result:", error);
        throw error;
    }
}


/**
 * Seeds the database with sample skills and questions.
 * @returns {Promise<void>}
 */
export async function seedSampleData() {
    const batch = writeBatch(db);

    const sampleSkills = [
        // JavaScript Skills
        {
            id: 's_js_basics',
            name: 'JavaScript',
            description: 'Fundamental concepts of JavaScript programming.',
            prerequisites: [],
            difficulty: 1
        },
        {
            id: 's_dom',
            name: 'DOM Manipulation',
            description: 'Interacting with the Document Object Model.',
            prerequisites: ['s_js_basics'],
            difficulty: 2
        },
        {
            id: 's_async_js',
            name: 'Asynchronous JavaScript',
            description: 'Promises, Async/Await, and event loop.',
            prerequisites: ['s_js_basics'],
            difficulty: 3
        },
        {
            id: 's_react_basics',
            name: 'React.js',
            description: 'Components, Props, State, and JSX.',
            prerequisites: ['s_js_basics', 's_dom'],
            difficulty: 3
        },
        {
            id: 's_nodejs',
            name: 'Node.js',
            description: 'Server-side JavaScript runtime.',
            prerequisites: ['s_js_basics'],
            difficulty: 3
        },
        
        // Python Skills
        {
            id: 's_python_basics',
            name: 'Python',
            description: 'Fundamental concepts of Python programming.',
            prerequisites: [],
            difficulty: 1
        },
        {
            id: 's_django',
            name: 'Django',
            description: 'Python web framework for rapid development.',
            prerequisites: ['s_python_basics'],
            difficulty: 3
        },
        {
            id: 's_flask',
            name: 'Flask',
            description: 'Lightweight Python web framework.',
            prerequisites: ['s_python_basics'],
            difficulty: 2
        },
        {
            id: 's_pandas',
            name: 'Pandas',
            description: 'Data manipulation and analysis library.',
            prerequisites: ['s_python_basics'],
            difficulty: 2
        },
        
        // Java Skills
        {
            id: 's_java_basics',
            name: 'Java',
            description: 'Object-oriented programming with Java.',
            prerequisites: [],
            difficulty: 2
        },
        {
            id: 's_spring',
            name: 'Spring Framework',
            description: 'Enterprise Java application framework.',
            prerequisites: ['s_java_basics'],
            difficulty: 4
        },
        {
            id: 's_hibernate',
            name: 'Hibernate',
            description: 'Java ORM framework for database operations.',
            prerequisites: ['s_java_basics'],
            difficulty: 3
        },
        
        // C++ Skills
        {
            id: 's_cpp_basics',
            name: 'C++',
            description: 'System programming with C++.',
            prerequisites: [],
            difficulty: 3
        },
        {
            id: 's_stl',
            name: 'STL (C++)',
            description: 'Standard Template Library in C++.',
            prerequisites: ['s_cpp_basics'],
            difficulty: 4
        },
        
        // Database Skills
        {
            id: 's_sql',
            name: 'SQL',
            description: 'Structured Query Language for databases.',
            prerequisites: [],
            difficulty: 2
        },
        {
            id: 's_mongodb',
            name: 'MongoDB',
            description: 'NoSQL document database.',
            prerequisites: [],
            difficulty: 2
        },
        {
            id: 's_firebase',
            name: 'Firebase',
            description: 'Google\'s mobile and web application platform.',
            prerequisites: ['s_js_basics'],
            difficulty: 2
        },
        
        // Web Technologies
        {
            id: 's_html',
            name: 'HTML',
            description: 'HyperText Markup Language for web pages.',
            prerequisites: [],
            difficulty: 1
        },
        {
            id: 's_css',
            name: 'CSS',
            description: 'Cascading Style Sheets for web styling.',
            prerequisites: ['s_html'],
            difficulty: 1
        },
        {
            id: 's_angular',
            name: 'Angular',
            description: 'TypeScript-based web application framework.',
            prerequisites: ['s_js_basics', 's_html', 's_css'],
            difficulty: 4
        },
        {
            id: 's_vue',
            name: 'Vue.js',
            description: 'Progressive JavaScript framework.',
            prerequisites: ['s_js_basics', 's_html', 's_css'],
            difficulty: 3
        },
        
        // DevOps & Tools
        {
            id: 's_docker',
            name: 'Docker',
            description: 'Containerization platform.',
            prerequisites: [],
            difficulty: 3
        },
        {
            id: 's_git',
            name: 'Git',
            description: 'Version control system.',
            prerequisites: [],
            difficulty: 2
        },
        {
            id: 's_aws',
            name: 'AWS',
            description: 'Amazon Web Services cloud platform.',
            prerequisites: [],
            difficulty: 4
        }
    ];

    const sampleQuestions = [
        // JavaScript Questions
        {
            id: 'q1',
            text: 'What is the correct way to declare a variable in JavaScript that cannot be reassigned?',
            type: 'mcq',
            options: ['var', 'let', 'const', 'int'],
            correctIndex: 2,
            skillTags: [{ skillId: 's_js_basics', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q2',
            text: 'Which DOM method is used to select an element by its ID?',
            type: 'mcq',
            options: ['querySelector()', 'getElementsByClassName()', 'getElementById()', 'findId()'],
            correctIndex: 2,
            skillTags: [
                { skillId: 's_dom', weight: 1.0 },
                { skillId: 's_js_basics', weight: 0.3 }
            ],
            estimatedTime: 25
        },
        {
            id: 'q3',
            text: 'Explain the purpose of `useState` hook in React.',
            type: 'short',
            correctAnswer: 'useState is a React Hook that lets you add state to functional components. It returns a stateful value and a function to update it.',
            skillTags: [
                { skillId: 's_react_basics', weight: 1.0 },
                { skillId: 's_js_basics', weight: 0.5 }
            ],
            estimatedTime: 60
        },
        {
            id: 'q4',
            text: 'What keyword is used to handle asynchronous operations more cleanly in JavaScript?',
            type: 'short',
            correctAnswer: 'async/await',
            skillTags: [
                { skillId: 's_async_js', weight: 1.0 },
                { skillId: 's_js_basics', weight: 0.5 }
            ],
            estimatedTime: 40
        },
        {
            id: 'q5',
            text: 'How do you prevent the default action of an event?',
            type: 'mcq',
            options: ['event.stopPropagation()', 'event.preventDefault()', 'event.stopAction()', 'event.cancel()'],
            correctIndex: 1,
            skillTags: [{ skillId: 's_dom', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q6',
            text: 'What is the difference between == and === in JavaScript?',
            type: 'short',
            correctAnswer: '== performs type coercion before comparison, while === performs strict comparison without type coercion.',
            skillTags: [{ skillId: 's_js_basics', weight: 1.0 }],
            estimatedTime: 45
        },
        {
            id: 'q7',
            text: 'Which method is used to create a new array from an existing array in JavaScript?',
            type: 'mcq',
            options: ['map()', 'forEach()', 'filter()', 'reduce()'],
            correctIndex: 0,
            skillTags: [{ skillId: 's_js_basics', weight: 1.0 }],
            estimatedTime: 25
        },
        {
            id: 'q8',
            text: 'What is a closure in JavaScript?',
            type: 'short',
            correctAnswer: 'A closure is a function that has access to variables in its outer scope even after the outer function has returned.',
            skillTags: [{ skillId: 's_js_basics', weight: 1.0 }],
            estimatedTime: 60
        },
        {
            id: 'q9',
            text: 'Which Node.js module is used for file system operations?',
            type: 'mcq',
            options: ['fs', 'path', 'os', 'util'],
            correctIndex: 0,
            skillTags: [{ skillId: 's_nodejs', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q10',
            text: 'Explain the concept of event bubbling in JavaScript.',
            type: 'short',
            correctAnswer: 'Event bubbling is when an event propagates from the target element up through its parent elements in the DOM tree.',
            skillTags: [{ skillId: 's_dom', weight: 1.0 }],
            estimatedTime: 50
        },

        // Python Questions
        {
            id: 'q11',
            text: 'What is the correct way to create a list in Python?',
            type: 'mcq',
            options: ['list()', '[]', 'new list()', 'Both A and B'],
            correctIndex: 3,
            skillTags: [{ skillId: 's_python_basics', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q12',
            text: 'Explain the difference between a list and a tuple in Python.',
            type: 'short',
            correctAnswer: 'Lists are mutable (can be modified) while tuples are immutable (cannot be modified after creation).',
            skillTags: [{ skillId: 's_python_basics', weight: 1.0 }],
            estimatedTime: 45
        },
        {
            id: 'q13',
            text: 'Which keyword is used to define a function in Python?',
            type: 'mcq',
            options: ['function', 'def', 'func', 'define'],
            correctIndex: 1,
            skillTags: [{ skillId: 's_python_basics', weight: 1.0 }],
            estimatedTime: 15
        },
        {
            id: 'q14',
            text: 'What is a virtual environment in Python and why is it useful?',
            type: 'short',
            correctAnswer: 'A virtual environment is an isolated Python environment that allows you to manage dependencies for different projects separately.',
            skillTags: [{ skillId: 's_python_basics', weight: 1.0 }],
            estimatedTime: 50
        },
        {
            id: 'q15',
            text: 'Which Django command is used to create a new app?',
            type: 'mcq',
            options: ['django-admin startapp', 'python manage.py startapp', 'django create app', 'Both A and B'],
            correctIndex: 3,
            skillTags: [{ skillId: 's_django', weight: 1.0 }],
            estimatedTime: 25
        },
        {
            id: 'q16',
            text: 'Explain the MVC pattern in Django.',
            type: 'short',
            correctAnswer: 'Django uses MVT (Model-View-Template) pattern where Models handle data, Views handle logic, and Templates handle presentation.',
            skillTags: [{ skillId: 's_django', weight: 1.0 }],
            estimatedTime: 60
        },
        {
            id: 'q17',
            text: 'Which Flask decorator is used to define routes?',
            type: 'mcq',
            options: ['@route', '@app.route', '@flask.route', '@url'],
            correctIndex: 1,
            skillTags: [{ skillId: 's_flask', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q18',
            text: 'What is the purpose of pandas in Python?',
            type: 'short',
            correctAnswer: 'Pandas is a library for data manipulation and analysis, providing data structures like DataFrames for handling structured data.',
            skillTags: [{ skillId: 's_pandas', weight: 1.0 }],
            estimatedTime: 45
        },
        {
            id: 'q19',
            text: 'Which method is used to read a CSV file in pandas?',
            type: 'mcq',
            options: ['read_csv()', 'load_csv()', 'import_csv()', 'open_csv()'],
            correctIndex: 0,
            skillTags: [{ skillId: 's_pandas', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q20',
            text: 'Explain list comprehension in Python with an example.',
            type: 'short',
            correctAnswer: 'List comprehension is a concise way to create lists. Example: [x*2 for x in range(5)] creates [0, 2, 4, 6, 8].',
            skillTags: [{ skillId: 's_python_basics', weight: 1.0 }],
            estimatedTime: 50
        },

        // Java Questions
        {
            id: 'q21',
            text: 'What is the main difference between an interface and an abstract class in Java?',
            type: 'short',
            correctAnswer: 'An interface can only have abstract methods and constants, while an abstract class can have both abstract and concrete methods.',
            skillTags: [{ skillId: 's_java_basics', weight: 1.0 }],
            estimatedTime: 60
        },
        {
            id: 'q22',
            text: 'Which keyword is used to inherit from a class in Java?',
            type: 'mcq',
            options: ['extends', 'implements', 'inherits', 'super'],
            correctIndex: 0,
            skillTags: [{ skillId: 's_java_basics', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q23',
            text: 'What is the purpose of the Spring Framework?',
            type: 'short',
            correctAnswer: 'Spring Framework provides infrastructure support for developing Java applications, including dependency injection and aspect-oriented programming.',
            skillTags: [{ skillId: 's_spring', weight: 1.0 }],
            estimatedTime: 55
        },
        {
            id: 'q24',
            text: 'Which annotation is used for dependency injection in Spring?',
            type: 'mcq',
            options: ['@Autowired', '@Inject', '@Resource', '@Component'],
            correctIndex: 0,
            skillTags: [{ skillId: 's_spring', weight: 1.0 }],
            estimatedTime: 25
        },
        {
            id: 'q25',
            text: 'Explain the concept of Hibernate ORM.',
            type: 'short',
            correctAnswer: 'Hibernate is an ORM framework that maps Java objects to database tables, providing automatic persistence and query capabilities.',
            skillTags: [{ skillId: 's_hibernate', weight: 1.0 }],
            estimatedTime: 60
        },
        {
            id: 'q26',
            text: 'What is the difference between checked and unchecked exceptions in Java?',
            type: 'short',
            correctAnswer: 'Checked exceptions must be handled or declared, while unchecked exceptions (RuntimeExceptions) do not require explicit handling.',
            skillTags: [{ skillId: 's_java_basics', weight: 1.0 }],
            estimatedTime: 50
        },
        {
            id: 'q27',
            text: 'Which collection interface extends Iterable in Java?',
            type: 'mcq',
            options: ['List', 'Set', 'Map', 'All of the above'],
            correctIndex: 2,
            skillTags: [{ skillId: 's_java_basics', weight: 1.0 }],
            estimatedTime: 25
        },
        {
            id: 'q28',
            text: 'What is the purpose of the @Entity annotation in Hibernate?',
            type: 'short',
            correctAnswer: '@Entity marks a class as a JPA entity, indicating it should be mapped to a database table.',
            skillTags: [{ skillId: 's_hibernate', weight: 1.0 }],
            estimatedTime: 40
        },
        {
            id: 'q29',
            text: 'Which design pattern does Spring use for dependency injection?',
            type: 'mcq',
            options: ['Singleton', 'Factory', 'Observer', 'Strategy'],
            correctIndex: 1,
            skillTags: [{ skillId: 's_spring', weight: 1.0 }],
            estimatedTime: 30
        },
        {
            id: 'q30',
            text: 'Explain the concept of garbage collection in Java.',
            type: 'short',
            correctAnswer: 'Garbage collection automatically manages memory by identifying and removing objects that are no longer referenced by the program.',
            skillTags: [{ skillId: 's_java_basics', weight: 1.0 }],
            estimatedTime: 55
        },

        // C++ Questions
        {
            id: 'q31',
            text: 'What is the difference between new and malloc in C++?',
            type: 'short',
            correctAnswer: 'new calls constructors and returns typed pointers, while malloc only allocates memory and returns void pointers.',
            skillTags: [{ skillId: 's_cpp_basics', weight: 1.0 }],
            estimatedTime: 50
        },
        {
            id: 'q32',
            text: 'Which operator is used for dynamic memory allocation in C++?',
            type: 'mcq',
            options: ['new', 'malloc', 'alloc', 'create'],
            correctIndex: 0,
            skillTags: [{ skillId: 's_cpp_basics', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q33',
            text: 'What is a template in C++?',
            type: 'short',
            correctAnswer: 'A template is a blueprint for creating generic functions or classes that work with different data types.',
            skillTags: [{ skillId: 's_cpp_basics', weight: 1.0 }],
            estimatedTime: 45
        },
        {
            id: 'q34',
            text: 'Which STL container provides constant time insertion and deletion at both ends?',
            type: 'mcq',
            options: ['vector', 'deque', 'list', 'set'],
            correctIndex: 1,
            skillTags: [{ skillId: 's_stl', weight: 1.0 }],
            estimatedTime: 25
        },
        {
            id: 'q35',
            text: 'Explain the concept of RAII in C++.',
            type: 'short',
            correctAnswer: 'RAII (Resource Acquisition Is Initialization) ensures resources are properly managed by tying their lifetime to object lifetime.',
            skillTags: [{ skillId: 's_cpp_basics', weight: 1.0 }],
            estimatedTime: 60
        },
        {
            id: 'q36',
            text: 'What is the purpose of the virtual keyword in C++?',
            type: 'short',
            correctAnswer: 'The virtual keyword enables polymorphism by allowing derived classes to override base class methods.',
            skillTags: [{ skillId: 's_cpp_basics', weight: 1.0 }],
            estimatedTime: 50
        },
        {
            id: 'q37',
            text: 'Which STL algorithm is used to sort a container?',
            type: 'mcq',
            options: ['sort()', 'order()', 'arrange()', 'rank()'],
            correctIndex: 0,
            skillTags: [{ skillId: 's_stl', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q38',
            text: 'What is the difference between a reference and a pointer in C++?',
            type: 'short',
            correctAnswer: 'References must be initialized and cannot be reassigned, while pointers can be null and reassigned.',
            skillTags: [{ skillId: 's_cpp_basics', weight: 1.0 }],
            estimatedTime: 45
        },
        {
            id: 'q39',
            text: 'Which container is best for frequent insertions and deletions in the middle?',
            type: 'mcq',
            options: ['vector', 'deque', 'list', 'array'],
            correctIndex: 2,
            skillTags: [{ skillId: 's_stl', weight: 1.0 }],
            estimatedTime: 25
        },
        {
            id: 'q40',
            text: 'Explain the concept of smart pointers in C++.',
            type: 'short',
            correctAnswer: 'Smart pointers automatically manage memory by providing automatic cleanup when objects go out of scope.',
            skillTags: [{ skillId: 's_cpp_basics', weight: 1.0 }],
            estimatedTime: 55
        },

        // Database Questions
        {
            id: 'q41',
            text: 'What does SQL stand for?',
            type: 'mcq',
            options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language'],
            correctIndex: 0,
            skillTags: [{ skillId: 's_sql', weight: 1.0 }],
            estimatedTime: 15
        },
        {
            id: 'q42',
            text: 'Explain the difference between INNER JOIN and LEFT JOIN in SQL.',
            type: 'short',
            correctAnswer: 'INNER JOIN returns only matching records from both tables, while LEFT JOIN returns all records from the left table and matching records from the right table.',
            skillTags: [{ skillId: 's_sql', weight: 1.0 }],
            estimatedTime: 60
        },
        {
            id: 'q43',
            text: 'Which SQL command is used to modify existing records?',
            type: 'mcq',
            options: ['UPDATE', 'MODIFY', 'CHANGE', 'ALTER'],
            correctIndex: 0,
            skillTags: [{ skillId: 's_sql', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q44',
            text: 'What is the purpose of an index in a database?',
            type: 'short',
            correctAnswer: 'An index improves query performance by providing faster access to data based on indexed columns.',
            skillTags: [{ skillId: 's_sql', weight: 1.0 }],
            estimatedTime: 40
        },
        {
            id: 'q45',
            text: 'Which type of database is MongoDB?',
            type: 'mcq',
            options: ['Relational', 'NoSQL', 'Object-oriented', 'Hierarchical'],
            correctIndex: 1,
            skillTags: [{ skillId: 's_mongodb', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q46',
            text: 'Explain the concept of ACID properties in databases.',
            type: 'short',
            correctAnswer: 'ACID stands for Atomicity, Consistency, Isolation, and Durability - properties that ensure reliable database transactions.',
            skillTags: [{ skillId: 's_sql', weight: 1.0 }],
            estimatedTime: 60
        },
        {
            id: 'q47',
            text: 'What is a primary key in a database table?',
            type: 'short',
            correctAnswer: 'A primary key is a unique identifier for each record in a table that cannot be null and must be unique.',
            skillTags: [{ skillId: 's_sql', weight: 1.0 }],
            estimatedTime: 40
        },
        {
            id: 'q48',
            text: 'Which Firebase service is used for real-time database?',
            type: 'mcq',
            options: ['Firestore', 'Realtime Database', 'Cloud Storage', 'Authentication'],
            correctIndex: 1,
            skillTags: [{ skillId: 's_firebase', weight: 1.0 }],
            estimatedTime: 25
        },
        {
            id: 'q49',
            text: 'What is the difference between SQL and NoSQL databases?',
            type: 'short',
            correctAnswer: 'SQL databases use structured schemas and ACID properties, while NoSQL databases are more flexible and use different data models.',
            skillTags: [
                { skillId: 's_sql', weight: 0.5 },
                { skillId: 's_mongodb', weight: 0.5 }
            ],
            estimatedTime: 60
        },
        {
            id: 'q50',
            text: 'Which MongoDB method is used to find documents?',
            type: 'mcq',
            options: ['find()', 'search()', 'query()', 'get()'],
            correctIndex: 0,
            skillTags: [{ skillId: 's_mongodb', weight: 1.0 }],
            estimatedTime: 20
        },

        // Web Technologies Questions
        {
            id: 'q51',
            text: 'What does HTML stand for?',
            type: 'mcq',
            options: ['HyperText Markup Language', 'High-level Text Markup Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
            correctIndex: 0,
            skillTags: [{ skillId: 's_html', weight: 1.0 }],
            estimatedTime: 15
        },
        {
            id: 'q52',
            text: 'Explain the box model in CSS.',
            type: 'short',
            correctAnswer: 'The CSS box model consists of content, padding, border, and margin areas that make up the total space an element occupies.',
            skillTags: [{ skillId: 's_css', weight: 1.0 }],
            estimatedTime: 50
        },
        {
            id: 'q53',
            text: 'Which HTML tag is used to create a hyperlink?',
            type: 'mcq',
            options: ['<link>', '<a>', '<href>', '<url>'],
            correctIndex: 1,
            skillTags: [{ skillId: 's_html', weight: 1.0 }],
            estimatedTime: 15
        },
        {
            id: 'q54',
            text: 'What is the purpose of CSS flexbox?',
            type: 'short',
            correctAnswer: 'Flexbox is a layout method that allows flexible and efficient arrangement of items in a container, especially for responsive design.',
            skillTags: [{ skillId: 's_css', weight: 1.0 }],
            estimatedTime: 45
        },
        {
            id: 'q55',
            text: 'Which Angular directive is used for two-way data binding?',
            type: 'mcq',
            options: ['ng-model', 'ng-bind', 'ng-two-way', 'ngModel'],
            correctIndex: 3,
            skillTags: [{ skillId: 's_angular', weight: 1.0 }],
            estimatedTime: 25
        },
        {
            id: 'q56',
            text: 'Explain the concept of components in Vue.js.',
            type: 'short',
            correctAnswer: 'Components in Vue.js are reusable Vue instances with a name, allowing you to build large applications with small, self-contained pieces.',
            skillTags: [{ skillId: 's_vue', weight: 1.0 }],
            estimatedTime: 55
        },
        {
            id: 'q57',
            text: 'What is the purpose of CSS Grid?',
            type: 'short',
            correctAnswer: 'CSS Grid is a two-dimensional layout system that allows you to create complex layouts with rows and columns.',
            skillTags: [{ skillId: 's_css', weight: 1.0 }],
            estimatedTime: 45
        },
        {
            id: 'q58',
            text: 'Which HTML5 semantic element is used for navigation?',
            type: 'mcq',
            options: ['<nav>', '<menu>', '<navigation>', '<navigate>'],
            correctIndex: 0,
            skillTags: [{ skillId: 's_html', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q59',
            text: 'What is the difference between Angular and React?',
            type: 'short',
            correctAnswer: 'Angular is a full framework with built-in features, while React is a library focused on UI components. Angular uses TypeScript by default.',
            skillTags: [
                { skillId: 's_angular', weight: 0.5 },
                { skillId: 's_react_basics', weight: 0.5 }
            ],
            estimatedTime: 60
        },
        {
            id: 'q60',
            text: 'Which CSS property is used to change text color?',
            type: 'mcq',
            options: ['text-color', 'color', 'font-color', 'text-style'],
            correctIndex: 1,
            skillTags: [{ skillId: 's_css', weight: 1.0 }],
            estimatedTime: 15
        },

        // DevOps & Tools Questions
        {
            id: 'q61',
            text: 'What is Docker and what problem does it solve?',
            type: 'short',
            correctAnswer: 'Docker is a containerization platform that packages applications and their dependencies into containers, solving deployment consistency issues.',
            skillTags: [{ skillId: 's_docker', weight: 1.0 }],
            estimatedTime: 60
        },
        {
            id: 'q62',
            text: 'Which Git command is used to create a new branch?',
            type: 'mcq',
            options: ['git new branch', 'git create branch', 'git checkout -b', 'git branch new'],
            correctIndex: 2,
            skillTags: [{ skillId: 's_git', weight: 1.0 }],
            estimatedTime: 25
        },
        {
            id: 'q63',
            text: 'Explain the concept of Infrastructure as Code (IaC).',
            type: 'short',
            correctAnswer: 'IaC is the practice of managing and provisioning infrastructure through code rather than manual processes, enabling version control and automation.',
            skillTags: [{ skillId: 's_aws', weight: 1.0 }],
            estimatedTime: 55
        },
        {
            id: 'q64',
            text: 'What is the purpose of a Dockerfile?',
            type: 'short',
            correctAnswer: 'A Dockerfile is a text file containing instructions to build a Docker image, defining the environment and dependencies for an application.',
            skillTags: [{ skillId: 's_docker', weight: 1.0 }],
            estimatedTime: 50
        },
        {
            id: 'q65',
            text: 'Which AWS service is used for virtual servers?',
            type: 'mcq',
            options: ['S3', 'EC2', 'Lambda', 'RDS'],
            correctIndex: 1,
            skillTags: [{ skillId: 's_aws', weight: 1.0 }],
            estimatedTime: 25
        },
        {
            id: 'q66',
            text: 'What is the difference between Git and GitHub?',
            type: 'short',
            correctAnswer: 'Git is a version control system, while GitHub is a cloud-based platform that hosts Git repositories and provides collaboration features.',
            skillTags: [{ skillId: 's_git', weight: 1.0 }],
            estimatedTime: 45
        },
        {
            id: 'q67',
            text: 'Which Docker command is used to run a container?',
            type: 'mcq',
            options: ['docker start', 'docker run', 'docker execute', 'docker launch'],
            correctIndex: 1,
            skillTags: [{ skillId: 's_docker', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q68',
            text: 'What is the purpose of AWS Lambda?',
            type: 'short',
            correctAnswer: 'AWS Lambda is a serverless computing service that runs code in response to events without managing servers.',
            skillTags: [{ skillId: 's_aws', weight: 1.0 }],
            estimatedTime: 50
        },
        {
            id: 'q69',
            text: 'Which Git command is used to stage changes?',
            type: 'mcq',
            options: ['git stage', 'git add', 'git commit', 'git push'],
            correctIndex: 1,
            skillTags: [{ skillId: 's_git', weight: 1.0 }],
            estimatedTime: 20
        },
        {
            id: 'q70',
            text: 'Explain the concept of microservices architecture.',
            type: 'short',
            correctAnswer: 'Microservices is an architectural approach where applications are built as a collection of loosely coupled, independently deployable services.',
            skillTags: [{ skillId: 's_docker', weight: 0.5 }, { skillId: 's_aws', weight: 0.5 }],
            estimatedTime: 60
        }
    ];


    // Add skills to batch
    sampleSkills.forEach(skill => {
        const skillDocRef = doc(db, 'skills', skill.id);
        batch.set(skillDocRef, {
            name: skill.name,
            description: skill.description,
            prerequisites: skill.prerequisites,
            difficulty: skill.difficulty
        });
    });

    // Add questions to batch
    sampleQuestions.forEach(question => {
        const questionDocRef = doc(db, 'questions', question.id);
        batch.set(questionDocRef, {
            text: question.text,
            type: question.type,
            options: question.options || [],
            correctIndex: question.correctIndex !== undefined ? question.correctIndex : null,
            correctAnswer: question.correctAnswer || null,
            skillTags: question.skillTags,
            estimatedTime: question.estimatedTime
        });
    });

    await batch.commit();
    console.log("Sample data seeded successfully!");
}

/**
 * Clears all data from the 'skills', 'questions', and 'assessments' collections.
 * Use with extreme caution!
 * @returns {Promise<void>}
 */
export async function clearAllData() {
    const batch = writeBatch(db);

    const collectionsToClear = [skillsCol, questionsCol, assessmentsCol];

    for (const colRef of collectionsToClear) {
        const snapshot = await getDocs(colRef);
        snapshot.docs.forEach(doc => {
            // Create a proper doc reference for deletion
            const docRef = doc.ref || doc(db, colRef.name, doc.id);
            batch.delete(docRef);
        });
    }

    await batch.commit();
    console.log("All data cleared successfully!");
}