// ==================== CONFIGURACIÓN ====================
const CORRECT_PASSWORD = "1423"; // Cambia esta contraseña
const LOCK_DAYS = 20;

// ==================== VARIABLES GLOBALES ====================
let timerInterval = null;
let lockedTimerInterval = null;

// ==================== NAVEGACIÓN ENTRE PANTALLAS ====================
function nextScreen(screenNumber) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar la pantalla solicitada
    const targetScreen = document.getElementById('screen' + screenNumber);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

function showYesScreen() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('yesScreen').classList.add('active');
    closeModal();
    
    // Crear confeti
    createConfetti();
}

function showCancelScreen() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('cancelScreen').classList.add('active');
    closeModal();
}

function showLockedScreen() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('lockedScreen').classList.add('active');
    closeModal();
    
    // Iniciar cronómetro de la pantalla bloqueada
    startLockedScreenTimer();
}

function showNoScreen() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('noScreen').classList.add('active');
    closeModal();
}

// ==================== SISTEMA DE BLOQUEO ====================
function checkLockStatus() {
    const lockUntil = localStorage.getItem('lockUntil');
    
    if (lockUntil) {
        const now = new Date().getTime();
        const lockTime = parseInt(lockUntil);
        
        if (now < lockTime) {
            return {
                isLocked: true,
                lockTime: lockTime
            };
        } else {
            localStorage.removeItem('lockUntil');
            localStorage.removeItem('attemptUsed');
        }
    }
    
    return { isLocked: false };
}

// ==================== CRONÓMETRO ====================
function updateTimer(lockTime, prefix = '') {
    const now = new Date().getTime();
    const distance = lockTime - now;
    
    if (distance < 0) {
        clearInterval(timerInterval);
        localStorage.removeItem('lockUntil');
        localStorage.removeItem('attemptUsed');
        location.reload();
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const daysEl = document.getElementById(prefix + 'days');
    const hoursEl = document.getElementById(prefix + 'hours');
    const minutesEl = document.getElementById(prefix + 'minutes');
    const secondsEl = document.getElementById(prefix + 'seconds');
    
    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
}

function startLockedScreenTimer() {
    const lockStatus = checkLockStatus();
    if (lockStatus.isLocked) {
        updateTimer(lockStatus.lockTime, 'locked');
        lockedTimerInterval = setInterval(() => {
            updateTimer(lockStatus.lockTime, 'locked');
        }, 1000);
    }
}

// ==================== MODAL DE CONTRASEÑA ====================
function showPasswordModal() {
    const lockStatus = checkLockStatus();
    const modal = document.getElementById('passwordModal');
    const passwordSection = document.getElementById('passwordSection');
    const timerSection = document.getElementById('timerSection');
    const passwordInput = document.getElementById('passwordInput');
    const errorMessage = document.getElementById('errorMessage');
    
    if (lockStatus.isLocked) {
        // Mostrar cronómetro
        passwordSection.style.display = 'none';
        timerSection.style.display = 'block';
        
        updateTimer(lockStatus.lockTime);
        timerInterval = setInterval(() => {
            updateTimer(lockStatus.lockTime);
        }, 1000);
    } else {
        // Mostrar campo de contraseña
        passwordSection.style.display = 'block';
        timerSection.style.display = 'none';
        passwordInput.value = '';
        errorMessage.classList.remove('show');
    }
    
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('passwordModal');
    modal.classList.remove('active');
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ==================== VERIFICACIÓN DE CONTRASEÑA ====================
function verifyPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const errorMessage = document.getElementById('errorMessage');
    const enteredPassword = passwordInput.value.trim();
    
    if (!enteredPassword) {
        showError('Por favor ingresa una contraseña');
        return;
    }
    
    if (enteredPassword === CORRECT_PASSWORD) {
        // Contraseña correcta
        showNoScreen();
    } else {
        // Contraseña incorrecta - bloquear
        const lockUntil = new Date().getTime() + (LOCK_DAYS * 24 * 60 * 60 * 1000);
        localStorage.setItem('lockUntil', lockUntil);
        localStorage.setItem('attemptUsed', 'true');
        
        showLockedScreen();
    }
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 3000);
}

// ==================== CONFETI ====================
function createConfetti() {
    const colors = ['💕', '💖', '💗', '💝', '💓', '❤️', '💜', '💙'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.fontSize = Math.random() * 20 + 20 + 'px';
            confetti.textContent = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-50px';
            confetti.style.zIndex = '10000';
            confetti.style.pointerEvents = 'none';
            
            document.body.appendChild(confetti);
            
            const fallDuration = Math.random() * 3000 + 2000;
            const rotation = Math.random() * 720 - 360;
            
            const animation = confetti.animate([
                { 
                    transform: 'translateY(0) rotate(0deg)', 
                    opacity: 1 
                },
                { 
                    transform: `translateY(${window.innerHeight + 100}px) rotate(${rotation}deg)`, 
                    opacity: 0 
                }
            ], {
                duration: fallDuration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            animation.onfinish = () => confetti.remove();
        }, i * 30);
    }
    
    // Confeti continuo
    setInterval(() => {
        for (let i = 0; i < 3; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.fontSize = Math.random() * 20 + 20 + 'px';
            confetti.textContent = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-50px';
            confetti.style.zIndex = '10000';
            confetti.style.pointerEvents = 'none';
            
            document.body.appendChild(confetti);
            
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 3000 + 2000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            animation.onfinish = () => confetti.remove();
        }
    }, 2000);
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si está bloqueado al cargar
    const lockStatus = checkLockStatus();
    if (lockStatus.isLocked) {
        const noBtn = document.getElementById('noBtn');
        if (noBtn) {
            noBtn.style.opacity = '0.7';
        }
    }
    
    // Botón verificar contraseña
    const submitPassword = document.getElementById('submitPassword');
    if (submitPassword) {
        submitPassword.addEventListener('click', verifyPassword);
    }
    
    // Enter en input de contraseña
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifyPassword();
            }
        });
    }
    
    // Botón cancelar
    const cancelPassword = document.getElementById('cancelPassword');
    if (cancelPassword) {
        cancelPassword.addEventListener('click', showCancelScreen);
    }
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                showCancelScreen();
            }
        });
    }
});

// ==================== LIMPIAR INTERVALOS AL SALIR ====================
window.addEventListener('beforeunload', () => {
    if (timerInterval) clearInterval(timerInterval);
    if (lockedTimerInterval) clearInterval(lockedTimerInterval);
});