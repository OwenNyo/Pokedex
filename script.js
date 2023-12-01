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

let DexTableBody = document.querySelector(".DexTable-body");

// Counter at 1017
const pokemonCount = 1017;
var pokedex = {};

// On load, we will render the page
window.onload = async function() {
    for (let i = 1; i <= pokemonCount; i++)
    {
        await getPokemon(i);
    }

    renderPokedex();
}

// Getting pokemon api
async function getPokemon(num) {
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

    abilities.forEach(ability => {
        let abilityName = ability.ability.name;
        if (ability.is_hidden) {
            hiddenAbilities.push(abilityName);
        } else {
            regularAbilities.push(abilityName);
        }
    });

    pokedex[num] = {
        "name": pokemonName,
        "types": pokemonType,
        "regular_abilities": regularAbilities,
        "hidden_ability": hiddenAbilities
    };
}

// Defines table structure
function PokedexHTML(pokemon) {
    // Helper function to generate the CSS styles for each typing
    function getTypeStyles(type, isFirstType) {
        const backgroundColor = getTypeColor(type);
        const borderColor = getTypeBorderColor(type);

        let styles = `background-color: ${backgroundColor}; border-color: ${borderColor};`;

        if (isFirstType) {
            styles += 'border-top-right-radius: 0; border-bottom-right-radius: 0;';
        } else {
            styles += 'border-top-left-radius: 0; border-bottom-left-radius: 0;';
        }

        return styles;
    }

    // Helper function to generate the CSS class for each typing
    function getTypeClass(type) {
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
    function getTypeStyles(type) {
        let classList = `border-radius ${getTypeClass(type)}`;
        return classList;
    }

    // In your code wherever you render the Pokémon in the table
    const hasSecondType = pokemon.types.length > 1;

    const pokemonRow = `
    <tr class="DexTable-row">
        <td class="DexTable-data">${capitalize(pokemon.name.toString())}</td>
        <td class="DexTable-data">
            <span class="${getTypeStyles(pokemon.types[0])} type_text">${capitalize(pokemon.types[0].toString())}</span>
            ${hasSecondType ? `<span class="${getTypeStyles(pokemon.types[1])} type_text">${capitalize(pokemon.types[1].toString())}</span>` : ''}
        </td>
        <td class="DexTable-data">${capitalize(pokemon.regular_abilities.toString())}</td>
        <td class="DexTable-data">${pokemon.hidden_ability ? capitalize(pokemon.hidden_ability.toString()) : ''}</td>
    </tr>`;

    // Assuming DexTableBody is your table body element
    return pokemonRow;
}

// Loads records into table
function renderPokedex() {
    for (let i = 1; i <= pokemonCount; i++) {
        let pokemonData = pokedex[i];
        let html = PokedexHTML(pokemonData);
        DexTableBody.innerHTML += html;
    }
}


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