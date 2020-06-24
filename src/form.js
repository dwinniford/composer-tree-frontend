class Form { 
    constructor(fieldsArray, urlEnd, method, classObject) {
        this.fieldsArray = fieldsArray;
        this.urlEnd = urlEnd;
        this.method = method;
        this.classObject = classObject
    }

    render() {
        const form = document.createElement("FORM")
        form.action = BACKEND_URL + this.urlEnd
        const errors = document.createElement('ul')
        errors.classList.add("errors-container")
        form.appendChild(errors)
        this.fieldsArray.forEach(function(element) {
            const input = document.createElement("INPUT")
            input.setAttribute("type", element[1])
            input.id = element[0]
            input.setAttribute("name", element[0])
            input.required = true 
            const label = document.createElement("LABEL")
            label.innerHTML = element[0]
            label.for = element[0]
            // if (classInstance) {
            //     input.value = classInstance[element[0]]
            // }
            form.appendChild(label)
            form.appendChild(input)
            const br = document.createElement("br")
            form.appendChild(br)
        })
        const submit = document.createElement("button")
        submit.innerHTML = "Submit"
        submit.setAttribute("type", "submit")
        form.appendChild(submit)
        return form 
    }
}