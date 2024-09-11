let myButton = document.getElementById("gridCreateButton");

// Helper sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

myButton.addEventListener('click', async () => {
    document.body.classList.add("fade-out");
    await sleep(1300);
    document.body.classList.remove("fade-out");
    document.body.classList.add("fade-in");
    await sleep(1600);
    document.body.classList.remove("fade-out");
})