// Таймер
function updateTime() {
    const timeElement = document.getElementById('time');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}`;
}

setInterval(updateTime, 1000);
updateTime();

// Управление окнами
let windowStack = {
    posX: 150,
    posY: 30,
    offset: 30
};

document.getElementById('home-icon').addEventListener('click', () => {
    const folder = document.getElementById('home-folder');
    toggleWindow(folder, 'Home');
});

document.getElementById('design-icon').addEventListener('click', () => {
    const folder = document.getElementById('design-folder');
    toggleWindow(folder, 'Design');
});

document.getElementById('hello-icon').addEventListener('click', () => {
    const folder = document.getElementById('hello-folder');
    toggleWindow(folder, 'Hello');
});

document.getElementById('links-icon').addEventListener('click', () => {
    const folder = document.getElementById('links-folder');
    toggleWindow(folder, 'Links');
});

document.getElementById('aboutme-icon').addEventListener('click', () => {
    const folder = document.getElementById('aboutme-folder');
    toggleWindow(folder, 'About me');
});

document.getElementById('skills-icon').addEventListener('click', () => {
    const folder = document.getElementById('skills-folder');
    toggleWindow(folder, 'Skills');
});

document.getElementById('mood-icon').addEventListener('click', () => {
    const folder = document.getElementById('mood-folder');
    toggleWindow(folder, 'Mood');
});

function toggleWindow(windowElement, title) {
    const isVisible = windowElement.style.display === 'flex';
    
    document.querySelectorAll('.window').forEach(win => {
        win.style.zIndex = 1;
    });
    
    if (!isVisible) {
        positionWindow(windowElement);
        windowElement.style.display = 'flex';
        windowElement.style.zIndex = 2;
        addToTaskbar(windowElement.id, title);
    } else {
        windowElement.style.display = 'none';
        removeFromTaskbar(windowElement.id);
    }
}

function positionWindow(windowElement) {
    windowElement.style.left = `${windowStack.posX}px`;
    windowElement.style.top = `${windowStack.posY}px`;
    
    windowStack.posX += windowStack.offset;
    windowStack.posY += windowStack.offset;
    
    const maxX = window.innerWidth - 300;
    const maxY = window.innerHeight - 200 - 40;
    
    if (windowStack.posX > maxX || windowStack.posY > maxY) {
        windowStack.posX = 30;
        windowStack.posY = 30;
    }
}

// Панель задач
function addToTaskbar(windowId, title) {
    document.querySelectorAll('.task-item').forEach(item => {
        item.classList.remove('active');
    });

    const taskItem = document.createElement('div');
    taskItem.className = 'task-item active';
    taskItem.textContent = title;
    taskItem.dataset.windowId = windowId;

    taskItem.addEventListener('click', () => {
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('active');
        });
        taskItem.classList.add('active');
        
        const targetWindow = document.getElementById(windowId);
        targetWindow.style.display = 'flex';
        bringToFront(targetWindow);
    });

    document.querySelector('.open-windows').appendChild(taskItem);
}

function removeFromTaskbar(windowId) {
    const items = document.querySelectorAll('.task-item');
    items.forEach(item => {
        if (item.dataset.windowId === windowId) item.remove();
    });

    if (items.length > 1) {
        const firstItem = document.querySelector('.task-item');
        if (firstItem) firstItem.click();
    }
}

// Drag-and-drop
let isDragging = false;
let currentWindow = null;
let startX = 0;
let startY = 0;
let initialLeft = 0;
let initialTop = 0;

document.querySelectorAll('.window-header').forEach(header => {
    header.addEventListener('mousedown', dragStart);
});

function dragStart(e) {
    if (e.target.classList.contains('window-header')) {
        isDragging = true;
        currentWindow = e.target.parentElement;
        currentWindow.style.cursor = 'grabbing';
        
        initialLeft = parseFloat(currentWindow.style.left) || 0;
        initialTop = parseFloat(currentWindow.style.top) || 0;
        startX = e.clientX;
        startY = e.clientY;
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        bringToFront(currentWindow);
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-window-id="${currentWindow.id}"]`).classList.add('active');
    }
}

