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

let DexTable = document.querySelector(".DexTable");
let DexTableBody = document.querySelector(".DexTable-body");

async function renderPokemonAPI() {
    // Fetch Pokemon Character API
    const pokemon_result = await fetch("https://pokeapi.co/api/v2/pokemon/");
    const pokemon_characters = await pokemon_result.json();

    // Fetch Pokemon Details
    const pokemon_details = await Promise.all(pokemon_characters.map(async (character) =>
        {
            const pokemon_result = await fetch(`https://pokeapi.co/api/v2/pokemon/${character}`);
            const pokemon_detail = await pokemon_result.json();
            return pokemon_detail;
        })
    );
    
    DexTableBody.innerHTML = pokemon_characters.map((data, index) => {
        const data1 = pokemon_details[index];
        return PokedexHTML(data, data1);
    }).join(``);

}

function PokedexHTML(pokemon_characters, pokemon_details) {
    return `
    <tr class="DexTable-row">
        <td class="DexTable-data">${pokemon_characters}</td>
        <td class="DexTable-data">${pokemon_details.types}</td>
        <td class="DexTable-data">${pokemon_details.abilities}</td>
    </tr>
    `;
}

renderPokemonAPI();
