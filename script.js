// Definicja klawiszy pianina w zakresie od G3 do C5, w przyszłości planuje dodać resztę klawiszy
const pianoKeys = [
    { note: 'G3', type: 'white', label: 'G' },
    { note: 'G#3', type: 'black', label: 'G#' },
    { note: 'A3', type: 'white', label: 'A' },
    { note: 'A#3', type: 'black', label: 'B' },
    { note: 'B3', type: 'white', label: 'H' },
    { note: 'C4', type: 'white', label: 'C' },
    { note: 'C#4', type: 'black', label: 'C#' },
    { note: 'D4', type: 'white', label: 'D' },
    { note: 'D#4', type: 'black', label: 'D#' },
    { note: 'E4', type: 'white', label: 'E' },
    { note: 'F4', type: 'white', label: 'F' },
    { note: 'F#4', type: 'black', label: 'F#' },
    { note: 'G4', type: 'white', label: 'G' },
    { note: 'G#4', type: 'black', label: 'G#' },
    { note: 'A4', type: 'white', label: 'A' },
    { note: 'A#4', type: 'black', label: 'B' },
    { note: 'B4', type: 'white', label: 'H' },
    { note: 'C5', type: 'white', label: 'C' }
];

// Mapowanie nut do plików dźwiękowych
const soundPaths = {
    'G3': 'sounds/g1.caf',
    'G#3': 'sounds/gis1.caf',
    'A3': 'sounds/a1.caf',
    'A#3': 'sounds/b1.caf',
    'B3': 'sounds/h1.caf',
    'C4': 'sounds/c2.caf',
    'C#4': 'sounds/cis2.caf',
    'D4': 'sounds/d2.caf',
    'D#4': 'sounds/dis2.caf',
    'E4': 'sounds/e2.caf',
    'F4': 'sounds/f2.caf',
    'F#4': 'sounds/fis2.caf',
    'G4': 'sounds/g2.caf',
    'G#4': 'sounds/gis2.caf',
    'A4': 'sounds/a2.caf',
    'A#4': 'sounds/b2.caf',
    'B4': 'sounds/h2.caf',
    'C5': 'sounds/c3.caf'
};

// Zmienne globalne do zarządzania stanem aplikacji
let showSoundInfo = false;
let disabledKeys = new Set();
let currentSound = null;
let audioContext = null;
let lockMode = false;
let currentMode = 'random';

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    } catch (e) {
        console.error('Web Audio API nie jest obsługiwana przez tę przeglądarkę:', e);
        alert('Twoja przeglądarka nie obsługuje Web Audio API. Niektóre funkcje mogą nie działać poprawnie.');
    }

    generatePianoKeys();
    generatePianoKeys('#chord-keyboard');
    generatePianoKeys('#triad-keyboard');

    document.getElementById('random-sound-btn').addEventListener('click', playRandomSound);
    document.getElementById('toggle-sound-info-btn').addEventListener('click', toggleSoundInfo);
    document.getElementById('toggle-lock-mode-btn').addEventListener('click', toggleLockMode);
    document.getElementById('play-chord-btn').addEventListener('click', playChord);
    document.getElementById('play-triad-btn').addEventListener('click', playTriad);

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.dataset.mode;
            switchMode(mode);
        });
    });

    preloadSounds();
});

// Funkcja do przełączania między trybami
function switchMode(mode) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        if (button.dataset.mode === mode) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    const modeContainers = document.querySelectorAll('.mode-container');
    modeContainers.forEach(container => {
        if (container.id === `${mode}-mode`) {
            container.classList.add('active');
        } else {
            container.classList.remove('active');
        }
    });

    currentMode = mode;
}

// Definicje akordów
const chordDefinitions = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    '7': [0, 4, 7, 10],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10]
};

// Definicje trójdźwięków
const triadDefinitions = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    augmented: [0, 4, 8]
};

// Mapowanie nazw nut na indeksy
const noteToIndex = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
};

// Mapowanie indeksów na nazwy nut
const indexToNote = {
    0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
    6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B'
};

