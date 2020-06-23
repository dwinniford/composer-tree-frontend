  function getCSRFToken() {
    return unescape(document.cookie.split('=')[1])
  }

class App {
    constructor() {

    }

    static init() {
        // sets up all event listeners for user login and signup and logout
        fetch(BACKEND_URL, {credentials: 'include'})
            .then(resp => resp.json())
            .then(function(json) {
                console.log("fetched cookie:", json)
            })

        signupButton.addEventListener("click", function(event){
            User.displaySignupForm()
        })
        
        loginButton.addEventListener("click", function(event) {
            User.displayLoginForm()
        })
        
        logoutButton.addEventListener("click", function(event) {
            User.logout()
        })
        
        // facebookButton.addEventListener("click", function(event){
        //     User.loginWithFacebook()
        // })
        
        websIndexButton.addEventListener("click", function(event) {
            event.preventDefault();
            fetch(BACKEND_URL + "/trees", {credentials: 'include', headers: {'X-CSRF-Token': getCSRFToken()}})
                .then(resp => resp.json())
                .then(function(json) {
                    Tree.displayIndex(json)
                })
        }) 
        addWebButton.addEventListener("click", function(event) {
            const treeForm = new Form(Tree.fieldsArray(), "/trees", "POST", Tree)
            const formElement = treeForm.render()
            App.clearContent()
            heading.innerHTML = Tree.newFormTitle()
            content.appendChild(formElement)
            Tree.addNewFormListener()
        })
    }

    static resetContent() {
        sidebar.innerHTML = ''
        heading.innerText = "Welcome to Song Web"
        contentDescription.innerText = 
        "A voice note app to organize your song ideas and foster creativity.";
        contentLinks.innerHTML = ''
        networkContainer.innerHTML = ''
        userName.innerHTML = ''
        nav.classList.remove("open")
        userForm.classList.remove("hide")
        userLinks.classList.remove("hide")
        if (content.querySelector("form")) {
            content.querySelector("form").remove()
        }
    }
    static clearContent() {
        heading.innerHTML = ''
        contentLinks.innerHTML = ''
        networkContainer.innerHTML = ''
        contentDescription.innerHTML = ''
        if (content.querySelector("form")) {
            content.querySelector("form").remove()
        }
    }
}