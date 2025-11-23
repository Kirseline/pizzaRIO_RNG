// Ingredienti divisi per categoria.
const ingredients = {
    'CarnI / Salumi': ['Prosciutto', 'Wurstel', 'Pancetta', 'Salamino Piccante', 'Lucanica', 'Speck', 'Cotto', 'Kebab', 'Crudo', 'Nduja'],
    'Formaggi': ['Mozzarella', 'Grana', 'Ricotta', 'Scamorza Affumicata', 'Gorgonzola', 'Mozzarella di Bufala Fior di Latte', 'Brie'],
    'Pesce': ['Acciughe', 'Tonno', 'Gamberetti'],
    'Verdure / Frutta': ['Aglio', 'Melanzane', 'Funghi', 'Capperi', 'Cipolle', 'Pomodori Freschi', 'Rucola', 'Carciofi', 'Patate', 'Rosmarino', 'Olive', 'Peperoni', 'Zucchine', 'Radicchio', 'Porcini', 'Ananas'] 
};

// Ingredienti considerati di base, che NON devono essere visualizzati nella lista ingredienti extra.
const BASE_ELEMENTS = ['Pomodoro', 'Mozzarella'];

// Array contenente tutti gli ingredienti escludibili e forzabili
const allSelectableIngredients = [].concat(...Object.values(ingredients));

/**
 * Funzione per cambiare la scheda attiva.
 * @param {string} type - 'force' o 'exclude'.
 * @param {string} category - Chiave della categoria da mostrare.
 */
function openCategory(type, category) {
    const tabButtons = document.querySelectorAll(`#${type}-tab-buttons .tab-button`);
    const tabContents = document.querySelectorAll(`#${type}-content .tab-content`);

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    document.getElementById(`tab-btn-${type}-${category.replace(/\s|\//g, '-')}`).classList.add('active');
    document.getElementById(`content-${type}-${category.replace(/\s|\//g, '-')}`).classList.add('active');
}

/**
 * Inizializza le schede e le checkbox di esclusione e forzatura divise per categoria.
 */