// Mapowanie nut na pliki dźwiękowe
const noteToSoundFile = {
    'C4': 'sounds/c2.caf',
    'C#4': 'sounds/cis2.caf',
    'D4': 'sounds/d2.caf',
    'D#4': 'sounds/dis2.caf',
    'E4': 'sounds/e2.caf',
    'F4': 'sounds/f2.caf',
    'F#4': 'sounds/fis2.caf',
    'G4': 'sounds/g2.caf',
    'G#4': 'sounds/gis2.caf',
    'A4': 'sounds/a2.caf',
    'A#4': 'sounds/b2.caf',
    'B4': 'sounds/h2.caf',
    'C5': 'sounds/c3.caf',
    'G3': 'sounds/g1.caf',
    'G#3': 'sounds/gis1.caf',
    'A3': 'sounds/a1.caf',
    'A#3': 'sounds/b1.caf',
    'B3': 'sounds/h1.caf'
};

// Funkcja do odtwarzania akordu
function playChord() {
    const rootNote = document.getElementById('chord-root').value;
    const chordType = document.getElementById('chord-type').value;
    
    const chordIntervals = chordDefinitions[chordType];
    const rootIndex = noteToIndex[rootNote];
    
    const chordNotes = [];
    const soundsToPlay = [];
    
    chordIntervals.forEach(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        const noteName = indexToNote[noteIndex];
        
        let octave = 4;
        if (interval >= 12) {
            octave = 5;
        }
        
        const finalNoteName = `${noteName}${octave}`;
        chordNotes.push(finalNoteName);
        
        const soundFile = noteToSoundFile[finalNoteName];
        if (soundFile) {
            soundsToPlay.push({
                note: finalNoteName,
                soundPath: soundFile
            });
        }
    });
    
    if (currentSound) {
        currentSound.stop();
    }
    
    soundsToPlay.forEach(sound => {
        playCustomSound(sound.soundPath);
        animateKey(sound.note, 'purple');
    });
    
    animateCharacter('chords', soundsToPlay.length);
    updateChordInfo(rootNote, chordType, chordNotes);
}

function playTriad() {
    const rootNote = document.getElementById('triad-root').value;
    const triadType = document.getElementById('triad-type').value;
    const inversion = parseInt(document.getElementById('triad-inversion').value);
    
    let triadIntervals = [...triadDefinitions[triadType]];
    
    for (let i = 0; i < inversion; i++) {
        const firstInterval = triadIntervals.shift();
        triadIntervals.push(firstInterval + 12);
    }
    
    const rootIndex = noteToIndex[rootNote];
    const triadNotes = [];
    const soundsToPlay = [];
    
    triadIntervals.forEach(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        const noteName = indexToNote[noteIndex];
        
        let octave = 4;
        if (interval >= 12) {
            octave = 5;
        }
        
        const finalNoteName = `${noteName}${octave}`;
        triadNotes.push(finalNoteName);
        
        const soundFile = noteToSoundFile[finalNoteName];
        if (soundFile) {
            soundsToPlay.push({
                note: finalNoteName,
                soundPath: soundFile
            });
        }
    });
    
    if (currentSound) {
        currentSound.stop();
    }
    
    soundsToPlay.forEach((sound, index) => {
        setTimeout(() => {
            if (currentSound) {
                currentSound.stop();
            }
            
            playCustomSound(sound.soundPath);
            animateKey(sound.note, 'purple');
            animateCharacter('triads', 1);
        }, index * 1000);
    });
    
    setTimeout(() => {
        if (currentSound) {
            currentSound.stop();
        }
        
        setTimeout(() => {
            soundsToPlay.forEach(sound => {
                playCustomSound(sound.soundPath);
                animateKey(sound.note, 'purple');
            });
            animateCharacter('triads', soundsToPlay.length);
        }, 100);
    }, soundsToPlay.length * 1000 + 500);
    
    updateTriadInfo(rootNote, triadType, inversion, triadNotes);
}

function updateChordInfo(rootNote, chordType, chordNotes = []) {
    const chordInfoElement = document.getElementById('chord-info');
    const currentChordElement = document.getElementById('current-chord');
    
    const chordTypeNames = {
        'major': 'durowy',
        'minor': 'molowy',
        '7': 'septymowy',
        'maj7': 'maj7',
        'min7': 'min7'
    };
    
    const notesText = chordNotes.length > 0 ? ` (dźwięki: ${chordNotes.join(', ')})` : '';
    currentChordElement.textContent = `${rootNote} ${chordTypeNames[chordType]}${notesText}`;
    chordInfoElement.classList.remove('hidden');
}

