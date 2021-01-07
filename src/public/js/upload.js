let apiUrl = "http://localhost:80/upload"
const apiUrlData = document.getElementById('apiUrl').dataset.apiurl;
if(apiUrlData) apiUrl = apiUrlData
const maxFileSize = document.getElementById('maxFileSize').dataset.maxfilesize;

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
        <upload-progress v-if="state == 'UPLOAD_PROGRESS'" :progressPercent="progressPercent" :progressSeconds="progressSeconds"></upload-progress>
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
                <h1>Upload your file</h1>
                <p>Drag your file here to upload it (max. {{ maxFileSize / 1000000 }}MB)</p>
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
        <!-- <a class="cancel">Cancel</a> -->
        <div id="progress-bar" :style="'width:'+progressPercent+'%'"></div>
    </div>
    `,
    mounted() {
        // setInterval(() => {
        //     this.timeLeft =
        // }, 1000)
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
        <div id="upload-link" @click="getLink">
            <div class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>copy</title><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></g></svg>
            </div>
            <div class="link">
                <p>ec.raphaelbernhart.at/{{linkID}}</p>
            </div>
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