<template>
    <div>
        <md-dialog :md-active.sync="open" :md-click-outside-to-close="false" :md-fullscreen="false">
            <md-dialog-title>Insérer une image</md-dialog-title>

            <md-dialog-content d>
                <md-tabs md-dynamic-height>
                    <md-tab md-label="importer" import>
                        <img src="https://ssl.gstatic.com/docs/picker/images/upload_background.png" alt="illustration nuages">
                        <md-field>
                            <label>Image</label>
                            <md-file v-model="imageFile" accept="image/*" id="img-input" @change="hasChanged"/>
                        </md-field>
                    </md-tab>

                    <md-tab md-label="à partir d'une url">
                        <md-field>
                            <label>Lien vers l'image</label>
                            <md-input v-model="fromUrl"></md-input>
                        </md-field>
                        <small>Assurez-vous d'avoir les droits nécéssaires pour utiliser cette image.</small>
                        <md-button @click="getBlob(fromUrl)" :disabled="uploading" class="md-raised md-primary">importer</md-button>
                    </md-tab>
                </md-tabs>

                <md-progress-bar v-if="uploading"
                    :md-mode="progressMode" :md-value="progressValue" :md-buffer="bufferValue"></md-progress-bar>
                <div v-if="error" e>
                    <span>{{ error }}</span>
                </div>
            </md-dialog-content>

            <md-dialog-actions>
                <md-button class="md-primary" @click="closeModal" :disabled="uploading">fermer</md-button>
            </md-dialog-actions>
        </md-dialog>

    </div>
</template>

<style lang="scss" scoped>
[d] {
    max-width: 480px;

    [import] {
        text-align: center;

        img {
            height: 120px;
        }
    }

    [e] {
        padding: 0 16px;

        span {
            color: #B00020;
        }
    }
}
</style>

<script>
import { v4 as uuidv4 } from 'uuid'
import imageCompression from 'browser-image-compression'

const {storage} = require('../../firebaseConfig.js')
const images = storage.ref('images')

export default {
    name: 'ImageUploader',
    props: [
        'callback',
        'open',
        'size'
    ],
    data() {
        return {
            error: null,
            fromUrl: null,
            imageFile: null,
            uploading: false,
            progressMode: 'query',
            progressValue: 0,
            bufferValue: 0
        }
    },
    methods: {
        closeModal() {
            this.$emit('update:open', false)
        },
        hasChanged() {
            let img = document.getElementById('img-input').files[0]
            this.publishImage(img)
        },
        setBufferPercentage(percentage) {
            this.bufferValue = percentage
        },
        async publishImage(blob) {
            const compressedImg = await this.compressImage(blob)
            this.uploadImage(compressedImg)
        },
        async getImageUrl(blob) {
            const compressedImg = await this.compressImage(blob)
            const imageUrl = await this.uploadImage(compressedImg, true)
            return imageUrl
        },
        async compressImage(img) {
            this.progressMode = 'buffer'
            this.uploading = true
            try {
                const compressedImg = await imageCompression(img, {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: this.size || 1920,
                    useWebWorker: true,
                    initialQuality: 0.5,
                    onProgress: this.setBufferPercentage
                })
                return compressedImg
            } catch(err) {
                this.uploading = false
                this.error = err
                return err
            }
        },
        getBlob(url) {
            this.progressMode = 'query'
            this.uploading = true
            fetch(url).then(res => {
                return res.blob();
            }).then(blob => {
                this.publishImage(blob)
            }).catch(err => {
                this.error = err
                this.uploading = false
            })
        },
        async uploadImage(blob, getUrl = false) {
            return new Promise((resolve, reject) => {
                this.progressMode = 'determinate'
                let ref = images.child(uuidv4())
                let uploadTask = ref.put(blob)

                // Listen for state changes, errors, and completion of the upload.
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        this.progressValue = (snapshot.bytesTransferred / snapshot.totalBytes)
                    }, 
                    (error) => {
                        this.error = error
                        this.uploading = false
                        reject()
                    }, 
                    async () => {
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL()
                        this.uploading = false
                        this.fromUrl = null
                        this.closeModal()
                        this.$root.$emit('toast', 'Image ajoutée')
                        if(!getUrl) {
                            this.callback(downloadURL)
                        }
                        resolve(downloadURL)
                    }
                )
            })
        },
    }
}
</script>