function updateTriadInfo(rootNote, triadType, inversion, triadNotes = []) {
    const triadInfoElement = document.getElementById('triad-info');
    const currentTriadElement = document.getElementById('current-triad');
    
    const triadTypeNames = {
        'major': 'durowy',
        'minor': 'molowy',
        'diminished': 'zmniejszony',
        'augmented': 'zwiększony'
    };
    
    const inversionNames = {
        0: 'postać zasadnicza',
        1: 'pierwszy przewrót',
        2: 'drugi przewrót'
    };
    
    const notesText = triadNotes.length > 0 ? ` (dźwięki: ${triadNotes.join(', ')})` : '';
    currentTriadElement.textContent = `${rootNote} ${triadTypeNames[triadType]}, ${inversionNames[inversion]}${notesText}`;
    triadInfoElement.classList.remove('hidden');
}

// Funkcja generująca klawisze pianina
function generatePianoKeys(keyboardSelector = '.piano-keyboard') {
    const pianoKeyboard = document.querySelector(keyboardSelector);
    let whiteKeyIndex = 0;

    pianoKeys.forEach((key, index) => {
        const keyElement = document.createElement('div');
        keyElement.classList.add('piano-key', `${key.type}-key`);
        keyElement.dataset.note = key.note;

        const keyLabel = document.createElement('div');
        keyLabel.classList.add('key-label');
        keyLabel.textContent = key.label;
        keyElement.appendChild(keyLabel);

        keyElement.addEventListener('click', (e) => {
            if (lockMode) {
                toggleKeyDisabled(keyElement);
                e.stopPropagation();
            }
        });
        
        keyElement.addEventListener('click', (e) => {
            if (!lockMode && !disabledKeys.has(key.note)) {
                playSound(key.note);
                updateSoundInfo(key.note);
                animateKey(key.note);
                animateCharacter();
                e.stopPropagation();
            }
        });

        if (key.type === 'white') {
            keyElement.style.left = `calc(${whiteKeyIndex} * var(--white-key-width))`;
            whiteKeyIndex++;
        } else if (key.type === 'black') {
            let position;
            const noteName = key.note.substring(0, key.note.length - 1);
            
            switch(noteName) {
                case 'C#':
                    position = whiteKeyIndex - 0.5;
                    break;
                case 'D#':
                    position = whiteKeyIndex - 0.5;
                    break;
                case 'F#':
                    position = whiteKeyIndex - 0.5;
                    break;
                case 'G#':
                    position = whiteKeyIndex - 0.5;
                    break;
                case 'A#':
                    position = whiteKeyIndex - 0.5;
                    break;
                default:
                    position = whiteKeyIndex - 0.5;
            }
            
            keyElement.style.left = `calc(${position} * var(--white-key-width))`;
        }

        pianoKeyboard.appendChild(keyElement);
    });
}


// Funkcja do przełączania blokady klawisza
function toggleKeyDisabled(keyElement) {
    if (!lockMode) return;
    
    const note = keyElement.dataset.note;
    
    if (disabledKeys.has(note)) {
        disabledKeys.delete(note);
        keyElement.classList.remove('disabled');
        if (keyElement.classList.contains('white-key')) {
            keyElement.style.backgroundColor = 'var(--white)';
        } else {
            keyElement.style.backgroundColor = 'var(--black)';
        }
    } else {
        disabledKeys.add(note);
        keyElement.classList.add('disabled');
        keyElement.style.backgroundColor = 'var(--gray)';
    }
}

function playRandomSound() {
    const availableKeys = pianoKeys.filter(key => !disabledKeys.has(key.note));
    
    if (availableKeys.length === 0) {
        alert('Wszystkie klawisze są zablokowane. Odblokuj przynajmniej jeden klawisz.');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableKeys.length);
    const selectedKey = availableKeys[randomIndex];
    
    playSound(selectedKey.note);
    updateSoundInfo(selectedKey.note);
    animateKey(selectedKey.note);
    animateCharacter('random', 1);
}

function playSound(note) {
    if (!audioContext) return;
    
    if (currentSound) {
        currentSound.stop();
    }
    
    const soundPath = soundPaths[note];
    
    fetch(soundPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Plik dźwiękowy nie istnieje');
            }
            return response.arrayBuffer();
        })
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
            currentSound = source;
        })
        .catch(error => {
            console.error('Błąd odtwarzania dźwięku:', error);
            const audio = new Audio(soundPath);
            audio.play().catch(e => console.error('Nie można odtworzyć dźwięku:', e));
        });
}

