let apiUrl = "http://localhost:80/upload"
const apiUrlData = document.getElementById('apiUrl').dataset.apiurl;
if(apiUrlData) apiUrl = apiUrlData
const maxFileSize = document.getElementById('maxFileSize').dataset.maxfilesize;

const CancelToken = axios.CancelToken;
let cancel;

let uploadReq;

// Create a Vue application
const app = Vue.createApp({
    data() {
        return {
            state: "UPLOAD_PANEL",
            progressPercent: 0,
            progressSeconds: 100,
            linkID: "",
        }
    },
    template: `
        <upload-panel v-if="state == 'UPLOAD_PANEL'" id="upload-panel" @updateProgressPercent="updateProgressPercent" @updateProgressSeconds="updateProgressSeconds" @updateState="updateState" @getLinkID="getLinkID"></upload-panel>
        <upload-progress v-if="state == 'UPLOAD_PROGRESS'" @cancelUploadEvent="cancelUpload" :progressPercent="progressPercent" :progressSeconds="progressSeconds"></upload-progress>
        <upload-link v-if="state == 'UPLOAD_LINK'" :linkID="linkID"></upload-link>
    `,
    methods: {
        updateProgressPercent(progressPercent) {
            this.progressPercent = progressPercent;
        },
        updateProgressSeconds(progressSeconds) {
            this.progressSeconds = progressSeconds;
        },
        updateState(state) {
            this.state = state;
        },
        getLinkID(id) {
            this.linkID = id;
        },
        cancelUpload () {
            // Clear Input
            const input = document.getElementById('uploadFile')
            console.log(input)

            this.progressPercent = 0

            // Cancel Upload
            cancel()

            // Update State
            this.updateState('UPLOAD_PANEL')
        }
    }
})

app.component("upload-panel", {
    data() {
        return {
            maxFileSize: maxFileSize,
            error: "",
            uploadStarted: false,
            timeStarted: 0,
            timeSinceStartLastRound: 0,
            secondsLeft: 0
        }
    },
    template: `
    <div>
        <span v-if="error" class="error">{{error}}</span>
        <div id="upload-drop-zone" @dragenter.stopPropagation()="dragEnter($event)" @dragleave.stopPropagation()="dragLeave($event)" @click="openFileDialog($event)" @dragover.prevent="void 0" @drop="handleDrop($event)" @change="uploadFile($event)">
            <input type="file" name="uploadFile" id="uploadFile">
            <div class="text">
                <h1 class="text-white">Upload your file</h1>
                <p class="text-white">Drag your file here to upload it (max. {{ maxFileSize / 1000000 }}MB)</p>
            </div>
        </div>
    </div>
    `,
    methods: {
        dragEnter(e) {
            const element = e.currentTarget.parentElement;
            element.classList.add("dragging");
        },
        dragLeave(e) {
            const element = e.currentTarget.parentElement;
            element.classList.remove("dragging");
        },
        openFileDialog(e) {
            const input = document.getElementById("uploadFile");
            input.click();
        },
        handleDrop(e) {
            e.preventDefault();
            const input = document.getElementById("uploadFile")
            input.files = e.dataTransfer.files
            // Check if length is more than one and throw error

            this.uploadFile(e)
        },
        async uploadFile(e) {
            e.stopPropagation();
	        e.preventDefault();
            const formData = new FormData();
            const input = document.getElementById("uploadFile");

            if(input.files[0].size > maxFileSize) {
                this.error = `Datei ist zu groß. (max. ${maxFileSize/1000000}MB)`
                return
            }
        
            formData.append("uploadFile", input.files[0]);

            const config = {
                cancelToken: new CancelToken(function executor(c) {
                    cancel = c
                }),
                onUploadProgress: (progressEvent) => {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)

                    if(this.uploadStarted == false) {
                        this.uploadStarted = true;
                        this.timeStarted = progressEvent.timeStamp;
                    }

                    const secondsSinceStart = (progressEvent.timeStamp - this.timeStarted) / 1000;
                    const secondsLeft = Math.round(secondsSinceStart * (100 / percentCompleted - 1 ));

                    if((secondsSinceStart - this.timeSinceStartLastRound) >= 0.9) {
                        this.timeSinceStartLastRound = secondsSinceStart;
                        this.secondsLeft = secondsLeft;
                    }
                        
                    this.updateProgressSeconds(this.secondsLeft);
                    this.updateProgressPercent(percentCompleted)
                }
            }

            this.updateState("UPLOAD_PROGRESS");

            axios.post(apiUrl, formData, config)
            .then(res => {
                const data = res.data;
                if(data.msg == "FILE_UPLOADED") {
                    this.emitLinkID(data.id);
                    this.updateState("UPLOAD_LINK");
                }
            })
            .catch(err => {
                // Show Error in UI
            })
        },
        updateProgressPercent(progressPercent) {
            this.$emit("updateProgressPercent", progressPercent);
        },
        updateProgressSeconds(progressSeconds) {
            this.$emit("updateProgressSeconds", progressSeconds);
        },
        updateState(state) {
            this.$emit("updateState", state);
        },
        emitLinkID(linkID) {
            this.$emit("getLinkID", linkID);
        }
    }
})

app.component("upload-progress", {
    props: {
        progressPercent: Number,
        progressSeconds: Number
    },
    data() {
        return {
            timeLeft: 0,
        }
    },
    template: `
    <div id="upload-progress">
        <div class="text">
            <h2>Uploading file</h2>
            <h4>{{progressPercent}}%</h4>
            <h4>{{progressSeconds}} Seconds left</h4>
        </div>
        <a @click="cancelUpload" class="cancel">Cancel</a>
        <div id="progress-bar" :style="'width:'+progressPercent+'%'"></div>
    </div>
    `,
    methods: {
        cancelUpload () {
            this.timeLeft = 100
            this.$emit('cancelUploadEvent', true)
        }
    }
})

app.component("upload-link", {
    props: {
        linkID: String,
    },
    data() {
        return {}
    },
    template: `
        <div style="display: flex; align-items: center; flex-wrap: wrap; justify-content: center;">
            <div id="upload-link" @click="getLink">
                <div class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>copy</title><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></g></svg>
                </div>
                <div class="link">
                    <p>ec.raphaelbernhart.at/{{linkID}}</p>
                </div>
            </div>
            <a href="https://ec.raphaelbernhart.at/{{linkID}}" target="_blank" id="upload-link-opener">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><title>external-link</title><g fill="#8D8D8D"><path d="M11 3a1 1 0 1 0 0 2h2.586l-6.293 6.293a1 1 0 1 0 1.414 1.414L15 6.414V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5z" fill="#8D8D8D"></path><path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5z" fill="#8D8D8D"></path></g></svg>
            </a>
            <a id="upload-link-reupload" href="https://ec.raphaelbernhart.at">Upload another file</a>
        </div>
    `,
    methods: {
        getLink() {
            this.copyToClipboard(`https://ec.raphaelbernhart.at/${this.linkID}`);
        },
        copyToClipboard(val){
            const dummy = document.createElement("input");
            dummy.style.hidden = 'true';
            document.body.appendChild(dummy);

            dummy.setAttribute("id", "dummy_id");
            document.getElementById("dummy_id").value = val;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
        }
    }
})

app.mount("#app")