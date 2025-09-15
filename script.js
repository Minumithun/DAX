// Game State Management
let gameState = {
    playerName: '',
    totalPoints: 0,
    totalLines: 0,
    badges: {
        basics: false,
        aggregation: false,
        filtering: false,
        time: false,
        relationships: false,
        advanced: false
    },
    moduleProgress: {
        basics: 0,
        aggregation: 0,
        filtering: 0,
        time: 0,
        relationships: 0,
        advanced: 0
    },
    completedChallenges: new Set(),
    gameCompleted: false,
    completionDate: null
};

// Module Configuration
const moduleConfig = {
    basics: { challenges: 5, points: [50, 50, 75, 75, 75], badge: 'basics', lines: 5 },
    aggregation: { challenges: 4, points: [100, 75, 100, 125], badge: 'aggregation', lines: 8 },
    filtering: { challenges: 5, points: [150, 150, 150, 175, 175], badge: 'filtering', lines: 15 },
    time: { challenges: 4, points: [200, 200, 225, 225], badge: 'time', lines: 20 },
    relationships: { challenges: 3, points: [150, 175, 200], badge: 'relationships', lines: 12 },
    advanced: { challenges: 4, points: [250, 200, 275, 300], badge: 'advanced', lines: 25 }
};

// Badge names
const badgeNames = {
    basics: 'DAX Apprentice',
    aggregation: 'Calculation Master',
    filtering: 'Filter Ninja',
    time: 'Time Wizard',
    relationships: 'Relationship Expert',
    advanced: 'DAX Grandmaster'
};

// Initialize Game
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧮 DAX Mastery Quest Loading...');
    initializeGame();
});

function initializeGame() {
    loadGameState();
    setupEventListeners();
    updateAllUI();
    showNotification('Welcome to DAX Mastery Quest! 🧮', 'success');
    initializePrism();
    console.log('✅ Game initialized successfully');
}

// Initialize Prism.js for syntax highlighting
function initializePrism() {
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const module = this.getAttribute('data-module');
            switchModule(module);
        });
    });

    // Player name input
    const playerNameInput = document.getElementById('playerName');
    if (playerNameInput) {
        playerNameInput.addEventListener('input', function() {
            gameState.playerName = this.value;
            saveGameState();
            updateCertificateButton();
        });
        
        if (gameState.playerName) {
            playerNameInput.value = gameState.playerName;
        }
    }

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', showResetConfirmation);

    // Certificate button
    document.getElementById('certificateBtn').addEventListener('click', showCertificateModal);

    // Copy code buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-btn') || e.target.parentElement.classList.contains('copy-btn')) {
            const button = e.target.classList.contains('copy-btn') ? e.target : e.target.parentElement;
            copyCode(button);
        }
    });

    console.log('✅ Event listeners setup complete');
}

// Module Navigation
function switchModule(moduleId) {
    console.log(`🔄 Switching to module: ${moduleId}`);
    
    // Hide all modules
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });
    
    // Show target module
    const targetModule = document.getElementById(moduleId);
    if (targetModule) {
        targetModule.classList.add('active');
        
        // Re-highlight code blocks in the active module
        setTimeout(() => {
            if (typeof Prism !== 'undefined') {
                Prism.highlightAllUnder(targetModule);
            }
        }, 100);
    }
    
    // Update navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-module="${moduleId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Challenge Completion
function completeChallenge(button) {
    const challenge = button.closest('.challenge');
    const challengeNumber = challenge.getAttribute('data-challenge');
    const moduleType = challenge.getAttribute('data-module');
    const challengeId = `${moduleType}-${challengeNumber}`;
    
    // Check if already completed
    if (gameState.completedChallenges.has(challengeId)) {
        showNotification('Challenge already completed! ✅', 'success');
        return;
    }
    
    // Mark challenge as completed
    gameState.completedChallenges.add(challengeId);
    challenge.classList.add('completed');
    
    // Add points and lines
    const config = moduleConfig[moduleType];
    const points = config.points[parseInt(challengeNumber) - 1] || 100;
    const linesAdded = Math.floor(Math.random() * 5) + 3; // 3-7 lines per challenge
    
    gameState.totalPoints += points;
    gameState.totalLines += linesAdded;
    
    // Update module progress
    gameState.moduleProgress[moduleType]++;
    
    // Show points notification
    showNotification(`+${points} points earned! 🌟 ${linesAdded} lines coded!`, 'points');
    
    // Check for badge unlock
    checkBadgeUnlock(moduleType);
    
    // Update UI
    updateAllUI();
    
    // Save progress
    saveGameState();
    
    // Check game completion
    checkGameCompletion();
    
    console.log(`✅ Challenge completed: ${challengeId}, Points: ${points}, Lines: ${linesAdded}`);
}

