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
    return `
    <tr class="DexTable-row">
        <td class="DexTable-data">${capitalize(pokemon.name.toString())}</td>
        <td class="DexTable-data">${capitalize(pokemon.types.toString())}</td>
        <td class="DexTable-data">${capitalize(pokemon.regular_abilities.toString())}</td>
        <td class="DexTable-data">${pokemon.hidden_ability ? capitalize(pokemon.hidden_ability.toString()) : ''}</td>
    </tr>`;
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
    if (typeof str !== 'string') {
        return str; // Return unchanged if it's not a string
    }

    // Split the string by commas, capitalize each word, and join them back together
    return str.split(',').map(word => word.charAt(0).toUpperCase() + word.slice(1).trim()).join("<br>");
}