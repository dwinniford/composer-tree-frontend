class Network {
    constructor(noteArray) {
        this.noteArray = noteArray
        this.parentTreeId = noteArray[0].tree_id
    }
    
    createAdaptedNoteArray() { 
        // refactor with map
        const nodeArray = [] 
        this.noteArray.forEach(function(note) {
            nodeArray.push({id: note.id, label: note.title})
        })
        return nodeArray
    }

    createEdgesArray() {
        const edgesArray = []
        this.noteArray.forEach(function(note) {
            if (note.parent_note_id) {
                edgesArray.push({from: note.id, to: note.parent_note_id})
            }
        })
        return edgesArray
    }

    display(){
        // create an array with nodes
        // have rails api send data in the correct format? only send id and title of note.  click for popup window with full info and recording
        const nodes = new vis.DataSet(this.createAdaptedNoteArray());

        // create an array with edges
        const edges = new vis.DataSet(this.createEdgesArray());

        // create a network
        const container = document.createElement('div')
        container.id = 'mynetwork'
        networkContainer.innerHTML = ''
        networkContainer.appendChild(container)

        // provide the data in the vis format
        const data = {
            nodes: nodes,
            edges: edges
        };
        const options = {};

        // initialize your network!
        const network = new vis.Network(container, data, options);
       
        this.addNodeListener(network)
        return network
    }
    addNodeListener(network) {
        const treeId = this.parentTreeId 
        // need the tree id for nested routes
        network.on("selectNode", function(event) {
            // console.log(event.edges.length) // returns an array according to number of connections
            const eventEdgeCount = event.edges.length
            fetch(BACKEND_URL+`/trees/${treeId}/notes/${event.nodes[0]}`)
                .then(resp => resp.json())
                .then(function(json) {
                    
                    const note = new Note(json, eventEdgeCount)
                    note.render()
                    Overlay.open()
                    
                })
            
            // console.log(event.nodes[0])
            // logs note id.  If click on canvas but not a circle logs undefined. if click on line stil undefined.
        })
    }
}