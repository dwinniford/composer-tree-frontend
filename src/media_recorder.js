const recordButton = document.querySelector("#record")
const stopRecordButton = document.querySelector("#stopRecord")
const clipContainer = document.querySelector('.sound-clips');




// checks media support and gets permission
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');
    navigator.mediaDevices.getUserMedia (
       // constraints - only audio needed for this app
       {
          audio: true
       })
 
       // Success callback
       .then(function(stream) {
            const mediaRecorder = new MediaRecorder(stream)
            recordButton.addEventListener("click", function(event) {
                recordButton.disabled = true;
                stopRecordButton.disabled = false;
                mediaRecorder.start()
                console.log(mediaRecorder.state)
                console.log("recorder started")
                recordButton.classList.add('recording')
            })
            
            stopRecordButton.addEventListener("click", function(event) {
                stopRecordButton.disabled = true;
                recordButton.disabled = false;
                mediaRecorder.stop()
                console.log(mediaRecorder.state)
                console.log("recorder stopped")
                recordButton.classList.remove('recording')
            })

            let chunks = [];
            mediaRecorder.ondataavailable = function(e) {
                chunks.push(e.data);
            }

            mediaRecorder.onstop = function(e) {
                console.log("recorder stopped");
                recordButton.classList.add("hide")
                stopRecordButton.classList.add("hide")
                const audio = document.createElement('audio');
                const audioButtons = document.createElement('div')
                audioButtons.classList.add('audio-buttons')
                const deleteAudioButton = document.createElement('button');
                const saveAudioButton =  document.createElement('button');
                saveAudioButton.innerHTML = "Save"
                saveAudioButton.classList.add("blue-button")
                audio.setAttribute('controls', '');
                deleteAudioButton.innerHTML = "Delete Audio";
                deleteAudioButton.classList.add("blue-button")
              
                clipContainer.appendChild(audio);
                clipContainer.appendChild(audioButtons)
                audioButtons.appendChild(deleteAudioButton);
                audioButtons.appendChild(saveAudioButton);
              
                const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
                chunks = [];
                const audioURL = window.URL.createObjectURL(blob);
                audio.src = audioURL;
                const treeId = parseInt(editButton.dataset.treeId) 
                const noteId = parseInt(editButton.dataset.id) 

                function createFileFromBlob() {
                    const file = new File([blob], `audio${noteId}.ogg`, {type: 'audio/ogg'})
                    return file 
                }

                function saveFile(event) {
                    const file = createFileFromBlob()
                    const formData = new FormData()
                    // formData.append('id', noteId)
                    formData.append('note[audio_file]', blob)
                    // console.log(JSON.stringify({ note: {audio_file: file}}))
                    // JSON.stringify does not work with the file
                    fetch(BACKEND_URL + `/trees/${treeId}/notes/${noteId}`, {
                        credentials: 'include',
                        method: "PATCH",
                        headers: {
                            'X-CSRF-Token': getCSRFToken()
                        },
                        body: formData
                    })
                        .then(resp => resp.json())
                        .then(function(json) {
                            console.log(json)
                            audioButtons.remove()
                            recordButton.disabled = true 
                            recordButton.classList.add("hide")
                            stopRecordButton.disabled = true 
                            stopRecordButton.classList.add("hide")
                            audio.src = BACKEND_URL + json.url
                        })
                }

                saveAudioButton.addEventListener("click", saveFile)
              
                deleteAudioButton.onclick = function(e) {
                  clipContainer.querySelector("audio").remove();
                  audioButtons.remove()
                  recordButton.classList.remove("hide")
                  stopRecordButton.classList.remove("hide")
                }
              }
         
       })
 
       // Error callback
       .catch(function(err) {
          console.log('The following getUserMedia error occured: ' + err);
       }
    );
 } else {
    console.log('getUserMedia not supported on your browser!');
 }

