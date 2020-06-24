const deleteNoteButton = document.querySelector("#delete-note")
const createChildNoteButton = document.querySelector("#create-child-note")
const editButton = document.querySelector("#edit-note")

class Note {
    constructor(json, edgeCount) {
        this.id = json.id 
        this.title = json.title 
        this.description = json.description
        this.starred = json.starred 
        this.parent_note_id = json.parent_note_id
        this.tree_id = json.tree_id
        this.user_id = json.user_id
        this.edgeCount = edgeCount
        this.audioUrl = json.audio_url
    }

    render() {
        const title = document.querySelector('#overlay-title')
        title.innerHTML = this.title 
        const description = document.querySelector('#overlay-description')
        description.innerHTML = this.description 
        editButton.dataset.treeId = this.tree_id
        editButton.dataset.id = this.id 
        if (document.querySelector("audio")) {
            document.querySelector("audio").remove()
        }
        
        if (this.audioUrl) {
            const audio = document.createElement('audio');
            audio.setAttribute('controls', '');
            audio.src = BACKEND_URL + this.audioUrl
            clipContainer.appendChild(audio);
            recordButton.disabled = true 
            recordButton.classList.add("hide")
            stopRecordButton.disabled = true 
            stopRecordButton.classList.add("hide")
        } else {
            recordButton.disabled = false 
            recordButton.classList.remove("hide")
            stopRecordButton.disabled = false 
            stopRecordButton.classList.remove("hide")
        }
        // if note does not have a child note display delete button
        
        if (this.edgeCount > 1) {
            deleteNoteButton.classList.add("hide")
        } else {
            deleteNoteButton.classList.remove("hide")
            deleteNoteButton.dataset.treeId = this.tree_id
            deleteNoteButton.dataset.id = this.id 
        }
        createChildNoteButton.dataset.treeId = this.tree_id
        createChildNoteButton.dataset.parentNoteId = this.id
        if (this.edgeCount === 1 || this.edgeCount === 0) {
            deleteNoteButton.classList.add("open")
        } else {
            deleteNoteButton.classList.remove("open")
        }
                    
    }

    static addEditFormListener() {
        const editNoteForm = document.querySelector('[name="edit-note-form"]')
        editNoteForm.addEventListener('submit', function(event) {
            event.preventDefault()
            console.log(event.currentTarget)
            const data = {
                title: event.currentTarget.title.value,
                description: event.currentTarget.description.value
            }
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
                    console.log(json)
                    editNoteForm.remove()
                    overlayInner.querySelector("#overlay-title").innerHTML = json.title
                    overlayInner.querySelector("#overlay-description").innerHTML = json.description
                    fetch(`${BACKEND_URL}/trees/${json.tree_id}`, getConfigObject)
                        .then(resp => resp.json())
                        .then(function(json) {
                            const tree = new Tree(json)
                            tree.displayShow()
                        })

                })
            
        })
    }

    static addDeleteListener() {
        deleteNoteButton.addEventListener("click", function(event) {
            fetch(BACKEND_URL + `/trees/${event.target.dataset.treeId}/notes/${event.target.dataset.id}`, deleteConfigObject)
                .then(function(response){
                    console.log(response.ok)
                    if (response.ok) {
                        fetch(BACKEND_URL+`/trees/${deleteNoteButton.dataset.treeId}`, getConfigObject)
                            .then(resp => resp.json())
                            .then(function(json) {
                                const tree = new Tree(json)
                                tree.displayShow()
                            })
                            
                        Overlay.close()
                        
                    }
                })
        })
    }

    
    static fieldsArray() {
        return [["title", "text"], ["description", "text"]]
    }
    static addCreateButtonListener() {
        createChildNoteButton.addEventListener("click", function(event) {
            const editForm = document.querySelector('[name="edit-note-form"]')
           if (editForm) {
               editForm.remove()
           }
           if (document.querySelector("audio")) {
               document.querySelector("audio").remove()
           }
           recordButton.classList.add("hide")
           stopRecordButton.classList.add("hide")
           const form = new Form(Note.fieldsArray(), `/trees/${event.target.dataset.treeId}/notes`, "POST", Note)
           const formElement = form.render()
           formElement.setAttribute("name", "create-child-note-form")
           const parentNoteInput = document.createElement('input')
           parentNoteInput.type = "hidden"
           parentNoteInput.value = event.target.dataset.parentNoteId
           parentNoteInput.setAttribute("name", "parentNoteId")
           formElement.appendChild(parentNoteInput)
           overlayInner.appendChild(formElement)
           overlayTitle.innerHTML = "Create a Branch Note"
           overlayDescription.innerHTML = ''
           overlayButtons.classList.add("close")
           Note.addChildNoteFormListener()
        })
    }
    static addChildNoteFormListener() {
        const form = overlay.querySelector('[name="create-child-note-form"]')
        
        form.addEventListener('submit', function(event) {
            event.preventDefault()
            const data = {note: {
                title: event.target.title.value,
                description: event.target.description.value,
                parent_note_id: parseInt(event.target.parentNoteId.value) 
            }}
            const configObject = {
                credentials: 'include',
                method: "POST",
                headers: {
                    'X-CSRF-Token': getCSRFToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
            fetch(event.target.action, configObject)
                .then(resp => resp.json())
                .then(function(json) {
                    // can i use note render here?
                    const note = new Note(json, 1)
                    note.render()
                    form.remove()
                    overlayButtons.classList.remove("close")
                    fetch(`${BACKEND_URL}/trees/${json.tree_id}`, getConfigObject)
                        .then(resp => resp.json())
                        .then(function(json) {
                            const tree = new Tree(json)
                            tree.displayShow()
                        })
                })
        })
    }

    static addEditButtonListener() {
        editButton.addEventListener("click", function(event) {
            if (!document.querySelector('[name="edit-note-form"]')) {
                const createForm = document.querySelector('[name="create-child-note-form"]')
                if (createForm) {
                    createForm.remove()
                }
                const form = new Form(Note.fieldsArray(), `/trees/${event.target.dataset.treeId}/notes/${event.target.dataset.id}`, "PATCH", Note)
                const formElement = form.render()
                formElement.setAttribute("name", "edit-note-form")
                formElement.title.value = overlayTitle.innerHTML
                formElement.description.value = overlayDescription.innerHTML
                overlayTitle.innerHTML = "Edit Note"
                overlayDescription.innerHTML = ""
                overlayInner.appendChild(formElement)
                Note.addEditFormListener() 
            }
            
         })
    }
    static addRootNoteFormListener() {
        const newRootNoteForm = document.querySelector('[name="create-root-note-form"]')
        newRootNoteForm.addEventListener('submit', function(event) {
            event.preventDefault()
            const data = { note: {
                title: event.currentTarget.title.value,
                description: event.currentTarget.description.value
                }  
            }
            const configObject = {
                credentials: 'include',
                method: "POST",
                headers: {
                    'X-CSRF-Token': getCSRFToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
            fetch(event.currentTarget.action, configObject)
                .then(resp => resp.json())
                .then(function(json) {
                    newRootNoteForm.remove()
                    fetch(`${BACKEND_URL}/trees/${json.tree_id}`)
                        .then(resp => resp.json())
                        .then(function(json) {
                            const tree = new Tree(json)
                            tree.displayShow()
                        })

                })
            
        })
    }
    
}

Note.addDeleteListener()
Note.addCreateButtonListener()
Note.addEditButtonListener()
