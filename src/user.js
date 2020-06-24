class User {
    constructor(json) {

    }

    static displaySignupForm() {
        const form = new Form(User.fieldsArray(), "/users", "POST", User)
        const formElement = form.render()
        // formElement.setAttribute("name", "create-child-note-form")
        userForm.innerHTML = ''
        userForm.appendChild(formElement)
        // add form listener
        formElement.addEventListener("submit", function(event) {
            event.preventDefault();
            const name = event.currentTarget.name.value
            const email = event.currentTarget.email.value 
            const password = event.currentTarget.password.value 
            const data = { user: {name: name, email: email, password: password }}
            const configObject = {
                method: "POST",
                credentials: 'include',
                headers: {
                    'X-CSRF-Token': getCSRFToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
            fetch(BACKEND_URL + "/users", configObject)
                .then(resp => resp.json())
                .then(function(json) {
                    if (json.errors) {
                        const errorsContainer = userForm.querySelector('.errors-container')
                        errorsContainer.innerHTML = json.errors.map(function(e) {
                            return `<li>${e}</li>`
                        })
                    } else {
                        userName.innerHTML = `Logged in as ${json.name}`
                        nav.classList.add("open")
                        userForm.classList.add("hide")
                        userLinks.classList.add("hide")
                        userForm.innerHTML = ''
                    }
                })
                
            // after fetch display nav and remove form and user buttons
            
        })
    }

    static displayLoginForm() {
        const form = new Form(User.fieldsArray(), "/sessions", "POST", User)
        // does my form class work with sessions controller. why do i pass the User object?
        const formElement = form.render()
        // formElement.setAttribute("name", "create-child-note-form")
        userForm.innerHTML = ''
        userForm.appendChild(formElement)
        // add form listener
        formElement.addEventListener("submit", function(event) {
            event.preventDefault();
            const name = event.currentTarget.name.value
            const email = event.currentTarget.email.value 
            const password = event.currentTarget.password.value 
            const data = { user: {name: name, email: email, password: password }}
            const configObject = {
                method: "POST",
                credentials: 'include',
                headers: {
                    'X-CSRF-Token': getCSRFToken(),

                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
            fetch(BACKEND_URL + "/login", configObject)
                .then(function(resp){
                    return resp.json()
                })
                .then(function(json) {
                    if (json.errors) {
                        const errorsContainer = userForm.querySelector('.errors-container')
                        errorsContainer.innerHTML = json.errors.map(function(e) {
                            return `<li>${e}</li>`
                        })
                    } else {
                        userName.innerHTML = `Logged in as ${json.name}`
                        // after fetch display nav and remove form and user buttons
                        nav.classList.add("open")
                        userForm.classList.add("hide")
                        userLinks.classList.add("hide")
                        userForm.innerHTML = ''
                    }
                    
                })
            
            
        })
    }

    static loginWithFacebook() {
        console.log("logged in with facebook")
        // after successful login
        nav.classList.add("open")
        userForm.classList.add("hide")
        userLinks.classList.add("hide")
    }

    static logout () {
        const configObject = {
            method: "DELETE",
            credentials: 'include',
            headers: {
                'X-CSRF-Token': getCSRFToken()
            }
        }
        fetch(BACKEND_URL + "/sessions", configObject)
            .then( function(response) {
                console.log(response.status)
                if (response.status === 200) {
                    // after fetch to sessions destroy
                    nav.classList.remove("open")
                    userForm.classList.remove("hide")
                    userLinks.classList.remove("hide")
                    // remove other content - sidebar, note content, link 
                    App.resetContent()
                    // display home content
                }
            })     
    }

    static fieldsArray() {
        return [["name", "text"], ["email", "text"], ["password", "password"]]
    }
}