function drag(e) {
    if (isDragging && currentWindow) {
        e.preventDefault();
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        const newX = initialLeft + dx;
        const newY = initialTop + dy;
        
        const taskbarHeight = document.querySelector('.taskbar').offsetHeight;
        const windowWidth = currentWindow.offsetWidth;
        const windowHeight = currentWindow.offsetHeight;
        
        const maxX = window.innerWidth - windowWidth;
        const maxY = window.innerHeight - windowHeight - taskbarHeight;
        
        currentWindow.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
        currentWindow.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    }
}

function dragEnd() {
    if (isDragging) {
        isDragging = false;
        currentWindow.style.cursor = 'default';
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragEnd);
    }
}

// Вспомогательные функции
function bringToFront(element) {
    document.querySelectorAll('.window').forEach(win => {
        win.style.zIndex = 1;
    });
    element.style.zIndex = 2;
}

// Обработчики оконных кнопок
document.querySelectorAll('.window').forEach(window => {
    window.querySelector('.close').addEventListener('click', function() {
        window.style.display = 'none';
        removeFromTaskbar(window.id);
    });

    window.querySelector('.minimize').addEventListener('click', function() {
        window.style.display = 'none';
        document.querySelectorAll('.task-item').forEach(item => {
            if (item.dataset.windowId === window.id) item.classList.remove('active');
        });
    });
});

// Ресайз
window.addEventListener('resize', () => {
    windowStack.posX = 30;
    windowStack.posY = 30;
    
    document.querySelectorAll('.window').forEach(window => {
        if (window.style.display === 'flex') {
            const rect = window.getBoundingClientRect();
            const taskbarHeight = document.querySelector('.taskbar').offsetHeight;
            
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height - taskbarHeight;
            
            window.style.left = `${Math.max(0, Math.min(rect.left, maxX))}px`;
            window.style.top = `${Math.max(0, Math.min(rect.top, maxY))}px`;
        }
    });
});

// Start Menu
document.querySelector('.start-button').addEventListener('click', (e) => {
    const menu = document.querySelector('.start-menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    e.stopPropagation();
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
        document.querySelector('.start-menu').style.display = 'none';
    }
});

// Обработчики для пунктов меню
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const action = item.dataset.action;
        
        if (action === 'video') {
            const videoFolder = document.getElementById('video-folder');
            toggleWindow(videoFolder, 'Видео');
        } else if (action === 'calculator') {
            alert('calculator soon');
        } else if (action === 'shutdown') {
            window.close();
        }
    });
});

// Обработчик для подменю игр
const gamesItem = document.querySelector('[data-submenu="games"]');
gamesItem.addEventListener('mouseenter', () => {
    document.querySelector('.submenu').style.display = 'flex';
});

gamesItem.addEventListener('mouseleave', () => {
    document.querySelector('.submenu').style.display = 'none';
});

// Обработчики для подменю
document.querySelectorAll('.submenu-item').forEach(item => {
    item.addEventListener('click', () => {
        alert(`Game "${item.textContent}" soon`);
    });
});

// User Popup
document.querySelector('.user-info').addEventListener('click', (e) => {
    const popup = document.querySelector('.user-popup');
    popup.style.display = 'flex';
    e.stopPropagation();
});

document.querySelector('.popup-close').addEventListener('click', () => {
    document.querySelector('.user-popup').style.display = 'none';
});

document.addEventListener('click', (e) => {
    const popup = document.querySelector('.user-popup');
    const userInfo = document.querySelector('.user-info');
    
    if (!popup.contains(e.target) && !userInfo.contains(e.target)) {
        popup.style.display = 'none';
    }
});