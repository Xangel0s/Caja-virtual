// ================================
// EMOJI SELECTOR - Sistema de Selector de Emojis
// ================================

class EmojiSelector {
    constructor() {
        this.currentCategory = 'food';
        this.searchTerm = '';
        this.onSelect = null;
        this.targetInput = null;
        this.isOpen = false;
        
        this.emojis = {
            food: [
                // Frutas
                '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝', '🍑', '🥭', '🍍', '🥥', '🥑', '🍅', '🥒', '🥬', '🥕', '🌽', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰',
                // Comida preparada
                '🍕', '🍔', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🍖', '🍗', '🥩', '🥓', '🍳', '🥚', '🧀', '🥨', '🥖', '🥐', '🍞', '🥯', '🥞', '🧇', '🍝', '🍜', '🍲', '🥘', '🍛', '🍣', '🍤', '🍙', '🍚', '🍱', '🍘', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍪', '🍩', '🍫', '🍬', '🍭'
            ],
            drinks: [
                // Bebidas calientes
                '☕', '🍵', '🧃', '🥛', '🍼', '🫖', '🧋',
                // Bebidas frías
                '🥤', '🧊', '🧉', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🧴', '🥢'
            ],
            objects: [
                // Objetos comunes
                '📦', '📱', '💻', '🖥️', '⌨️', '🖱️', '🖨️', '📷', '📹', '🎥', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏰', '⏱️', '⏲️', '🕰️', '⏳', '⌛', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧰', '🧲', '🔫', '💣', '🧨', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '💈', '⚗️', '🔭', '🔬', '🕳️', '💊', '💉', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧴', '🧷', '🧹', '🧽', '🧼', '🧻', '🧺', '🧯'
            ],
            symbols: [
                // Símbolos y emojis expresivos
                '⭐', '🌟', '💫', '✨', '🌙', '☀️', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '⭐', '🌟', '💫', '✨', '⚡', '🔥', '💥', '💢', '💨', '💤', '💦', '💧', '💰', '💎', '🔱', '⚜️', '🔰', '⭕', '✅', '☑️', '✔️', '❌', '❎', '➕', '➖', '➗', '✖️', '🟰', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '🔔', '🔕', '🔇', '🔈', '🔉', '🔊', '📢', '📣', '📯', '🔔', '🔕', '🎵', '🎶', '🎤', '🎧', '📻', '🎷', '🎺', '🎸', '🎹', '🎻', '🥁', '🎯', '🎲', '🎮', '🕹️', '🎰', '🎳'
            ]
        };
        
        this.emojiNames = {
            // Frutas y verduras
            '🍎': ['manzana', 'apple', 'fruta', 'rojo'],
            '🍊': ['naranja', 'orange', 'fruta', 'citrico'],
            '🍋': ['limón', 'lemon', 'fruta', 'amarillo', 'citrico'],
            '🍌': ['banana', 'plátano', 'fruta', 'amarillo'],
            '🍉': ['sandía', 'watermelon', 'fruta', 'verde', 'rojo'],
            '🍇': ['uvas', 'grapes', 'fruta', 'morado'],
            '🍓': ['fresa', 'strawberry', 'fruta', 'rojo'],
            '🥝': ['kiwi', 'fruta', 'verde'],
            '🍑': ['cereza', 'cherry', 'fruta', 'rojo'],
            '🥭': ['mango', 'fruta', 'tropical'],
            '🍍': ['piña', 'pineapple', 'fruta', 'tropical'],
            '🥥': ['coco', 'coconut', 'fruta', 'tropical'],
            '🥑': ['aguacate', 'avocado', 'verde', 'verdura'],
            '🍅': ['tomate', 'tomato', 'verdura', 'rojo'],
            '🥒': ['pepino', 'cucumber', 'verdura', 'verde'],
            '🥬': ['lechuga', 'lettuce', 'verdura', 'verde'],
            '🥕': ['zanahoria', 'carrot', 'verdura', 'naranja'],
            '🌽': ['maíz', 'corn', 'verdura', 'amarillo'],
            '🥦': ['brócoli', 'broccoli', 'verdura', 'verde'],
            '🧄': ['ajo', 'garlic', 'verdura', 'blanco'],
            '🧅': ['cebolla', 'onion', 'verdura', 'blanco'],
            '🍄': ['hongo', 'mushroom', 'verdura', 'champiñon'],
            
            // Comida preparada
            '🍕': ['pizza', 'comida', 'italiana'],
            '🍔': ['hamburguesa', 'burger', 'comida', 'americana'],
            '🌭': ['hot dog', 'perro caliente', 'comida', 'americana'],
            '🥪': ['sandwich', 'sándwich', 'comida'],
            '🌮': ['taco', 'comida', 'mexicana'],
            '🌯': ['burrito', 'comida', 'mexicana'],
            '🥙': ['wrap', 'comida', 'envuelto'],
            '🧆': ['falafel', 'comida', 'medio oriente'],
            '🍖': ['carne', 'meat', 'comida', 'proteína'],
            '🍗': ['pollo', 'chicken', 'comida', 'proteína'],
            '🥩': ['filete', 'steak', 'carne', 'proteína'],
            '🥓': ['tocino', 'bacon', 'carne', 'proteína'],
            '🍳': ['huevo', 'egg', 'comida', 'proteína'],
            '🥚': ['huevo', 'egg', 'crudo', 'proteína'],
            '🧀': ['queso', 'cheese', 'lácteo'],
            '🥨': ['pretzel', 'pan', 'snack'],
            '🥖': ['baguette', 'pan', 'francés'],
            '🥐': ['croissant', 'pan', 'francés'],
            '🍞': ['pan', 'bread', 'carbohidrato'],
            '🥯': ['bagel', 'pan', 'americano'],
            '🥞': ['pancakes', 'panqueques', 'desayuno'],
            '🧇': ['waffle', 'desayuno'],
            '🍝': ['pasta', 'espagueti', 'italiana'],
            '🍜': ['ramen', 'sopa', 'japonesa'],
            '🍲': ['estofado', 'sopa', 'comida'],
            '🥘': ['paella', 'comida', 'española'],
            '🍛': ['curry', 'comida', 'india'],
            '🍣': ['sushi', 'japonesa', 'pescado'],
            '🍤': ['camarón', 'shrimp', 'mariscos'],
            '🍙': ['onigiri', 'japonesa', 'arroz'],
            '🍚': ['arroz', 'rice', 'carbohidrato'],
            '🍱': ['bento', 'japonesa', 'lunch'],
            '🍘': ['senbei', 'japonesa', 'snack'],
            '🍡': ['dango', 'japonesa', 'dulce'],
            '🍧': ['raspado', 'helado', 'frío'],
            '🍨': ['helado', 'ice cream', 'dulce', 'frío'],
            '🍦': ['helado', 'ice cream', 'dulce', 'frío'],
            '🥧': ['pie', 'pastel', 'dulce'],
            '🧁': ['cupcake', 'pastelito', 'dulce'],
            '🍰': ['pastel', 'cake', 'dulce'],
            '🎂': ['pastel', 'cumpleaños', 'dulce'],
            '🍪': ['galleta', 'cookie', 'dulce'],
            '🍩': ['dona', 'donut', 'dulce'],
            '🍫': ['chocolate', 'dulce'],
            '🍬': ['caramelo', 'candy', 'dulce'],
            '🍭': ['chupetín', 'lollipop', 'dulce'],
            
            // Bebidas
            '☕': ['café', 'coffee', 'bebida', 'caliente'],
            '🍵': ['té', 'tea', 'bebida', 'caliente'],
            '🧃': ['jugo', 'juice', 'bebida', 'caja'],
            '🥛': ['leche', 'milk', 'bebida', 'lácteo'],
            '🍼': ['biberón', 'bottle', 'bebé'],
            '🫖': ['tetera', 'teapot', 'té'],
            '🧋': ['bubble tea', 'té', 'perlas'],
            '🥤': ['refresco', 'soda', 'bebida', 'frío'],
            '🧊': ['hielo', 'ice', 'frío'],
            '🧉': ['mate', 'bebida', 'argentina'],
            '🍶': ['sake', 'bebida', 'japonesa'],
            '🍾': ['champán', 'champagne', 'bebida', 'celebración'],
            '🍷': ['vino', 'wine', 'bebida', 'alcohólica'],
            '🍸': ['martini', 'cóctel', 'bebida', 'alcohólica'],
            '🍹': ['cóctel', 'cocktail', 'bebida', 'tropical'],
            '🍺': ['cerveza', 'beer', 'bebida', 'alcohólica'],
            '🍻': ['cervezas', 'beers', 'bebida', 'celebración'],
            '🥂': ['brindis', 'champagne', 'celebración'],
            '🥃': ['whisky', 'bebida', 'alcohólica'],
            '🧴': ['botella', 'bottle', 'envase'],
            
            // Objetos comunes
            '📦': ['caja', 'box', 'paquete', 'envío'],
            '📱': ['teléfono', 'móvil', 'celular', 'smartphone'],
            '💻': ['laptop', 'computadora', 'ordenador'],
            '🖥️': ['computadora', 'monitor', 'desktop'],
            '⌨️': ['teclado', 'keyboard'],
            '🖱️': ['mouse', 'ratón'],
            '🖨️': ['impresora', 'printer'],
            '📷': ['cámara', 'camera', 'foto'],
            '📹': ['videocámara', 'video'],
            '🎥': ['cámara', 'película', 'cine'],
            '📞': ['teléfono', 'phone'],
            '☎️': ['teléfono', 'clásico', 'retro'],
            '📟': ['pager', 'beeper'],
            '📠': ['fax', 'máquina'],
            '📺': ['televisión', 'tv', 'pantalla'],
            '📻': ['radio', 'música'],
            '🎙️': ['micrófono', 'microphone'],
            '🎚️': ['control', 'volumen'],
            '🎛️': ['mezclador', 'mixer'],
            '🧭': ['brújula', 'compass'],
            '⏰': ['despertador', 'alarm'],
            '⏱️': ['cronómetro', 'stopwatch'],
            '⏲️': ['timer', 'temporizador'],
            '🕰️': ['reloj', 'clock'],
            '⏳': ['reloj arena', 'hourglass'],
            '⌛': ['reloj arena', 'hourglass'],
            '📡': ['antena', 'satélite'],
            '🔋': ['batería', 'battery'],
            '🔌': ['enchufe', 'plug'],
            '💡': ['bombilla', 'idea', 'luz'],
            '🔦': ['linterna', 'flashlight'],
            '🕯️': ['vela', 'candle'],
            '🧯': ['extintor', 'fire extinguisher'],
            '🛢️': ['barril', 'petróleo', 'aceite'],
            '💸': ['dinero', 'money', 'billetes'],
            '💵': ['dólar', 'dollar', 'billete'],
            '💴': ['yen', 'billete', 'japonés'],
            '💶': ['euro', 'billete', 'europeo'],
            '💷': ['libra', 'billete', 'británico'],
            '💰': ['bolsa dinero', 'money bag'],
            '💳': ['tarjeta', 'credit card'],
            '💎': ['diamante', 'joya', 'precious'],
            '⚖️': ['balanza', 'justicia', 'peso'],
            '🔧': ['llave', 'wrench', 'herramienta'],
            '🔨': ['martillo', 'hammer', 'herramienta'],
            '⚒️': ['martillo', 'pico', 'herramienta'],
            '🛠️': ['herramientas', 'tools'],
            '⛏️': ['pico', 'pickaxe', 'herramienta'],
            '🔩': ['tuerca', 'nut', 'tornillo'],
            '⚙️': ['engranaje', 'gear', 'configuración'],
            '🧰': ['caja herramientas', 'toolbox'],
            '🧲': ['imán', 'magnet'],
            
            // Símbolos
            '⭐': ['estrella', 'star', 'favorito'],
            '🌟': ['estrella', 'brillante', 'star'],
            '💫': ['estrella', 'dizzy', 'mareo'],
            '✨': ['sparkles', 'brillos', 'magia'],
            '🌙': ['luna', 'moon', 'noche'],
            '☀️': ['sol', 'sun', 'día'],
            '🌞': ['sol', 'cara', 'feliz'],
            '🌝': ['luna', 'cara', 'llena'],
            '🌛': ['luna', 'cara', 'cuarto'],
            '🌜': ['luna', 'cara', 'cuarto'],
            '🌚': ['luna', 'cara', 'nueva'],
            '🌕': ['luna', 'llena', 'full'],
            '🌖': ['luna', 'gibosa', 'menguante'],
            '🌗': ['luna', 'cuarto', 'menguante'],
            '🌘': ['luna', 'creciente', 'menguante'],
            '🌑': ['luna', 'nueva', 'new'],
            '🌒': ['luna', 'creciente', 'creciente'],
            '🌓': ['luna', 'cuarto', 'creciente'],
            '🌔': ['luna', 'gibosa', 'creciente'],
            '⚡': ['rayo', 'lightning', 'electricidad'],
            '🔥': ['fuego', 'fire', 'caliente'],
            '💥': ['explosión', 'boom', 'impacto'],
            '💢': ['enojo', 'anger', 'molesto'],
            '💨': ['viento', 'wind', 'rápido'],
            '💤': ['sueño', 'sleep', 'zzz'],
            '💦': ['gotas', 'water', 'sudor'],
            '💧': ['gota', 'drop', 'agua'],
            '💰': ['dinero', 'money', 'riqueza'],
            '💎': ['diamante', 'diamond', 'valioso'],
            '🔱': ['tridente', 'trident'],
            '⚜️': ['flor de lis', 'fleur de lis'],
            '🔰': ['principiante', 'beginner'],
            '⭕': ['círculo', 'circle', 'correcto'],
            '✅': ['check', 'correcto', 'aprobado'],
            '☑️': ['check', 'box', 'marcado'],
            '✔️': ['check', 'mark', 'correcto'],
            '❌': ['equis', 'x', 'incorrecto'],
            '❎': ['equis', 'x', 'cancel'],
            '➕': ['más', 'plus', 'añadir'],
            '➖': ['menos', 'minus', 'restar'],
            '➗': ['dividir', 'divide', 'división'],
            '✖️': ['multiplicar', 'multiply', 'por'],
            '🟰': ['igual', 'equal', 'equals'],
            '💯': ['cien', 'hundred', 'perfecto'],
            '🔔': ['campana', 'bell', 'notificación'],
            '🔕': ['silencio', 'mute', 'sin sonido'],
            '🔇': ['mute', 'silencio', 'sin audio'],
            '🔈': ['volumen', 'bajo', 'speaker'],
            '🔉': ['volumen', 'medio', 'speaker'],
            '🔊': ['volumen', 'alto', 'speaker'],
            '📢': ['megáfono', 'megaphone', 'anuncio'],
            '📣': ['megáfono', 'cheering', 'grito'],
            '📯': ['corneta', 'horn', 'postal'],
            '🎵': ['nota', 'music', 'musical'],
            '🎶': ['notas', 'music', 'musical'],
            '🎤': ['micrófono', 'microphone', 'karaoke'],
            '🎧': ['auriculares', 'headphones', 'música'],
            '🎷': ['saxofón', 'saxophone', 'jazz'],
            '🎺': ['trompeta', 'trumpet', 'brass'],
            '🎸': ['guitarra', 'guitar', 'rock'],
            '🎹': ['piano', 'keyboard', 'teclas'],
            '🎻': ['violín', 'violin', 'clásico'],
            '🥁': ['tambor', 'drum', 'percusión'],
            '🎯': ['diana', 'target', 'objetivo'],
            '🎲': ['dado', 'dice', 'juego'],
            '🎮': ['control', 'gamepad', 'videojuego'],
            '🕹️': ['joystick', 'arcade', 'juego'],
            '🎰': ['slot', 'casino', 'tragamonedas'],
            '🎳': ['bowling', 'bolos', 'deporte']
        };
        
        this.init();
    }
    