function playCustomSound(soundPath) {
    if (!audioContext) return;
    
    if (currentSound) {
        currentSound.stop();
    }
    
    fetch(soundPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Plik dźwiękowy nie istnieje');
            }
            return response.arrayBuffer();
        })
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
            currentSound = source;
        })
        .catch(error => {
            console.error('Błąd odtwarzania dźwięku:', error);
            const audio = new Audio(soundPath);
            audio.play().catch(e => console.error('Nie można odtworzyć dźwięku:', e));
        });
}

function updateSoundInfo(note) {
    const soundInfoElement = document.getElementById('sound-info');
    const currentSoundElement = document.getElementById('current-sound');
    
    currentSoundElement.textContent = note;
    
    if (showSoundInfo) {
        soundInfoElement.classList.remove('hidden');
    } else {
        soundInfoElement.classList.add('hidden');
    }
}

function toggleSoundInfo() {
    showSoundInfo = !showSoundInfo;
    const soundInfoElement = document.getElementById('sound-info');
    const toggleButton = document.getElementById('toggle-sound-info-btn');
    
    if (showSoundInfo) {
        soundInfoElement.classList.remove('hidden');
        toggleButton.textContent = 'Ukryj nazwę dźwięku';
    } else {
        soundInfoElement.classList.add('hidden');
        toggleButton.textContent = 'Pokaż nazwę dźwięku';
    }
}

function animateKey(note, color = 'var(--primary-light)') {
    const keys = document.querySelectorAll(`.piano-key[data-note="${note}"]`);
    
    keys.forEach(key => {
        const isWhiteKey = key.classList.contains('white-key');
        const originalColor = isWhiteKey ? 'var(--white)' : 'var(--black)';
        const originalBackground = isWhiteKey ? 'linear-gradient(to bottom, #FFFFFF, #F5F5F5)' : 'linear-gradient(to bottom, #333333, #000000)';
        
        const originalTransform = isWhiteKey ? 'translateY(0)' : 'translateX(-50%)';
        const animationTransform = isWhiteKey ? 'translateY(3px)' : 'translateX(-50%) translateY(3px)';
        
        key.style.boxShadow = isWhiteKey ? 
            '0 2px 10px rgba(147, 112, 219, 0.6), inset 0 -5px 10px -5px rgba(0, 0, 0, 0.1)' : 
            '0 2px 10px rgba(147, 112, 219, 0.6), inset 0 -5px 10px -5px rgba(255, 255, 255, 0.1)';
        
        key.style.background = isWhiteKey ? 
            `linear-gradient(to bottom, ${color}, var(--primary-color))` : 
            `linear-gradient(to bottom, ${color}, var(--primary-dark))`;
        key.classList.add('active');
        
        key.style.transform = animationTransform;
        
        setTimeout(() => {
            key.style.background = originalBackground;
            key.style.boxShadow = isWhiteKey ? 
                '0 2px 5px rgba(0, 0, 0, 0.1), inset 0 -5px 10px -5px rgba(0, 0, 0, 0.1)' : 
                '0 3px 6px rgba(0, 0, 0, 0.5), inset 0 -5px 10px -5px rgba(255, 255, 255, 0.1)';
            key.style.transform = originalTransform;
            key.classList.remove('active');
        }, 300);
    });
}

function animateCharacter(mode = 'random', noteCount = 1) {
    let characterImgId = 'character-img';
    
    if (mode === 'chords') {
        characterImgId = 'character-img-chords';
    } else if (mode === 'triads') {
        characterImgId = 'character-img-triads';
    }
    
    const characterImg = document.getElementById(characterImgId);
    
    characterImg.classList.add('playing');
    
    createFloatingNotes(characterImg.parentElement, noteCount);
    
    setTimeout(() => {
        characterImg.classList.remove('playing');
    }, 500);
}