function initializeExclusionsAndForces() {
    const types = [{ id: 'exclude', label: 'Escludi' }, { id: 'force', label: 'Forza' }];

    types.forEach(typeInfo => {
        const tabButtonsDiv = document.getElementById(`${typeInfo.id}-tab-buttons`);
        const contentDiv = document.getElementById(`${typeInfo.id}-content`);
        tabButtonsDiv.innerHTML = '';
        contentDiv.innerHTML = '';

        let isFirst = true;

        for (const category in ingredients) {
            const safeCategory = category.replace(/\s|\//g, '-');
            
            // Crea il pulsante della scheda
            const button = document.createElement('button');
            button.className = isFirst ? 'tab-button active' : 'tab-button';
            button.id = `tab-btn-${typeInfo.id}-${safeCategory}`;
            button.textContent = category.split('/')[0].trim();
            button.onclick = () => openCategory(typeInfo.id, category);
            tabButtonsDiv.appendChild(button);

            // Crea il contenuto della scheda
            const content = document.createElement('div');
            content.className = isFirst ? 'tab-content active' : 'tab-content';
            content.id = `content-${typeInfo.id}-${safeCategory}`;
            
            const checkboxesContainer = document.createElement('div');
            checkboxesContainer.className = 'ingredient-checkboxes';

            ingredients[category].forEach(ingredient => {
                const checkboxId = `${typeInfo.id}-${ingredient.replace(/\s/g, '-')}`;
                
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
                checkboxesContainer.appendChild(container);
            });

            content.appendChild(checkboxesContainer);
            contentDiv.appendChild(content);

            if (isFirst) {
                isFirst = false;
            }
        }
    });
}

/**
 * Genera una pizza casuale in base alle opzioni selezionate.
 */
function generatePizza() {
    // 1. Lettura delle opzioni
    const numExtraIngredients = parseInt(document.getElementById('num-ingredients').value);

    // 2. Ingredienti Forzati ed Esclusi
    const forcedIngredients = Array.from(document.querySelectorAll('#force-content input:checked'))
                                    .map(checkbox => checkbox.value);
    const excludedIngredients = Array.from(document.querySelectorAll('#exclude-content input:checked'))
                                    .map(checkbox => checkbox.value);

    // 3. Validazione
    const conflicts = forcedIngredients.filter(ing => excludedIngredients.includes(ing));
    if (conflicts.length > 0) {
        displayError(`Conflitto: Gli ingredienti forzati (${conflicts.join(', ')}) non possono essere anche esclusi.`);
        return;
    }

    if (numExtraIngredients < 0 || isNaN(numExtraIngredients)) {
        displayError('Il numero di ingredienti extra deve essere zero o un numero positivo.');
        return;
    }
    
    // 4. Determinazione del Tipo Base (Sempre Casuale)
    const finalBaseType = Math.random() < 0.5 ? 'red' : 'white';
    
    // 5. Setup degli Elementi Base (NON vengono aggiunti alla lista di output finale)
    let baseElementsPresent = [];
    if (!excludedIngredients.includes('Mozzarella')) {
        baseElementsPresent.push('Mozzarella');
    }
    if (finalBaseType === 'red' && !excludedIngredients.includes('Pomodoro')) {
        baseElementsPresent.push('Pomodoro');
    }

    // 6. Preparazione della pool di ingredienti per la selezione casuale
    // La pool deve escludere: gli esclusi, i forzati, e gli elementi base (Pomodoro/Mozzarella).
    const ingredientsToExcludeFromRandomSelection = [
        ...excludedIngredients, 
        ...forcedIngredients, 
        ...BASE_ELEMENTS
    ];

    let workingPool = allSelectableIngredients
        .filter(ing => !ingredientsToExcludeFromRandomSelection.includes(ing));
    
    // 7. Calcolo e Selezione Casuale
    const ingredientsNeeded = numExtraIngredients;
    let selectedRandomIngredients = [];
    
    if (workingPool.length < ingredientsNeeded) {
        displayError(`Non ci sono abbastanza ingredienti disponibili (${workingPool.length}) per soddisfare i ${ingredientsNeeded} ingredienti casuali richiesti.`);
        return;
    }

    for (let i = 0; i < ingredientsNeeded; i++) {
        const randomIndex = Math.floor(Math.random() * workingPool.length);
        const ingredient = workingPool[randomIndex];
        
        selectedRandomIngredients.push(ingredient);
        workingPool.splice(randomIndex, 1);
    }

    // 8. Output del risultato
    // La lista finale per il display contiene SOLO gli ingredienti forzati e gli extra casuali.
    const finalDisplayIngredients = [...new Set([...forcedIngredients, ...selectedRandomIngredients])]; 

    displayResult(finalBaseType, finalDisplayIngredients);
}

/**
 * Visualizza il risultato della pizza generata.
 * @param {string} baseType - 'red' or 'white'.
 * @param {string[]} ingredients - Lista degli ingredienti extra e forzati.
 */
function displayResult(baseType, ingredients) {
    const resultDiv = document.getElementById('pizza-result');
    const baseText = baseType === 'red' ? 'ROSSA' : 'BIANCA';
    
    let html = `<h2>La Tua Pizza Casuale:</h2>`;
    html += `<p><strong>Base:</strong> ${baseText} (Casuale)</p>`;
    
    if (ingredients.length > 0) {
        html += `<p><strong>Ingredienti Extra:</strong></p>`;
        html += `<ul class="ingredient-list">`;
        
        ingredients.forEach(ing => {
            html += `<li>${ing}</li>`;
        });
        
        html += `</ul>`;
    } else {
        // Se non ci sono extra, la pizza è essenzialmente una Margherita/Bianca (se la base non è esclusa)
        html += `<p>Nessun ingrediente extra selezionato. La pizza sarà una **${baseText} Base**.</p>`;
    }
    
    resultDiv.innerHTML = html;
    resultDiv.style.backgroundColor = baseType === 'red' ? '#fff0f0' : '#f0faff';
}

// Inizializza le schede e le checkbox all'avvio
window.onload = initializeExclusionsAndForces;
