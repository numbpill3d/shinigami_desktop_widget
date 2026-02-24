// CUSTOM PERIODIC QUESTIONS
// Add this array to main.js in the sendPeriodicQuestion() function
// to customize the questions your Shinigami companion asks you

const CUSTOM_QUESTIONS = [
    // === PRODUCTIVITY & WORK ===
    "What are you working on right now?",
    "How's your energy level? Need a break?",
    "Making progress on your current task?",
    "Feeling stuck on something?",
    "Time to step away from the screen?",
    "What's your next milestone?",
    "Need help breaking down a problem?",
    
    // === CREATIVITY & LEARNING ===
    "Discovered anything cool lately?",
    "What rabbit hole are you diving into?",
    "Any new ideas percolating?",
    "What did you learn today?",
    "Found any interesting techniques?",
    "What's inspiring you right now?",
    
    // === TECHNICAL & DEBUGGING ===
    "Any demons to debug?",
    "How's the code coming along?",
    "Stack trace clean or chaotic?",
    "Need a rubber duck to talk through it?",
    "What's the most confusing part?",
    "Time to refactor or keep pushing?",
    
    // === WELLBEING & MENTAL STATE ===
    "Still breathing? Just checking.",
    "How's the flow state?",
    "What's the vibe right now?",
    "Time for coffee... or something stronger?",
    "When did you last stand up?",
    "Eyes tired yet?",
    "Remember to hydrate, mortal.",
    
    // === PHILOSOPHICAL & CRYPTIC ===
    "What brings meaning to this moment?",
    "Following intuition or logic today?",
    "What would future you thank you for?",
    "Chasing perfection or embracing chaos?",
    "What's worth preserving from today?",
    "Building or breaking today?",
    
    // === PLAYFUL & DARK HUMOR ===
    "Should I be worried about you?",
    "Found the bug or did it find you?",
    "Winning against the machine?",
    "How many tabs are open right now?",
    "Living dangerously or playing it safe?",
    "Reality check: are you in too deep?",
    
    // === PROJECT-SPECIFIC ===
    "How's that side project treating you?",
    "Making art or making problems?",
    "Circuit working or smoking?",
    "Documentation up to date? (I already know the answer)",
    "Testing in production again?",
    
    // === HACKER/MAKER SPECIFIC ===
    "What's burning on the workbench?",
    "Solder fumes getting to you yet?",
    "Flash the firmware or flash yourself?",
    "E-waste rescue mission going well?",
    "Root access achieved or still trying?",
    "Which SDK is making you rage today?",
    
    // === TIME-BASED SUGGESTIONS ===
    "Been at this for hours. Time to pause?",
    "Quick stretch break?",
    "Window's open? Fresh air helps.",
    "Last save was 47 minutes ago...",
    "Git commit before you forget?",
    
    // === ENCOURAGEMENT ===
    "You're closer than you think.",
    "This problem has a solution.",
    "Progress isn't always visible.",
    "Small steps still move you forward.",
    "The struggle means you're learning."
];

// === MOOD-BASED QUESTIONS ===
// These could be triggered based on time of day or user interaction patterns

const MORNING_QUESTIONS = [
    "What's the plan for today?",
    "Coffee acquired?",
    "Ready to face the void?",
    "What's the first battle?"
];

const AFTERNOON_QUESTIONS = [
    "Lunch happened or still grinding?",
    "How's the afternoon treating you?",
    "Energy holding up?",
    "Progress report?"
];

const EVENING_QUESTIONS = [
    "Ready to call it?",
    "Document what you learned?",
    "Tomorrow's you will thank you for stopping now.",
    "Time to rest, mortal."
];

const LATE_NIGHT_QUESTIONS = [
    "Still here? Respect.",
    "Define 'healthy sleep schedule'.",
    "The code will still be there tomorrow.",
    "How deep in the zone are you?",
    "This better be worth it."
];

// === CONTEXT-AWARE QUESTIONS ===
// These could be triggered based on specific conditions

const ERROR_RECOVERY = [
    "That crash looked painful. You good?",
    "Segfault survivor badge unlocked.",
    "Let's talk through it.",
    "Want me to search for that error?"
];

const LONG_IDLE = [
    "You still there?",
    "Gone to touch grass?",
    "System check: user responsive?",
    "Stepped away or stuck in thought?"
];

const HEAVY_ACTIVITY = [
    "You're on fire today.",
    "Productivity mode: activated.",
    "This is the flow state I like to see.",
    "Keep this momentum going?"
];

// === USAGE INSTRUCTIONS ===
// 
// 1. Choose questions you like from above
// 2. Open main.js
// 3. Find the sendPeriodicQuestion() function
// 4. Replace or add to the questions array
// 5. Restart the application
//
// ADVANCED:
// - Implement time-based logic using Date objects
// - Track user activity to choose appropriate questions
// - Add custom triggers based on system events
// - Create personality modes with different question sets
