<template>
    <div>
        <md-dialog :md-active.sync="open" :md-click-outside-to-close="false" :md-fullscreen="false">
            <md-dialog-title>Mes informations</md-dialog-title>

            <md-dialog-content v-if="editedUser" c>
                <md-field>
                    <label>Nom d'utilisateur</label>
                    <md-input v-model="editedUser.displayName"></md-input>
                </md-field>
                
                <span>Photo de profil</span>
                <div @click="imageUploaderOpen = true" p>
                    <img :src="editedUser.photoURL">
                    <md-icon>edit</md-icon>
                </div>

                <router-link :to="{ name: 'articleListAuthor', params: { ref: 'userEdition', author: $root.user.uid } }"
                class="fm-button fm-button--outlined">Mes articles</router-link>
            </md-dialog-content>

            <md-dialog-actions>
                <md-button class="md-primary" @click="closeModal" :disabled="loading">Annuler</md-button>
                <md-button class="md-primary" @click="save"
                    :disabled="(editedUser.displayName == user.displayName && editedUser.photoURL == user.photoURL) || loading">Enregistrer</md-button>
            </md-dialog-actions>
        </md-dialog>

        <image-uploader :size="256" :callback="setPhoto" :open.sync="imageUploaderOpen"></image-uploader>
    </div>
</template>

<style lang="scss" scoped>
[c] {
    [p] {
        cursor: pointer;
        position: relative;
        width: 48px;
        height: 48px;
        background-color: #aaa;
        border-radius: 50%;

        img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
        }

        i {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
        }

        &:hover {
            img {
                filter: brightness(0.8);
            }

            i {
                display: block
            }
        }
    }
}
</style>

<script>
import {db} from '../../firebaseConfig'

export default {
    props: ['user', 'open'],
    components: {
        imageUploader: () => import('./ImageUploader')
    },
    data() {
        return {
            editedUser: {},
            imageUploaderOpen: false,
            loading: false
        }
    },
    methods: {
        closeModal() {
            this.$emit('update:open', false)
        },
        save() {
            this.loading = true
            this.user.updateProfile(this.editedUser)
            .then(() => {
                this.$root.$emit('toast', 'Informations mises à jour')
                this.closeModal()
                this.loading = false
            })
            .catch(err => {
                this.loading = false
                this.$root.$emit('alert', err)
            })
            db.collection('users').doc(this.user.uid).set(this.editedUser)
            .catch(e => {
                this.$root.$emit('alert', err)
            })
        },
        setPhoto(url) {
            this.editedUser.photoURL = url
        }
    },
    mounted() {
        this.editedUser = {
            displayName: this.user.displayName,
            photoURL: this.user.photoURL
        }
    }
}
</script>