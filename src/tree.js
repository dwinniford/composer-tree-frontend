class Tree  {
    constructor(json) {
        this.title = json.title;
        this.description = json.description;
        this.id = json.id; 
        this.notes = json.notes;
        Tree.all.push(this)
        console.log(Tree.all)
    }

    static all = []
    //  this variable needs to be instantiated as an array but when its returned not be reset as an empty array
    // new Tree is not called until I click a tree button to load its show page

    static clearContent() {
        heading.innerHTML = ''
        contentDescription.innerHTML = ''
        contentLinks.innerHTML = ''
        networkContainer.innerHTML = ''
    }
    displayShow() {
        Tree.clearContent()
        heading.innerHTML = this.title
        contentDescription.innerHTML = this.description
        contentLinks.innerHTML = ''
        if (content.querySelector('form')) {
            content.querySelector('form').remove()
        }
        const treeInstance = this 
        const editTreeButton = document.createElement("button")
        editTreeButton.innerHTML = "Edit"
        editTreeButton.classList.add("blue-button")
        contentLinks.appendChild(editTreeButton)
        editTreeButton.addEventListener("click", function(event) {
            const treeForm = new Form(Tree.fieldsArray(), "/trees/"+treeInstance.id, "PATCH", Tree)
            const formElement = treeForm.render()
            formElement.title.value = heading.innerHTML 
            formElement.description.value = contentDescription.innerHTML
            App.clearContent()
            heading.innerHTML = "Edit Song Web"
            content.appendChild(formElement)
            Tree.addEditFormListener()
        })
        
        const deleteLink = document.createElement("a")
        deleteLink.href = BACKEND_URL + "/trees/"+treeInstance.id
        deleteLink.innerHTML = "delete" 
        deleteLink.classList.add("blue-button")
        contentLinks.appendChild(deleteLink)
        deleteLink.addEventListener("click", function(event) {
            event.preventDefault();
            const r = confirm("Delete Tree and all notes?")
            if (r) {
                const configObject = {
                    method: "DELETE",
                    credentials: 'include',
                    headers: {
                        'X-CSRF-Token': getCSRFToken()
                    }
                }
                fetch(event.target.href, configObject)
                .then(function(response){
                    console.log(response.ok)
                    if (response.ok) {
                        Tree.clearContent()
                        fetch(BACKEND_URL+"/trees", {credentials: 'include', headers: {'X-CSRF-Token': getCSRFToken()}})
                        .then(resp => resp.json())
                        .then(function(json) {
                            Tree.displayIndex(json)
                        })
                    }
                })
            }
        }) 
        
        if (this.notes === undefined || this.notes.length === 0 ) {
            const newRootNoteButton = document.createElement("button")
            newRootNoteButton.innerHTML = "Add a note"
            newRootNoteButton.dataset.treeId = this.id 
            newRootNoteButton.classList.add("blue-button")
            contentLinks.appendChild(newRootNoteButton)
            newRootNoteButton.addEventListener('click', function(event) {
                if (content.querySelector("form")) {
                    content.querySelector("form").remove()
                }
                const form = new Form(Note.fieldsArray(), `/trees/${event.target.dataset.treeId}/notes`, "POST", Note)
                const formElement = form.render()
                formElement.setAttribute("name", "create-root-note-form")
                content.appendChild(formElement)
                Note.addRootNoteFormListener()
            })
        } else {
            const notesNetworkObject = new Network(this.notes)
            const notesNetworkElement = notesNetworkObject.display()
        }
        
        
    }

    static appendIndexButton(element) {
        const item = document.createElement('button')
        item.innerHTML = element.title
        item.setAttribute("data-id", element.id )
        item.classList.add("blue-button")
        item.classList.add("tree-index-button")
        sidebar.appendChild(item)
        item.addEventListener("click", function(event) {
            fetch(`${BACKEND_URL}/trees/${parseInt(event.target.getAttribute("data-id"))}`, 
            {credentials: 'include', headers: {'X-CSRF-Token': getCSRFToken()}})
                .then(resp => resp.json())
                .then(function(json) {
                    const tree = Tree.all.find(tree => tree.id === json.id)
                    tree.notes = json.notes
                    tree.displayShow()
                })
        })
    }
    

    static displayIndex(json) {
        // heading.innerHTML = ""
        // contentDescription.innerHTML = ''
        if (Tree.all.length === 0) {
            json.forEach(tree => new Tree(tree))
        }
        sidebar.innerHTML = ''
        const sidebarHeading = document.createElement("h3")
        sidebarHeading.innerHTML = "Your Song Webs"
        sidebarHeading.classList.add("sidebar-heading")
        sidebar.appendChild(sidebarHeading)
        const sortButton = document.createElement('button')
        sortButton.innerHTML = "Sort Webs Alphabetically"
        sortButton.classList.add("blue-button")
        sidebar.appendChild(sortButton)
        json.forEach(element => Tree.appendIndexButton(element));
        console.log(Tree.all)
        sortButton.addEventListener("click", function(event) {
            const sortedIndex = Tree.all.sort((a, b) => {
                if (a.title < b.title) {
                    return -1
                } else if (a.title > b.title) {
                    return 1
                }
            })
            sidebar.querySelectorAll(".tree-index-button").forEach(element => element.remove())
            sortedIndex.forEach(function(element) {  
                const item = document.createElement('button')
                item.innerHTML = element.title
                item.setAttribute("data-id", element.id )
                item.classList.add("blue-button")
                item.classList.add("tree-index-button")
                sidebar.appendChild(item)
                item.addEventListener("click", function(event) {
                    fetch(`${BACKEND_URL}/trees/${parseInt(event.target.getAttribute("data-id"))}`, 
                    {credentials: 'include', headers: {'X-CSRF-Token': getCSRFToken()}})
                        .then(resp => resp.json())
                        .then(function(json) {
                            const tree = Tree.all.find(tree => tree.id === json.id)
                            tree.notes = json.notes
                            // this fetch returns the belongs to data of the tree instance whereas
                            // the index only has the tree info.  need to find the tree in Tree.all and update with notes
                            tree.displayShow()
                        })
                })
            })
        })
        
        
    }

    static addNewFormListener() {
        const form = content.querySelector("form")
        form.addEventListener("submit", function(event) {
            event.preventDefault()
            console.log("submit")
            const titleInput = form.title.value  
            const descriptionInput = form.description.value
            const data = Tree.formData(titleInput, descriptionInput)
            const configObject = {
                credentials: 'include',
                method: "POST",
                headers: {
                    'X-CSRF-Token': getCSRFToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
            fetch(BACKEND_URL + "/trees", configObject)
                .then(resp => resp.json())
                .then(function(json) {
                    const tree = new Tree(json)
                    tree.displayShow()
                    Tree.appendIndexButton(json)
                }).catch(function(errors) {
                    console.log(errors)
                })
        })

    }

    static addEditFormListener() {
        const form = content.querySelector("form")
        form.addEventListener("submit", function(event) {
            event.preventDefault()
            console.log("submit")
            const titleInput = form.title.value  
            const descriptionInput = form.description.value
            const data = Tree.formData(titleInput, descriptionInput)
            const configObject = {
                credentials: 'include',
                method: "PATCH",
                headers: {
                    'X-CSRF-Token': getCSRFToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
            fetch(event.currentTarget.action, configObject)
                .then(resp => resp.json())
                .then(function(json) {
                    const tree = new Tree(json)
                    tree.displayShow()
                    // finds element in index and updates
                    const indexButton = sidebar.querySelector(`[data-id="${json.id}"]`)
                    indexButton.innerHTML = json.title 
                }).catch(function(errors) {
                    console.log(errors)
                })
        })
    }

    static formData(title, description) {
        return {tree: {title: title, description: description}}
    }

    static fieldsArray() {
        return [["title", "text"], ["description", "text"]]
    }
    static newFormTitle() {
        return "Create a New Song Web"
    }
}
