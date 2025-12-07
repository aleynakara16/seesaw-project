/*task'daki sabitler*/
const CONSTANTS = {
    PLANK_WIDTH: 400, // plank genisligi (px)
    PLANK_CENTER: 200, // plank merkez noktasi
    STORAGE_KEY: 'seesawState',// localStorage anahtari
    MIN_WEIGHT: 1,//min mass
    MAX_WEIGHT: 10 //max mass 
};
const DOM = {
    leftWeight: document.getElementById('leftWeight'),
    rightWeight: document.getElementById('rightWeight'),
    angleValue: document.getElementById('angle'),
    nextWeightValue: document.getElementById('nextWeight'),
    seesawPlank: document.getElementById('plank'),
    plankContainer: document.getElementById('plank-container'),
    resetBtn: document.getElementById('resetBtn'),
    weightLog: document.getElementById('weightLog'),
};
let seesawState = {
    weights: [],
    currentAngle: 0,
};
let cursorIndicator = null;


function generateId() {
    return 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
/* 1-10 arasinda mass degeri uretme*/
function getRandomWeight() {
    return Math.floor(Math.random() * (CONSTANTS.MAX_WEIGHT - CONSTANTS.MIN_WEIGHT + 1)) + CONSTANTS.MIN_WEIGHT;
}
/* Bir sonraki mass degerini belirliyoruz */
function generateNextWeight() {
    seesawState.nextWeight = getRandomWeight();
    updateNextWeightBox();
}
/* mass degerini UI'da gosteriyoruz */
function updateNextWeightBox() {
    DOM.nextWeightValue.textContent = `${seesawState.nextWeight} kg`;
}


function saveState() {
    try {
        // nextWeight localStorage'e kaydetmiyoruz
        const stateToSave = {
            weights: seesawState.weights,
            currentAngle: seesawState.currentAngle
        };
        const stateJSON = JSON.stringify(stateToSave);
        localStorage.setItem(CONSTANTS.STORAGE_KEY, stateJSON);
    } catch (error) {
        console.error('❌ Error saving state:', error);
    }
}
function loadState() {
    try {
        const stateJSON = localStorage.getItem(CONSTANTS.STORAGE_KEY);
        if (stateJSON) {
            const loadedState = JSON.parse(stateJSON);
            seesawState.weights = loadedState.weights || [];
            seesawState.currentAngle = loadedState.currentAngle || 0;
            return true;
        }
    } catch (error) {
        console.error('❌ Error loading state:', error);
    }
    return false;
}
function resetState() {
    seesawState.weights = [];
    seesawState.currentAngle = 0;
    saveState();
}


/*Bir taraftaki toplam tork= Σ(weight ×distance)*/
function getSideTorque(side) {
    return seesawState.weights
        .filter(w => w.side === side)
        .reduce((total, weight) => {
            return total + (weight.mass * weight.distance);
        }, 0);
}
/*angle = Math.max(-30, Math.min(30, (totalRightTorque - totalLeftTorque) / 10))*/
function calculateAngle(totalRightTorque, totalLeftTorque) {
    const angle = Math.max(-30, Math.min(30, (totalRightTorque - totalLeftTorque) / 10));
    return angle;
}
/*Bir taraftaki toplam ağırlık(boxlar icin)*/
function getTotalSideMass(side) {
    return seesawState.weights
        .filter(w => w.side === side)
        .reduce((total, weight) => total + weight.mass, 0);
}


/*Tıklanan pozisyona agirlik ekleme*/
function addWeightAtPosition(clickX) {
    const side = clickX < CONSTANTS.PLANK_CENTER ? 'left' : 'right'; // Sol mu sag mi?
    const distance = Math.abs(clickX - CONSTANTS.PLANK_CENTER);  // Merkeze uzaklik (px)
    const mass = seesawState.nextWeight;

    // Yeni agirlik olusturma
    const weight = {
        id: generateId(),
        mass: mass,
        side: side,
        distance: distance,
        clickX: clickX // gorsel pozisyon icin
    };
    seesawState.weights.push(weight);
    saveState();
    updatePhysics();
    renderWeights();
    generateNextWeight();

    console.log(`Mass:${mass}kg. Side:${side}. Distance: ${distance.toFixed(0)}px`);
    return weight;
}
/*agirlik silme*/
function removeWeight(weightId) {
    const index = seesawState.weights.findIndex(w => w.id === weightId);
    if (index !== -1) {
        const removed = seesawState.weights.splice(index, 1)[0];
        saveState();
        updatePhysics();
        renderWeights();
        return removed;
    }
    return null;
}

/*agirlikları DOM'a render etme*/
function renderWeights() {
    // Plank icindeki agirlikları temizleme(pivot-marker hariç)
    const existingWeights = DOM.seesawPlank.querySelectorAll('.weight');
    existingWeights.forEach(w => w.remove());

    // Her agirligi render et
    seesawState.weights.forEach(weight => {
        const weightEl = createWeightElement(weight);
        DOM.seesawPlank.appendChild(weightEl);
    });
}

/* Ağırlık değerine göre boyut hesaplama (1-10 arası) */
function getWeightSize(mass) {
    const MIN_SIZE = 30;
    const MAX_SIZE = 65;
    const boxSizeRange = MAX_SIZE - MIN_SIZE;
    const weightRange = CONSTANTS.MAX_WEIGHT - CONSTANTS.MIN_WEIGHT;

    // agirlik boyutunu hesaplıyoruz
    const size = MIN_SIZE + ((mass - CONSTANTS.MIN_WEIGHT) / weightRange) * boxSizeRange;
    return Math.round(size);
}
function getWeightColor(mass) {
    const colorPalette = {
        1: '#B3D9E6',
        2: '#A8D5A8',
        3: '#FFD699',
        4: '#CCB3FF',
        5: '#FFB3D1',
        6: '#FFCC99',
        7: '#B3D1FF',
        8: '#99FF99',
        9: '#FF9999',
        10: '#B366FF'
    };
    return colorPalette[mass] || colorPalette[5];
}

/* agirlik DOM elementi olusturma*/
function createWeightElement(weight) {
    const wrapper = document.createElement('div');
    wrapper.className = 'weight';
    wrapper.dataset.id = weight.id;
    wrapper.dataset.side = weight.side;
    wrapper.dataset.mass = weight.mass;

    const size = getWeightSize(weight.mass);
    const color = getWeightColor(weight.mass);
    wrapper.style.position = 'absolute';
    wrapper.style.left = `${weight.clickX}px`;
    wrapper.style.top = `${-size - 5}px`; // Ağırlık boyutuna göre dinamik
    wrapper.style.transform = 'translateX(-50%)';

    // agirlikler icin dinamik boyut,renk,font
    const box = document.createElement('div');
    box.className = 'weight-box';
    box.textContent = weight.mass;
    box.style.width = `${size}px`;
    box.style.height = `${size}px`;
    box.style.background = color;
    const fontSize = Math.max(0.6, Math.min(1.0, 0.6 + (weight.mass - 1) * 0.04));
    box.style.fontSize = `${fontSize}rem`;

    // Silme butonu
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'weight-delete';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Remove weight';
    deleteBtn.addEventListener('click', (e) => {
        removeWeight(weight.id);
    });

    box.appendChild(deleteBtn);
    wrapper.appendChild(box);

    return wrapper;
}

/*UI değerlerini günceller (tork ve açı gösterimi)*/
function updateUiValues() {
    const leftWeight = getTotalSideMass('left');
    const rightWeight = getTotalSideMass('right');
    DOM.leftWeight.textContent = `${leftWeight} KG`;
    DOM.rightWeight.textContent = `${rightWeight} KG`;
    DOM.angleValue.textContent = `${seesawState.currentAngle.toFixed(1)}°`;
    updateWeightLog();// soldaki panel güncellendi
}

/*soldaki paneli güncelleme*/
function updateWeightLog() {
    const weights = seesawState.weights;
    if (weights.length === 0) {
        DOM.weightLog.innerHTML = '<p class="log-empty">Henüz agirlik eklenmedi</p>';
        return;
    }
    const logHTML = weights
        .slice()
        .reverse()
        .map(weight => {
            const sideText = weight.side === 'left' ? 'LEFT' : 'RIGHT';
            return `
                <div class="log-item ${weight.side}">
                    <span class="mass">${weight.mass} kg | ${sideText}  | ${weight.distance.toFixed(0)}px from Center</span>
                </div>
            `;
        })
        .join('');

    DOM.weightLog.innerHTML = logHTML;
}

/*Plank'ın rotasyonunu güncelleme*/
function updatePlankRotation() {
    DOM.seesawPlank.style.transform = `rotate(${seesawState.currentAngle}deg)`;
}

/*Fizik hesaplarini yapar ve UI'i gunceller*/
function updatePhysics() {
    const leftTorque = getSideTorque('left');
    const rightTorque = getSideTorque('right');
    seesawState.currentAngle = calculateAngle(rightTorque, leftTorque);//task'daki formul ile

    updateUiValues();
    updatePlankRotation();
}



/*Plank tiklanma olayi*/
function handleContainerClick(e) {
    // Eger silme butonuna tiklandiyse, agirlik ekleme
    if (e.target.classList.contains('weight-delete') ||
        e.target.classList.contains('weight-box') ||
        e.target.classList.contains('weight')) {
        return;
    }
    const containerRect = DOM.plankContainer.getBoundingClientRect();
    const clickX = e.clientX - containerRect.left;

    // Tiklama container sinirlari icinde mi (garanti olsun)
    if (clickX >= 0 && clickX <= CONSTANTS.PLANK_WIDTH) {
        addWeightAtPosition(clickX);
    }
}
/*Cursor indicator olusturma*/
function createCursorIndicator() {
    cursorIndicator = document.createElement('div');
    cursorIndicator.className = 'vertical-line';
    cursorIndicator.style.transform = 'translateX(-50%)'; // Ortalamak için
    DOM.plankContainer.appendChild(cursorIndicator);
}
/*Cursor indicator pozisyonunu guncelleme*/
function updateCursorIndicator(e) {
    if (!cursorIndicator) return;

    const containerRect = DOM.plankContainer.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;

    // container sinir kontrolu
    if (mouseX >= 0 && mouseX <= CONSTANTS.PLANK_WIDTH) {
        cursorIndicator.style.opacity = '1';
        cursorIndicator.style.left = `${mouseX}px`;
    } else {
        cursorIndicator.style.opacity = '0';
    }
}

function bindEvents() {
    DOM.plankContainer.addEventListener('click', handleContainerClick);// Container'a tıklama
    DOM.plankContainer.addEventListener('mousemove', updateCursorIndicator);//cursor indicator güncelleme
    DOM.plankContainer.addEventListener('mouseleave', () => {
        if (cursorIndicator) cursorIndicator.style.opacity = '0';//cursor indicator gizle
    });
    DOM.resetBtn.addEventListener('click', () => {
        resetState();
        renderWeights();
        updatePhysics();
        updateWeightLog();
    });
}



function init() {
    loadState();
    createCursorIndicator();
    bindEvents();
    generateNextWeight();
    renderWeights();
    updatePhysics();
    updateWeightLog();
}

document.addEventListener('DOMContentLoaded', init);
