const containerInner = document.querySelector('.pokemon-container-inner');

// Ball rotation
document.addEventListener("mousemove", rotateBalls);

// Card Flip
containerInner.addEventListener('click', function () {
    this.classList.toggle('flipped');
});

// Rotating Ball Script
function rotateBalls(event) {
    const scaleFactor = 1 / 20;
    const balls = document.querySelectorAll(".ball");
    const x = event.clientX * scaleFactor;
    const y = event.clientY * scaleFactor;
  
    for (let i = 0; i < balls.length; ++i) {
      const isOdd = i % 2 !== 0;
      const boolInt = isOdd ? -1 : 1;
      balls[i].style.transform = `translate(${x * boolInt}px, ${
        y * boolInt
      }px) rotate(${x * boolInt * 10}deg)`;
    }
}

window.onload = function() {
    // Get current date and time
    var currentDate = new Date();
    
    // Format the date and time
    var trainer_time = currentDate.toLocaleTimeString();
    var trainer_date = currentDate.toLocaleDateString();

    // Randomize trainer ID between 1 and 99999
    var trainerId = Math.floor(Math.random() * 99999) + 1;

    document.getElementById('trainer-time').innerText = trainer_time;
    document.getElementById('trainer-date').innerText = trainer_date;
    document.getElementById('rand-id').innerText = trainerId;

    // Set up an interval to update the time every second
    setInterval(function() {
      var updatedDate = new Date();
      document.getElementById('trainer-time').innerText = updatedDate.toLocaleTimeString();
    }, 1000);
}