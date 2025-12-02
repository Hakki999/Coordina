const optionNav = document.querySelectorAll(".optionNav");

optionNav.forEach(option => {
    option.addEventListener("click", evt => {

        optionNav.forEach(opt => {
            opt.classList = "optionNav closeOption";
        });

        evt.currentTarget.classList = "optionNav openOption";
    })
})

document.querySelector('#formAdd').addEventListener('submit', function (evt) {
    evt.preventDefault();

    fetch('/')
});