function createFloatingNotes(container, noteCount = 1) {
    const noteColors = [
        '#9370DB',
        '#7B68EE',
        '#B19CD9',
        '#FFD700',
        '#FFEB99'
    ];
    
    for (let i = 0; i < noteCount; i++) {
        const note = document.createElement('div');
        note.className = 'floating-note';
        
        const leftPos = Math.random() * 80 + 10;
        note.style.left = `${leftPos}%`;
        
        const colorIndex = Math.floor(Math.random() * noteColors.length);
        const noteColor = noteColors[colorIndex];
        note.style.backgroundColor = noteColor;
        
        const size = Math.random() * 10 + 18;
        note.style.width = `${size}px`;
        note.style.height = `${size * 1.2}px`;
        note.style.filter = `drop-shadow(0 0 ${Math.random() * 3 + 2}px ${noteColor})`;
        
        const startRotation = Math.random() * 20 - 10;
        note.style.transform = `rotate(${startRotation}deg)`;
        
        const noteStem = document.createElement('div');
        noteStem.className = 'note-stem';
        noteStem.style.backgroundColor = noteColor;
        noteStem.style.height = `${30 + Math.random() * 10}px`;
        note.appendChild(noteStem);
        
        const noteFlag = document.createElement('div');
        noteFlag.className = 'note-flag';
        noteFlag.style.backgroundColor = noteColor;
        noteStem.appendChild(noteFlag);
        
        const animDuration = Math.random() * 1.2 + 1.5;
        note.style.animationDuration = `${animDuration}s`;
        
        container.appendChild(note);
        
        setTimeout(() => {
            if (container.contains(note)) {
                container.removeChild(note);
            }
        }, animDuration * 1000);
    }
}

function preloadSounds() {
    if (!audioContext) {
        console.warn('AudioContext nie jest dostępny, ładowanie dźwięków może być ograniczone');
    }
    
    Object.values(soundPaths).forEach(path => {
        const audio = new Audio();
        audio.src = path;
        audio.preload = 'auto';
    });
    
    const svgImages = document.querySelectorAll('img[src$=".svg"]');
    svgImages.forEach(img => {
        img.setAttribute('class', 'svg-image');
        img.setAttribute('data-loaded', 'false');
        
        img.onload = function() {
            this.classList.add('svg-loaded');
            this.setAttribute('data-loaded', 'true');
            
            if (img.contentDocument) {
                console.log('SVG załadowany:', img.id);
            }
        };
    });
    
    Object.entries(soundPaths).forEach(([note, path]) => {
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    console.warn(`Plik dźwiękowy ${path} nie istnieje. Zostanie użyty dźwięk zastępczy.`);
                    return null;
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                if (arrayBuffer) {
                    return audioContext.decodeAudioData(arrayBuffer);
                }
                return null;
            })
            .catch(error => {
                console.error(`Błąd ładowania dźwięku ${note}:`, error);
            });
    });
}

function toggleLockMode() {
    lockMode = !lockMode;
    const toggleButton = document.getElementById('toggle-lock-mode-btn');
    const pianoKeys = document.querySelectorAll('.piano-key');
    
    if (lockMode) {
        toggleButton.textContent = 'Wyłącz tryb blokowania';
        toggleButton.classList.add('active-btn');
        pianoKeys.forEach(key => {
            key.style.cursor = 'pointer';
        });
    } else {
        toggleButton.textContent = 'Włącz tryb blokowania';
        toggleButton.classList.remove('active-btn');
        pianoKeys.forEach(key => {
            key.style.cursor = 'default';
        });
    }
}

window.addEventListener('load', handleMissingSounds);

function handleMissingSounds() {
    const anyMissingSounds = Object.values(soundPaths).some(path => {
        return !fetch(path).then(response => response.ok);
    });
    
    if (anyMissingSounds) {
        console.warn('Niektóre pliki dźwiękowe nie istnieją. Dodaj pliki dźwiękowe do folderu sounds/');
        
        // Dodanie informacji dla użytkownika
        const infoElement = document.createElement('div');
        infoElement.classList.add('sound-info');
        infoElement.textContent = 'Uwaga: Brakuje plików dźwiękowych. Dodaj pliki MP3 do folderu sounds/';
        infoElement.style.backgroundColor = '#FFECB3';
        infoElement.style.color = '#FF6F00';
        infoElement.style.padding = '10px';
        infoElement.style.marginBottom = '20px';
        infoElement.style.borderRadius = '5px';
        
        const pianoContainer = document.querySelector('.piano-container');
        pianoContainer.insertBefore(infoElement, pianoContainer.firstChild);
    }
}