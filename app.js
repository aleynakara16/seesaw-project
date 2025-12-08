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
    leftWeightBar: document.getElementById('leftWeightBar'),
    rightWeightBar: document.getElementById('rightWeightBar'),
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
    nextWeight: null,
};
let cursorIndicator = null;

/*---------------------------------------------------YARDIMCI METOTLAR---------------------------------------------------*/
function generateId() {
    return 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
function getRandomWeight() {
    return Math.floor(Math.random() * (CONSTANTS.MAX_WEIGHT - CONSTANTS.MIN_WEIGHT + 1)) + CONSTANTS.MIN_WEIGHT;
}
function generateNextWeight() {
    seesawState.nextWeight = getRandomWeight();
    updateNextWeightBox();
}
function updateNextWeightBox() {
    DOM.nextWeightValue.textContent = `${seesawState.nextWeight} kg`;
}

/*---------------------------------------------------STATE YONETIMI---------------------------------------------------*/
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

/*---------------------------------------------------FİZİKSEL HESAPLAMALAR---------------------------------------------------*/
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

/*---------------------------------------------------AGIRLIK YONETIMI---------------------------------------------------*/
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
        clickX: clickX
    };
    seesawState.weights.push(weight);
    saveState();
    updatePhysics();
    renderWeights();
    addLogEntry(weight);
    generateNextWeight();

    console.log(`Mass:${mass}kg. Side:${side}. Distance: ${distance.toFixed(0)}px`);
    return weight;
}
/*agirlik silme*/
function removeWeight(weightId) {
    const index = seesawState.weights.findIndex(w => w.id === weightId);
    if (index !== -1) {
        const removed = seesawState.weights.splice(index, 1)[0];
        console.log(`Removed weight: ${removed.mass}kg`);
        saveState();
        updatePhysics();
        renderWeights();
        removeLogEntry(weightId);
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

/*UI GÜNCELLEME*/
function updateUiValues() {
    const leftWeight = getTotalSideMass('left');
    const rightWeight = getTotalSideMass('right');
    DOM.leftWeight.textContent = `${leftWeight} KG`;
    DOM.rightWeight.textContent = `${rightWeight} KG`;
    DOM.angleValue.textContent = `${seesawState.currentAngle.toFixed(1)}°`;

    // Ağırlık göstergelerini güncelle
    const MAX_WEIGHT_DISPLAY = 100; // Gösterge için maksimum değer
    const leftPercentage = Math.min((leftWeight / MAX_WEIGHT_DISPLAY) * 100, 100);
    const rightPercentage = Math.min((rightWeight / MAX_WEIGHT_DISPLAY) * 100, 100);

    DOM.leftWeightBar.style.width = `${leftPercentage}%`;
    DOM.rightWeightBar.style.width = `${rightPercentage}%`;
}

/*---------------------------------------------------LOG YONETIMI---------------------------------------------------*/
function createLogElement(weight) {
    const logItem = document.createElement('div');
    logItem.className = `log-item ${weight.side}`;
    logItem.dataset.id = weight.id;

    const sideText = weight.side === 'left' ? 'LEFT' : 'RIGHT';
    const massSpan = document.createElement('span');
    massSpan.className = 'mass';
    massSpan.textContent = `${weight.mass} kg | ${sideText}  | ${weight.distance.toFixed(0)}px from Center`;

    logItem.appendChild(massSpan);
    return logItem;
}
function addLogEntry(weight) {
    if (DOM.weightLog.querySelector('.log-empty')) DOM.weightLog.querySelector('.log-empty').remove();

    const logItem = createLogElement(weight);
    DOM.weightLog.insertBefore(logItem, DOM.weightLog.firstChild);// En uste ekleme

}
function removeLogEntry(weightId) {
    const logItem = DOM.weightLog.querySelector(`[data-id="${weightId}"]`);
    if (logItem) logItem.remove();

    // Hiç log kalmadıysa boş mesaj göster
    if (DOM.weightLog.children.length === 0) {
        DOM.weightLog.innerHTML = '<p class="log-empty">You haven not added weight yet</p>';
    }
}
/*İlk yükleme için tüm logları render etme*/
function renderAllLogs() {
    const weights = seesawState.weights;
    if (weights.length === 0) {
        DOM.weightLog.innerHTML = '<p class="log-empty">You haven not added weight yet</p>';
        return;
    }

    DOM.weightLog.innerHTML = '';
    // Ters sırada ekle (en yeni en üstte)
    for (let i = weights.length - 1; i >= 0; i--) {
        const logItem = createLogElement(weights[i]);
        DOM.weightLog.appendChild(logItem);
    }
}


/*---------------------------------------------------EVENT HANDLERS---------------------------------------------------*/
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
    cursorIndicator.style.transform = 'translateX(-50%)'; // okun imleç ile aynı hizada olması
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
        cursorIndicator.style.left = `${mouseX}px`;// cursor fareye göre konumlanır
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
        renderAllLogs();
    });
}

function init() {
    loadState();
    createCursorIndicator();
    bindEvents();
    generateNextWeight();
    renderWeights();
    updatePhysics();
    renderAllLogs();
}

document.addEventListener('DOMContentLoaded', init);
