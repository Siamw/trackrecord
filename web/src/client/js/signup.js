// Get the modal
var registerForm = document.getElementById('rf');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === registerForm) {
        registerForm.style.display = "none";
    }
};