    init() {
        this.createOverlay();
        this.bindEvents();
        this.loadEmojis();
    }
    
    createOverlay() {
        if (!document.getElementById('emoji-selector-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'emoji-selector-overlay';
            overlay.className = 'emoji-selector-overlay';
            overlay.addEventListener('click', () => this.close());
            document.body.appendChild(overlay);
        }
    }
    
    bindEvents() {
        const selector = document.getElementById('emoji-selector');
        if (!selector) return;
        
        // Eventos de categorías
        const categoryBtns = selector.querySelectorAll('.emoji-category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.setCategory(category);
                this.updateCategoryButtons();
                this.loadEmojis();
            });
        });
        
        // Evento de búsqueda
        const searchInput = selector.querySelector('#emoji-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.loadEmojis();
            });
        }
        
        // Eventos de emojis
        const emojiGrid = selector.querySelector('#emoji-grid');
        if (emojiGrid) {
            emojiGrid.addEventListener('click', (e) => {
                if (e.target.classList.contains('emoji-item')) {
                    const emoji = e.target.textContent;
                    this.selectEmoji(emoji);
                }
            });
        }
    }
    
    setCategory(category) {
        this.currentCategory = category;
    }
    
    updateCategoryButtons() {
        const categoryBtns = document.querySelectorAll('.emoji-category-btn');
        categoryBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.currentCategory);
        });
    }
    
    loadEmojis() {
        const emojiGrid = document.getElementById('emoji-grid');
        if (!emojiGrid) return;
        
        let emojisToShow = [];
        
        if (this.currentCategory === 'all') {
            emojisToShow = [
                ...this.emojis.food,
                ...this.emojis.drinks,
                ...this.emojis.objects,
                ...this.emojis.symbols
            ];
        } else {
            emojisToShow = this.emojis[this.currentCategory] || [];
        }
        
        // Filtrar por búsqueda
        if (this.searchTerm) {
            emojisToShow = emojisToShow.filter(emoji => {
                const names = this.emojiNames[emoji] || [];
                return names.some(name => name.toLowerCase().includes(this.searchTerm));
            });
        }
        
        // Renderizar emojis
        emojiGrid.innerHTML = emojisToShow.map(emoji => 
            `<div class="emoji-item" title="${this.getEmojiTitle(emoji)}">${emoji}</div>`
        ).join('');
        
        // Mostrar mensaje si no hay resultados
        if (emojisToShow.length === 0) {
            emojiGrid.innerHTML = '<div class="no-emojis">No se encontraron emojis</div>';
        }
    }
    
    getEmojiTitle(emoji) {
        const names = this.emojiNames[emoji] || [];
        return names.length > 0 ? names[0] : emoji;
    }
    
    selectEmoji(emoji) {
        if (this.onSelect) {
            this.onSelect(emoji);
        }
        
        if (this.targetInput) {
            if (this.targetInput.tagName === 'INPUT') {
                this.targetInput.value = emoji;
            } else {
                this.targetInput.textContent = emoji;
            }
            
            // Disparar evento change
            const event = new Event('change', { bubbles: true });
            this.targetInput.dispatchEvent(event);
        }
        
        this.close();
    }
    
    open(options = {}) {
        const selector = document.getElementById('emoji-selector');
        const overlay = document.getElementById('emoji-selector-overlay');
        
        if (!selector || !overlay) return;
        
        // Configurar opciones
        this.onSelect = options.onSelect || null;
        this.targetInput = options.targetInput || null;
        
        // Configurar categoría inicial
        if (options.category) {
            this.setCategory(options.category);
            this.updateCategoryButtons();
        }
        
        // Limpiar búsqueda
        const searchInput = selector.querySelector('#emoji-search');
        if (searchInput) {
            searchInput.value = '';
            this.searchTerm = '';
        }
        
        // Cargar emojis
        this.loadEmojis();
        
        // Mostrar selector
        selector.classList.add('active');
        overlay.classList.add('active');
        this.isOpen = true;
        
        // Focus en búsqueda
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }
    
    close() {
        const selector = document.getElementById('emoji-selector');
        const overlay = document.getElementById('emoji-selector-overlay');
        
        if (selector) selector.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        
        this.isOpen = false;
        this.onSelect = null;
        this.targetInput = null;
    }
    
    // Método para crear un input con selector de emoji
    createEmojiInput(container, options = {}) {
        const inputContainer = document.createElement('div');
        inputContainer.className = 'emoji-input-container';
        
        const emojiDisplay = document.createElement('div');
        emojiDisplay.className = 'emoji-display';
        emojiDisplay.textContent = options.defaultEmoji || '😊';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = options.placeholder || 'Nombre del producto';
        input.className = options.inputClass || '';
        input.name = options.name || '';
        input.value = options.value || '';
        
        emojiDisplay.addEventListener('click', () => {
            this.open({
                category: options.category || 'food',
                onSelect: (emoji) => {
                    emojiDisplay.textContent = emoji;
                    emojiDisplay.classList.remove('empty');
                    
                    // Disparar evento personalizado
                    const event = new CustomEvent('emojiSelected', { 
                        detail: { emoji, input } 
                    });
                    container.dispatchEvent(event);
                }
            });
        });
        
        inputContainer.appendChild(emojiDisplay);
        inputContainer.appendChild(input);
        
        if (container) {
            container.appendChild(inputContainer);
        }
        
        return { container: inputContainer, input, emojiDisplay };
    }
    
    // Método para convertir un input normal en input con emoji
    enhanceInput(input, options = {}) {
        const parent = input.parentNode;
        const container = document.createElement('div');
        container.className = 'emoji-input-container';
        
        const emojiDisplay = document.createElement('div');
        emojiDisplay.className = 'emoji-display';
        emojiDisplay.textContent = options.defaultEmoji || '😊';
        
        const triggerBtn = document.createElement('button');
        triggerBtn.type = 'button';
        triggerBtn.className = 'emoji-trigger-btn';
        triggerBtn.innerHTML = '😊';
        triggerBtn.title = 'Seleccionar emoji';
        
        // Modificar el input
        input.style.paddingRight = '45px';
        
        triggerBtn.addEventListener('click', () => {
            this.open({
                category: options.category || 'food',
                targetInput: input,
                onSelect: (emoji) => {
                    if (options.onSelect) {
                        options.onSelect(emoji, input);
                    }
                }
            });
        });
        
        // Reorganizar elementos
        parent.insertBefore(container, input);
        container.appendChild(input);
        container.appendChild(triggerBtn);
        
        return { container, input, triggerBtn };
    }
}

// Funciones globales para compatibilidad
function openEmojiSelector(options = {}) {
    if (window.emojiSelector) {
        window.emojiSelector.open(options);
    }
}

function closeEmojiSelector() {
    if (window.emojiSelector) {
        window.emojiSelector.close();
    }
}

// Inicializar selector de emojis cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.emojiSelector = new EmojiSelector();
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmojiSelector;
} 