// Copy Code Functionality
function copyCode(button) {
    const codeContainer = button.closest('.code-container');
    const codeElement = codeContainer.querySelector('code');
    const text = codeElement.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Update button text temporarily
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.background = 'rgba(39, 174, 96, 0.3)';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = 'rgba(255,255,255,0.1)';
        }, 2000);
        
        showNotification('Code copied to clipboard! 📋', 'success');
    }).catch(err => {
        console.error('Failed to copy code:', err);
        showNotification('Failed to copy code', 'error');
    });
}

// Badge System
function checkBadgeUnlock(moduleType) {
    const config = moduleConfig[moduleType];
    if (!config) return;
    
    const progress = gameState.moduleProgress[moduleType];
    const required = config.challenges;
    
    if (progress >= required && !gameState.badges[config.badge]) {
        unlockBadge(config.badge);
    }
}

function unlockBadge(badgeId) {
    gameState.badges[badgeId] = true;
    
    const badgeElement = document.getElementById(`badge-${badgeId}`);
    if (badgeElement) {
        badgeElement.classList.remove('locked');
        badgeElement.classList.add('unlocked');
    }
    
    // Show badge unlock notification
    showNotification(`🏆 Badge Unlocked: ${badgeNames[badgeId]}!`, 'badge');
    
    // Show module success message
    const successElement = document.getElementById(`${badgeId}Success`);
    if (successElement) {
        successElement.style.display = 'block';
    }
    
    // Create confetti effect
    createConfetti();
    
    console.log(`🏆 Badge unlocked: ${badgeId}`);
}

// UI Updates
function updateAllUI() {
    updateStatsDisplay();
    updateBadgesDisplay();
    updateProgressDisplay();
    updateModuleProgress();
    updateCertificateButton();
}

function updateStatsDisplay() {
    document.getElementById('totalPoints').textContent = gameState.totalPoints;
    document.getElementById('totalLines').textContent = gameState.totalLines;
    document.getElementById('finalPointsDisplay').textContent = gameState.totalPoints;
    document.getElementById('finalLines').textContent = gameState.totalLines;
}

function updateBadgesDisplay() {
    const unlockedCount = Object.values(gameState.badges).filter(badge => badge).length;
    document.getElementById('badgeCount').textContent = unlockedCount;
    
    // Update badge appearances
    Object.keys(gameState.badges).forEach(badgeId => {
        const badgeElement = document.getElementById(`badge-${badgeId}`);
        if (badgeElement) {
            if (gameState.badges[badgeId]) {
                badgeElement.classList.remove('locked');
                badgeElement.classList.add('unlocked');
            }
        }
    });
}

function updateProgressDisplay() {
    const totalChallenges = Object.values(moduleConfig).reduce((sum, config) => sum + config.challenges, 0);
    const completedChallenges = gameState.completedChallenges.size;
    const progressPercentage = (completedChallenges / totalChallenges) * 100;
    
    document.getElementById('overallProgress').style.width = `${progressPercentage}%`;
    document.getElementById('progressText').textContent = `${Math.round(progressPercentage)}% Complete`;
}

function updateModuleProgress() {
    Object.keys(moduleConfig).forEach(moduleType => {
        const config = moduleConfig[moduleType];
        const progress = gameState.moduleProgress[moduleType];
        const percentage = (progress / config.challenges) * 100;
        
        // Update progress bar
        const progressBar = document.getElementById(`${moduleType}Progress`);
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        // Update status text
        const statusElement = document.getElementById(`${moduleType}Status`);
        if (statusElement) {
            statusElement.textContent = `${progress}/${config.challenges} Challenges Complete`;
        }
    });
}

