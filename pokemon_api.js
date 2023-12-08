const DexTableHead = document.querySelector(".DexTable-head");
const DexTableBody = document.querySelector(".DexTable-body");

// Counter at 1017
const pokemonCount = 1017;

// Variables for the different api calls
var pokemondataset = {};
var movedataset = {};

// On Page Load function
window.onload = fetchDataAndRenderPage;

// Fetch Data and Render Page
async function fetchDataAndRenderPage() {
    for (let i = 1; i <= pokemonCount; i++) {
        await getPokemonDataSet(i);
    }
    
    renderPageStructure();
}

// Pokemon.html API
async function getPokemonDataSet(num) {
    // Fetch url for pokemon api
    let url = "https://pokeapi.co/api/v2/pokemon/" + num.toString();

    const pokemon_result = await fetch(url);
    const pokemon = await pokemon_result.json();

    console.log(pokemon);

    // Map into variables for us to insert into our pokedex list
    let pokemonName = pokemon["name"];
    let pokemonType = pokemon["types"].map(type => type.type.name);
    let abilities = pokemon["abilities"];
    let regularAbilities = [];
    let hiddenAbilities = [];
    let pokemonLogo = pokemon["sprites"].front_default;

    abilities.forEach(ability => {
        let abilityName = ability.ability.name;
        if (ability.is_hidden) {
            hiddenAbilities.push(abilityName);
        } else {
            regularAbilities.push(abilityName);
        }
    });

    pokemondataset[num] = {
        "name": pokemonName,
        "types": pokemonType,
        "regular_abilities": regularAbilities,
        "hidden_ability": hiddenAbilities,
        "sprite" : pokemonLogo
    };
}

// Pokemon.html Table Structure
function PokemonHTMLStructure(pokemon) {
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

    const pokemonRow = `
    <tr class="DexTable-row">
        <td class="DexTable-data">
            <div class = "DexTable-data-container">
                <img class="DexTable-data-logo" src="${pokemon.sprite}">
                <span>${capitalize(pokemon.name.toString())}</span>
            </div>
        </td>
        <td class="DexTable-data">
            <div class = "DexTable-data-container">
            <span class="${getTypeStyles(pokemon.types[0], true, hasSecondType)} type_text">${capitalize(pokemon.types[0].toString())}</span>
            ${hasSecondType ? `<span class="${getTypeStyles(pokemon.types[1], false, true)} type_text">${capitalize(pokemon.types[1].toString())}</span>` : ''}
            </div>
        </td>
        <td class="DexTable-data">${capitalize(pokemon.regular_abilities.toString())}</td>
        <td class="DexTable-data">${pokemon.hidden_ability ? capitalize(pokemon.hidden_ability.toString()) : ''}</td>
    </tr>`;

    return pokemonRow;
}

// Rendering Page Structure
function renderPageStructure() {
    // Clear existing content in the table body
    while (DexTableBody.firstChild) {
        DexTableBody.removeChild(DexTableBody.firstChild);
    }

    // Append Header Row
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th>Pokemon</th>
        <th>Type</th>
        <th>Abilities</th>
        <th>Hidden Abilities</th>
    `;
    DexTableHead.appendChild(headerRow);

    const delayBetweenRows = 50;

    for (let i = 1; i <= pokemonCount; i++) {
        let pokemonData = pokemondataset[i];
        let html = PokemonHTMLStructure(pokemonData);

        // Use setTimeout to add rows with a delay
        setTimeout(() => {
            const row = document.createElement("tr");
            row.innerHTML = html;
            DexTableBody.appendChild(row);
        }, delayBetweenRows * i);
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
