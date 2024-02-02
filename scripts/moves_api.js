let DexTableHead = document.querySelector(".DexTable-head");
let DexTableBody = document.querySelector(".DexTable-body")

// Counter at 937
const moveCount = 937;

// Variables for the different api calls
var movedataset = {};

// On Page Load function
window.onload = fetchDataAndRenderPage;

// Fetch Data and Render Page
async function fetchDataAndRenderPage() {
    
    for (let i = 1; i <= moveCount; i++) {
        await getMoveDataSet(i);
    }
    
    renderPageStructure();
}

// Pokemon Variable Set
async function getMoveDataSet(num) {
    // Fetch url for pokemon api
    let url = "https://pokeapi.co/api/v2/move/" + num.toString();

    const move_result = await fetch(url);
    const move = await move_result.json();

    console.log(move);

    // Map into variables for us to insert into our pokedex list
    let moveName = move["name"];
    let moveType = move["type"].name;
    let moveAccuracy = move["accuracy"];
    let movePower = move["power"];
    let moveEffect = move["effect_entries"].effect;

    movedataset[num] = {
        "name": moveName,
        "type": moveType,
        "accuracy": moveAccuracy,
        "power": movePower,
        "effect": moveEffect
    };
}

// Table Structure
function MoveHTMLStructure(move) {
    // Helper function to generate the CSS class for each typing
    const getTypeClass = (type) => {
        // Default class for unknown types
        const defaultClass = 'type-default';

        // Map types to CSS classes
        const typeClasses = {
            'normal': 'type-normal',
            'fire': 'type-fire',
            'water': 'type-water',
            'grass': 'type-grass',
            'electric': 'type-electric',
            'ice': 'type-ice',
            'fighting': 'type-fighting',
            'poison': 'type-poison',
            'ground': 'type-ground',
            'flying': 'type-flying',
            'psychic': 'type-psychic',
            'bug': 'type-bug',
            'rock': 'type-rock',
            'ghost': 'type-ghost',
            'dragon': 'type-dragon',
            'dark': 'type-dark',
            'steel': 'type-steel',
            'fairy': 'type-fairy',
        };

        // Return the CSS class based on the type
        return typeClasses[type] || defaultClass;
    }

    // Helper function to generate the CSS styles for each typing
    const getTypeStyles = (type, isFirstType, hasSecondType) => {
        let classList = `border-radius ${getTypeClass(type)}`;

        // Apply different border radius based on whether it's the first or second type
        if (hasSecondType) {
            if (isFirstType) {
                classList += ' border-right-radius';
            } else {
                classList += ' border-left-radius';
            }
        }

        return classList;
    }

    // In your code wherever you render the Pokémon in the table
    const hasSecondType = pokemon.types.length > 1;

    const moveRow = `
    <tr class="DexTable-row">
        <td class="DexTable-data">
            <div class="DexTable-data-name">
                <span>${capitalize(move.name)}</span>
            </div>
            <div class="DexTable-data-type">
                <span class="${getTypeStyles(move.type[0], true, hasSecondType)} type_text">${capitalize(move.type[0])}</span>
                ${hasSecondType ? `<span class="${getTypeStyles(move.type[1], false, true)} type_text">${capitalize(move.type[1])}</span>` : ''}
            </div>
            <div class="DexTable-data-power">
                <span>Power: ${capitalize(move.power)}</span>
            </div>
            <div class="DexTable-data-accuracy">
                <span>Accuracy: ${capitalize(move.accuracy)}</span>
            </div>
            <div class="DexTable-data-effect">
                <span>Effect: ${capitalize(move.effect)}</span>
            </div>
        </td>
    </tr>`;
    return moveRow;
}

// Rendering Table Structure
function renderPageStructure() {
    // Update the DexTableHead to include table header
    DexTableHead.innerHTML = `
    <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Power</th>
        <th>Accuracy</th>
        <th>Effect</th>
    </tr>
    `;
    for (let i = 1; i <= moveCount; i++) {
        let moveData = movedataset[i];

        // Check if data exists before rendering
        if (moveData) {
            let html = MoveHTMLStructure(moveData);

            // Create a container and append it to the table body
            const container = document.createElement("div");
            container.innerHTML = html;
            DexTableBody.appendChild(container);
        }
    }
}

// Capitalize Function
function capitalize(str) {
    if (typeof str === 'undefined' || str === null) {
        return '';  // Return an empty string if the input is undefined or null
    }

    if (typeof str !== 'string') {
        return str; // Return unchanged if it's not a string
    }

    // Split the string by commas, capitalize each word, and join them back together
    return str.split(',').map(word => word.charAt(0).toUpperCase() + word.slice(1).trim()).join("<br>");
}

// Light Dark Toggle Function
document.addEventListener("DOMContentLoaded", function () {
    const modeToggle = document.getElementById("modeToggle");

    // Set light mode as active on page load
    modeToggle.classList.add("light-mode");

    modeToggle.addEventListener("click", function () {
        // Toggle between light and dark mode on click
        modeToggle.classList.toggle("light-mode");
        modeToggle.classList.toggle("dark-mode");
        
        // Update the active-mode class on indicators based on the current mode
        const lightIndicator = document.querySelector(".light-indicator");
        const darkIndicator = document.querySelector(".dark-indicator");

        lightIndicator.classList.toggle("active-mode");
        darkIndicator.classList.toggle("active-mode");

        // Toggle dark mode class on the DexContent section
        const dexContent = document.querySelector(".DexContent");
        dexContent.classList.toggle("dark-mode");

        // Toggle dark mode class on the body only
        document.body.classList.toggle("dark-mode");

    });
});