function updateCertificateButton() {
    const allBadgesUnlocked = Object.values(gameState.badges).every(badge => badge);
    const hasName = gameState.playerName && gameState.playerName.trim();
    const certificateBtn = document.getElementById('certificateBtn');
    
    if (certificateBtn) {
        if (allBadgesUnlocked && hasName) {
            certificateBtn.style.display = 'flex';
        } else {
            certificateBtn.style.display = 'none';
        }
    }
}

// Game Completion Check
function checkGameCompletion() {
    const allBadgesUnlocked = Object.values(gameState.badges).every(badge => badge);
    
    if (allBadgesUnlocked && !gameState.gameCompleted) {
        gameState.gameCompleted = true;
        gameState.completionDate = new Date().toISOString();
        
        // Show final celebration
        const finalCelebration = document.getElementById('finalCelebration');
        if (finalCelebration) {
            finalCelebration.style.display = 'block';
        }
        
        // Show advanced success
        const advancedSuccess = document.getElementById('advancedSuccess');
        if (advancedSuccess) {
            advancedSuccess.style.display = 'block';
        }
        
        // Massive confetti
        for (let i = 0; i < 100; i++) {
            setTimeout(() => createConfetti(), i * 50);
        }
        
        showNotification('🎉 DAX Quest Completed! You are now a DAX Grandmaster!', 'success');
        saveGameState();
    }
}

// Visual Effects
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a0e7e5', '#ffeaa7', '#fd79a8'];
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.position = 'fixed';
        confetti.style.zIndex = '1000';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 4000);
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// Reset Functionality
function showResetConfirmation() {
    const confirmed = confirm(
        '🔄 Are you sure you want to reset your DAX quest progress?\n\n' +
        'This will:\n' +
        '• Reset all points and coded lines to 0\n' +
        '• Remove all badges\n' +
        '• Mark all challenges as incomplete\n' +
        '• Clear completion status\n\n' +
        'This action cannot be undone!'
    );
    
    if (confirmed) {
        resetGame();
    }
}

function resetGame() {
    // Reset game state
    gameState = {
        playerName: document.getElementById('playerName').value || '',
        totalPoints: 0,
        totalLines: 0,
        badges: {
            basics: false,
            aggregation: false,
            filtering: false,
            time: false,
            relationships: false,
            advanced: false
        },
        moduleProgress: {
            basics: 0,
            aggregation: 0,
            filtering: 0,
            time: 0,
            relationships: 0,
            advanced: 0
        },
        completedChallenges: new Set(),
        gameCompleted: false,
        completionDate: null
    };
    
    // Reset UI elements
    document.querySelectorAll('.challenge').forEach(challenge => {
        challenge.classList.remove('completed');
    });
    
    document.querySelectorAll('.badge').forEach(badge => {
        badge.classList.remove('unlocked');
        badge.classList.add('locked');
    });
    
    document.querySelectorAll('.success-box').forEach(box => {
        box.style.display = 'none';
    });
    
    const finalCelebration = document.getElementById('finalCelebration');
    if (finalCelebration) {
        finalCelebration.style.display = 'none';
    }
    
    // Update UI and save
    updateAllUI();
    saveGameState();
    
    // Go to overview
    switchModule('overview');
    
    showNotification('🧮 DAX Quest reset successfully! Start coding again!', 'success');
    console.log('🔄 Game reset completed');
}

// Save/Load System
function saveGameState() {
    try {
        const stateToSave = {
            ...gameState,
            completedChallenges: Array.from(gameState.completedChallenges)
        };
        localStorage.setItem('dax-quest-state', JSON.stringify(stateToSave));
    } catch (error) {
        console.error('Failed to save game state:', error);
    }
}

