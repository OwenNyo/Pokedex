const DexTable = document.querySelector(".DexTable");

// Counter at 1017
const pokemonCount = 1017;

// Variables for the different api calls
var pokemondataset = {};

// On Page Load function
window.onload = fetchDataAndRenderPage;

// Fetch Data and Render Page
async function fetchDataAndRenderPage() {
    
    for (let i = 1; i <= pokemonCount; i++) {
        getPokemonDataSet(i);
    }
    
    renderPageStructure();
}

// Pokemon Variable Set
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
    let normal_sprite = pokemon["sprites"].front_default;
    let shiny_sprite = pokemon["sprites"].front_shiny;

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
        "n_sprite" : normal_sprite,
        "s_sprite" : shiny_sprite
    };
}

// Table Structure
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

    const pokemonRow = 
    `<div class="DexTable-container"> 
        <div class="DexTable-container-img">
            <img 
            class="pokemon_image" 
            src="${pokemon.n_sprite}" 
            data-normal-sprite="${pokemon.n_sprite}" 
            data-shiny-sprite="${pokemon.s_sprite}" 
            data-is-shiny="false"
            onclick="toggleSprite(this)">
        </div>
        <div class="DexTable-container-name">
            <span>${capitalize(pokemon.name.toString())}</span>
        </div>
        <div class="DexTable-container-type">
            <span class="${getTypeStyles(pokemon.types[0], true, hasSecondType)} type_text">${capitalize(pokemon.types[0].toString())}</span>
            ${hasSecondType ? `<span class="${getTypeStyles(pokemon.types[1], false, true)} type_text">${capitalize(pokemon.types[1].toString())}</span>` : ''}
        </div>
        <div class="DexTable-container-abilities">
            <div class="pokemon_ability">
                <table>
                    <thead>
                        <tr>
                            <th>Regular Abilities</th>
                        </tr>
                    <thead>
                    <tbody>
                        <tr>
                            <td>${capitalize(pokemon.regular_abilities.toString())}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="pokemon_hidden_ability">
                <table>
                    <thead>
                        <tr>
                            <th>Hidden Abilities</th>
                        </tr>
                    <thead>
                    <tbody>
                        <tr>
                            <td>${pokemon.hidden_ability ? capitalize(pokemon.hidden_ability.toString()) : ''}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>`

    return pokemonRow;
}

// Rendering Table Structure
function renderPageStructure() {
    // Clear existing content in the table body
    while (DexTable.firstChild) {
        DexTable.removeChild(DexTable.firstChild);
    }

    for (let i = 1; i <= pokemonCount; i++) {
        let pokemonData = pokemondataset[i];
        let html = PokemonHTMLStructure(pokemonData);

        // Create a container and append it to the table
        const container = document.createElement("div");
        container.innerHTML = html;
        DexTable.appendChild(container);
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

function toggleSprite(element) {
    const isShiny = element.dataset.isShiny === "true";
    const sprite = isShiny ? element.dataset.normalSprite : element.dataset.shinySprite;

    element.src = sprite;
    element.dataset.isShiny = (!isShiny).toString();
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

