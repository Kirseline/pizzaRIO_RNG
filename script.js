// Ingredienti divisi per categoria, come richiesto dall'utente, adattati per la logica di generazione.
const ingredients = {
    'CarnI': ['Prosciutto', 'Wurstel', 'Pancetta', 'Salamino Piccante', 'Lucanica', 'Speck', 'Cotto', 'Kebab', 'Crudo', 'Nduja'],
    'Formaggi': ['Mozzarella', 'Grana', 'Ricotta', 'Scamorza Affumicata', 'Gorgonzola', 'Mozzarella di Bufala Fior di Latte', 'Brie'],
    'Pesce': ['Acciughe', 'Tonno', 'Gamberetti'],
    'Verdure': ['Aglio', 'Melanzane', 'Funghi', 'Capperi', 'Cipolle', 'Pomodori Freschi', 'Rucola', 'Carciofi', 'Patate', 'Rosmarino', 'Olive', 'Peperoni', 'Zucchine', 'Radicchio', 'Porcini']
};

// Ingredienti Base - Essenziali per molte pizze e da non considerare nel conteggio "casuale"
const baseIngredients = ['Olio', 'Peperoncino', 'Pomodoro'];
const cheeseBase = ['Mozzarella']; // Considerata base in molte pizze (bianche e rosse)

// Array contenente tutti gli ingredienti escludibili per generare le checkboxes
const allExcludableIngredients = [].concat(...Object.values(ingredients));

/**
 * Inizializza le checkbox di esclusione.
 */
function initializeExclusions() {
    const exclusionsDiv = document.getElementById('exclusions');
    exclusionsDiv.innerHTML = ''; // Pulisce il div

    allExcludableIngredients.forEach(ingredient => {
        const checkboxId = `exclude-${ingredient.replace(/\s/g, '-')}`;
        const container = document.createElement('div');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.value = ingredient;
        
        const label = document.createElement('label');
        label.htmlFor = checkboxId;
        label.textContent = ingredient;

        container.appendChild(checkbox);
        container.appendChild(label);
        exclusionsDiv.appendChild(container);
    });
}

/**
 * Genera una pizza casuale in base alle opzioni selezionate.
 */
function generatePizza() {
    // 1. Lettura delle opzioni
    const numIngredients = parseInt(document.getElementById('num-ingredients').value);
    const baseType = document.getElementById('base-type').value;

    // 2. Determinazione degli ingredienti esclusi
    const excludedIngredients = Array.from(document.querySelectorAll('#exclusions input:checked'))
                                    .map(checkbox => checkbox.value);

    // 3. Preparazione della lista di ingredienti disponibili
    const availableIngredients = allExcludableIngredients.filter(ing => !excludedIngredients.includes(ing));

    if (availableIngredients.length < numIngredients) {
        displayError(`Errore: Troppi ingredienti esclusi. Seleziona al massimo ${availableIngredients.length} ingredienti.`);
        return;
    }

    // 4. Scelta del tipo di Base (Rossa/Bianca) e aggiunta degli ingredienti base
    let pizzaIngredients = [];
    let finalBaseType = baseType;

    if (baseType === 'both') {
        finalBaseType = Math.random() < 0.5 ? 'red' : 'white';
    }

    if (finalBaseType === 'red') {
        pizzaIngredients.push('Pomodoro'); // Base Rossa
    }
    
    // Mozzarella è quasi sempre presente, la includiamo come base non conteggiata.
    // Usiamo il 'Mozzarella' dall'array `cheeseBase` per consistenza, ma la consideriamo come base.
    if (!excludedIngredients.includes('Mozzarella')) {
        pizzaIngredients.push('Mozzarella');
    }

    // 5. Selezione casuale degli ingredienti
    let selectedIngredients = [];
    let workingPool = [...availableIngredients];

    for (let i = 0; i < numIngredients; i++) {
        if (workingPool.length === 0) break; // Termina se l'elenco si esaurisce

        const randomIndex = Math.floor(Math.random() * workingPool.length);
        const ingredient = workingPool[randomIndex];
        
        selectedIngredients.push(ingredient);
        workingPool.splice(randomIndex, 1); // Rimuove per evitare duplicati
    }

    pizzaIngredients = [...new Set([...pizzaIngredients, ...selectedIngredients])]; // Unisce e rimuove duplicati
    
    // 6. Output del risultato
    displayResult(finalBaseType, pizzaIngredients);
}

/**
 * Visualizza il risultato della pizza generata.
 * @param {string} baseType - 'red' or 'white'.
 * @param {string[]} ingredients - Lista degli ingredienti.
 */
function displayResult(baseType, ingredients) {
    const resultDiv = document.getElementById('pizza-result');
    const baseText = baseType === 'red' ? 'Rossa (Base Pomodoro)' : 'Bianca';
    
    let html = `<h2>La Tua Pizza Casuale:</h2>`;
    html += `<p><strong>Tipo Base:</strong> ${baseText}</p>`;
    html += `<p><strong>Ingredienti:</strong></p>`;
    html += `<ul class="ingredient-list">`;
    
    ingredients.forEach(ing => {
        html += `<li>${ing}</li>`;
    });
    
    html += `</ul>`;
    
    resultDiv.innerHTML = html;
    resultDiv.style.backgroundColor = baseType === 'red' ? '#fff0f0' : '#f0faff';
}

/**
 * Visualizza un messaggio di errore.
 * @param {string} message - Il messaggio di errore.
 */
function displayError(message) {
    const resultDiv = document.getElementById('pizza-result');
    resultDiv.innerHTML = `<h2>⚠️ Errore di Generazione</h2><p>${message}</p>`;
    resultDiv.style.backgroundColor = '#ffeeee';
}

// Inizializza le checkbox all'avvio
window.onload = initializeExclusions;