function loadGameState() {
    try {
        const savedState = localStorage.getItem('dax-quest-state');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            gameState = {
                ...gameState,
                ...parsedState,
                completedChallenges: new Set(parsedState.completedChallenges || [])
            };
            
            // Restore completed challenges visually
            gameState.completedChallenges.forEach(challengeId => {
                const [moduleType, challengeNumber] = challengeId.split('-');
                const challengeElement = document.querySelector(`[data-challenge="${challengeNumber}"][data-module="${moduleType}"]`);
                if (challengeElement) {
                    challengeElement.classList.add('completed');
                }
            });
            
            // Restore success messages for completed modules
            Object.keys(gameState.badges).forEach(badgeId => {
                if (gameState.badges[badgeId]) {
                    const successElement = document.getElementById(`${badgeId}Success`);
                    if (successElement) {
                        successElement.style.display = 'block';
                    }
                }
            });
            
            // Show final celebration if game completed
            if (gameState.gameCompleted) {
                const finalCelebration = document.getElementById('finalCelebration');
                if (finalCelebration) {
                    finalCelebration.style.display = 'block';
                }
            }
            
            console.log('✅ Game state loaded successfully');
        }
    } catch (error) {
        console.error('Failed to load game state:', error);
    }
}

// Certificate System
function showCertificateModal() {
    if (!gameState.playerName || !gameState.playerName.trim()) {
        alert('Please enter your name in the header to generate your certificate!');
        document.getElementById('playerName').focus();
        return;
    }
    
    if (!Object.values(gameState.badges).every(badge => badge)) {
        alert('Complete all modules and earn all badges to unlock your certificate!');
        return;
    }
    
    // Update certificate content
    updateCertificateData();
    
    // Show modal
    document.getElementById('certificateModal').style.display = 'flex';
}

function closeCertificateModal() {
    document.getElementById('certificateModal').style.display = 'none';
}

function generateCertificate() {
    if (!gameState.playerName || !gameState.playerName.trim()) {
        alert('Please enter your name in the header first!');
        return;
    }
    
    showCertificateModal();
}

function updateCertificateData() {
    document.getElementById('certificateName').textContent = gameState.playerName;
    document.getElementById('certificateDate').textContent = new Date().toLocaleDateString();
    document.getElementById('certChallenges').textContent = gameState.completedChallenges.size;
    document.getElementById('certLines').textContent = gameState.totalLines;
    document.getElementById('certScore').textContent = gameState.totalPoints;
}

function downloadCertificateAsPDF() {
    if (typeof window.jsPDF === 'undefined') {
        alert('PDF library not loaded. Please try refreshing the page.');
        return;
    }
    
    const { jsPDF } = window.jsPDF;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    
    // Background
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Border
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);
    
    // Inner border
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(1);
    doc.rect(20, 20, 257, 170);
    
    // Title
    doc.setFontSize(28);
    doc.setTextColor(44, 62, 80);
    doc.setFont(undefined, 'bold');
    doc.text('🏆 CERTIFICATE OF MASTERY 🏆', 148.5, 40, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(16);
    doc.setTextColor(52, 152, 219);
    doc.text('DAX Programming Excellence', 148.5, 50, { align: 'center' });
    
    // Main content
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.setFont(undefined, 'normal');
    doc.text('This is to certify that', 148.5, 70, { align: 'center' });
    
    // Name
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(231, 76, 60);
    doc.text(gameState.playerName.toUpperCase(), 148.5, 85, { align: 'center' });
    
    // Achievement text
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(44, 62, 80);
    doc.text('has successfully completed the DAX Mastery Quest', 148.5, 100, { align: 'center' });
    doc.text('and has demonstrated advanced proficiency in DAX programming', 148.5, 110, { align: 'center' });
    
    // Skills
    doc.setFontSize(10);
    doc.setTextColor(39, 174, 96);
    const skills = [
        '✓ DAX Syntax and Fundamentals',
        '✓ Advanced Aggregation Functions',
        '✓ Context Manipulation and Filtering',
        '✓ Time Intelligence Calculations',
        '✓ Table Relationships and Navigation',
        '✓ Complex DAX Patterns and Optimization'
    ];
    
    let yPos = 125;
    for (let i = 0; i < skills.length; i += 2) {
        doc.text(skills[i], 60, yPos);
        if (skills[i + 1]) {
            doc.text(skills[i + 1], 180, yPos);
        }
        yPos += 8;
    }
    
    // Stats
    doc.setFontSize(10);
    doc.setTextColor(44, 62, 80);
    doc.text(`Challenges Completed: ${gameState.completedChallenges.size}`, 40, 170);
    doc.text(`Lines of DAX Coded: ${gameState.totalLines}`, 40, 180);
    doc.text(`Final Score: ${gameState.totalPoints} Points`, 180, 170);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 180, 180);
    
    // Signature
    doc.text('DAX Mastery Quest Certification Program', 148.5, 190, { align: 'center' });
    
    // Download
    doc.save(`DAX_Master_Certificate_${gameState.playerName.replace(/\s+/g, '_')}.pdf`);
}

