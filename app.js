const inputs = document.querySelectorAll(".input-field");
const toggle_btn = document.querySelectorAll(".toggle");
const main = document.querySelector("main");
const bullets = document.querySelectorAll(".bullets span");
const images = document.querySelectorAll(".image");
const textGroup = document.querySelector('.text-group');

// Initialize with the first text
textGroup.innerHTML = bullets[0].getAttribute('data-text');

inputs.forEach((inp) => {
    inp.addEventListener("focus", () => {
        inp.classList.add("active");
    });
    inp.addEventListener("blur", () => {
        if (inp.value !== "") return;
        inp.classList.remove("active");
    });
});

toggle_btn.forEach((btn) => {
    btn.addEventListener("click", () => {
        main.classList.toggle("sign-up-mode");
    });
});

function changeText(index) {
    textGroup.classList.remove('show');
    
    setTimeout(() => {
        textGroup.innerHTML = bullets[index].getAttribute('data-text');
        textGroup.classList.add('show');
    }, 300); // Match this with the CSS transition duration
}

function moveSlider(index) {
    const currentImage = document.querySelector(`.img-${index}`);
    images.forEach((img) => img.classList.remove("show"));
    currentImage.classList.add("show");

    bullets.forEach((bull) => bull.classList.remove("active"));
    bullets[index - 1].classList.add("active");
}

// Change text and image based on bullet clicks
bullets.forEach((bullet, index) => {
    bullet.addEventListener("click", () => {
        moveSlider(index + 1); // Adjust for image index
        changeText(index);
    });
});

// Automatically change text and image every 3.5 seconds
setInterval(() => {
    currentIndex = (currentIndex + 1) % bullets.length;
    moveSlider(currentIndex + 1);
    changeText(currentIndex);
}, 3500);