function downloadCertificateAsImage() {
    // Create canvas for certificate image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    // Inner border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);
    
    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 CERTIFICATE OF MASTERY 🏆', canvas.width / 2, 150);
    
    // Subtitle
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('DAX Programming Excellence', canvas.width / 2, 180);
    
    // Main text
    ctx.fillStyle = '#2c3e50';
    ctx.font = '20px Arial';
    ctx.fillText('This is to certify that', canvas.width / 2, 240);
    
    // Name
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(gameState.playerName.toUpperCase(), canvas.width / 2, 300);
    
    // Achievement
    ctx.fillStyle = '#2c3e50';
    ctx.font = '20px Arial';
    ctx.fillText('has successfully completed the DAX Mastery Quest', canvas.width / 2, 350);
    ctx.fillText('and has demonstrated advanced proficiency in DAX programming', canvas.width / 2, 380);
    
    // Skills
    ctx.fillStyle = '#27ae60';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    const skills = [
        '✓ DAX Syntax and Fundamentals',
        '✓ Advanced Aggregation Functions',
        '✓ Context Manipulation and Filtering',
        '✓ Time Intelligence Calculations',
        '✓ Table Relationships and Navigation',
        '✓ Complex DAX Patterns and Optimization'
    ];
    
    let yPos = 440;
    for (let i = 0; i < skills.length; i += 2) {
        ctx.fillText(skills[i], 200, yPos);
        if (skills[i + 1]) {
            ctx.fillText(skills[i + 1], 650, yPos);
        }
        yPos += 30;
    }
    
    // Stats
    ctx.fillStyle
      // Stats
    ctx.fillStyle = '#2c3e50';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Challenges: ${gameState.completedChallenges.size} | Lines Coded: ${gameState.totalLines} | Score: ${gameState.totalPoints}`, canvas.width / 2, 650);
    ctx.fillText(`Completion Date: ${new Date().toLocaleDateString()}`, canvas.width / 2, 680);
    
    // Footer
    ctx.fillText('DAX Mastery Quest Certification Program', canvas.width / 2, 720);
    
    // Download
    const link = document.createElement('a');
    link.download = `DAX_Master_Certificate_${gameState.playerName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// Global functions for inline onclick handlers
window.switchModule = switchModule;
window.completeChallenge = completeChallenge;
window.copyCode = copyCode;
window.generateCertificate = generateCertificate;
window.showCertificateModal = showCertificateModal;
window.closeCertificateModal = closeCertificateModal;
window.downloadCertificateAsPDF = downloadCertificateAsPDF;
window.downloadCertificateAsImage = downloadCertificateAsImage;

// Auto-save every 30 seconds
setInterval(saveGameState, 30000);

// Save when page is about to unload
window.addEventListener('beforeunload', saveGameState);

// Handle page visibility change to save progress
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        saveGameState();
    }
});

// Utility function for debugging
window.getGameState = function() {
    return gameState;
};

// Initialize code highlighting when switching modules
document.addEventListener('DOMContentLoaded', function() {
    // Re-highlight code blocks when they become visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && typeof Prism !== 'undefined') {
                Prism.highlightAllUnder(entry.target);
            }
        });
    });
    
    document.querySelectorAll('.code-container').forEach(container => {
        observer.observe(container);
    });
});

console.log('🧮 DAX Mastery Quest Script Loaded Successfully! 🚀');
console.log('Ready to transform your team into DAX experts!');
