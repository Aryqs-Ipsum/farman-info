<template>
    <header class="fm-header fm-header--sticky">
        <!-- <section v-if="betaDisclaimer" class="fm-header__disclaimer">
            <span>Ce site est en cours de développement et peut contenir des bugs. Les fonctionnalités principales sont deja disponibles et des ajouts arriveront par la suite.</span>
            <md-button @click="closeDisclaimer" class="md-icon-button">
                <md-icon>close</md-icon>
            </md-button>
        </section> -->

        <section class="fm-header__top">
            <a class="fm-header__top-link fm-link fm-link--white" title="connexion" @click="login" v-if="!user" login>Connexion</a>
            <div a v-else>
                <a class="fm-header__top-link fm-link fm-link--white" @click="logoutModalOpen = true" logout>déconnexion |</a>
                <span class="fm-header__top-link fm-link fm-link--white" @click="userModalOpen = true">
                    {{ user.displayName || 'Ajouter un nom' }}
                    <md-tooltip md-direction="bottom">Editer mon profil</md-tooltip>
                </span>
                <img class="fm-header__top-avatar" :src="user.photoURL ? user.photoURL : 'https://i.stack.imgur.com/34AD2.jpg'" :title="'connecté en tant que : ' + user.displayName" alt="photo de profil" pp>
            </div>
            <a class="fm-header__top-link fm-link fm-link--white ml-4" v-if="!notificationsEnabled" @click="requestNotifications" n>| Activer les notifications <i class="material-icons">notification_add</i></a>
            <span v-if="offline" n>| mode hors ligne <i class="material-icons">airplanemode_active</i></span>
            <router-link class="fm-header__top-link fm-header__top-link--right fm-link fm-link--white" :to="{name: 'articleSubmit', params: {ref: 'draft_continue'}}" v-if="hasArticleDraft" r>
                <span>Terminer la rédaction de mon article <i rt class="material-icons">arrow_forward</i></span>
            </router-link>
            <router-link class="fm-header__top-link fm-header__top-link--right fm-link fm-link--white" :to="{name: 'articleSubmit', params: {ref: 'navbar'}}" r v-else>
                <span><i lt class="material-icons">edit</i> Proposer un article</span>
            </router-link>
        </section>

        <section class="fm-header__bottom">
            <button 
                class="fm-button fm-button--large fm-header__bottom-button"
                @click="login" v-if="!user">Connexion</button>
            <router-link 
                class="fm-button fm-button--large fm-header__bottom-button"
                :disabled="$route.name === 'articleSubmit'"
                @click="login" v-else 
                :to="{name: 'articleSubmit', params: {ref: 'cta'}}">Publier</router-link>
            <router-link class="fm-header__bottom-logo" :to="{name: 'LandingPage', params: {ref: 'header_logo'}}">
                <img :src="'/assets/logos/' + (gestion ? 'header_logo_admin.png' : 'header_logo.png')" alt="navbar logo">
            </router-link>
            <ul class="fm-header__bottom-categories">
                <li class="fm-header__bottom-categories-list">
                    <router-link class="fm-header__bottom-categories-list-link" :to="{name: 'LandingPage', params: {ref: 'navbar'}}">À la Une</router-link>
                </li>
                <li class="fm-header__bottom-categories-list">
                    <router-link class="fm-header__bottom-categories-list-link" :to="{name: 'articleList', params: {ref: 'navbar'}}">Dernières infos</router-link>
                </li>
                <li class=" fm-header__bottom-categories-list fm-dropdown--anchor" v-if="categories">
                    <a class="fm-header__bottom-categories-list-link" @click="dropdownOpen = !dropdownOpen">Par thème <md-icon>expand_more</md-icon></a>
                    <ul :class="'fm-dropdown ' + (dropdownOpen ? 'fm-dropdown--open' : '')">
                        <li class="fm-dropdown__item">
                            <router-link class="fm-dropdown__item-text" :to="{name: 'Magazines', params: {ref: 'navbar_dropdown'}}">Magazines</router-link>
                        </li>
                        <li class="fm-dropdown__item" v-for="(category, index) in categories" :key="index">
                            <router-link :to="{name: 'articleListCategory', params: {category: category.id, ref: 'navbar_dropdown'}}" class="fm-dropdown__item-text">{{ category.label }}</router-link>
                        </li>
                        <li class="fm-dropdown__item">
                            <span class="fm-dropdown__item-text" @click="dropdownOpen = false">Fermer</span>
                        </li>
                    </ul>
                </li>
                <md-button class="md-icon-button fm-header__bottom-categories-menu" @click="showSidepanel = true">
                    <md-icon>menu</md-icon>
                </md-button>
            </ul>
        </section>

        <md-drawer class="fm-header__drawer md-right" :md-active.sync="showSidepanel">
            <md-list dl>
                <router-link :to="{name: 'LandingPage', params: {ref: 'drawer'}}">
                    <md-list-item>
                        <md-icon>home</md-icon>
                        <span class="md-list-item-text">Accueil</span>
                    </md-list-item>
                </router-link>
                <router-link :to="{name: 'Magazines', params: {ref: 'drawer'}}">
                    <md-list-item>
                        <md-icon>luggage</md-icon>
                        <span class="md-list-item-text">Magazines</span>
                    </md-list-item>
                </router-link>
                <router-link :to="{name: 'articleList', params: {ref: 'drawer'}}">
                    <md-list-item>
                        <md-icon>new_releases</md-icon>
                        <span class="md-list-item-text">Dernières infos</span>
                    </md-list-item>
                </router-link>
                <details v-if="categories">
                    <summary>
                        <md-list-item>
                            <md-icon>expand_more</md-icon>
                            <span class="md-list-item-text">Par thèmes</span>
                        </md-list-item>
                    </summary>
                    <category-label 
                        v-for="(category, index) in categories" v-bind:key="index"
                        :category="category"
                        link-ref="drawer"
                        style="margin-left:56px">
                    </category-label>
                </details>
                <md-list-item v-if="!notificationsEnabled" @click="requestNotifications">
                    <md-icon>notification_add</md-icon>
                    <span class="md-list-item-text">Activer les notifications</span>
                </md-list-item>
                <md-list-item v-if="user" @click="userModalOpen = true">
                    <md-icon>account_circle</md-icon>
                    <span class="md-list-item-text">Mes informations</span>
                </md-list-item>
                <md-list-item v-if="user" @click="logoutModalOpen = true">
                    <md-icon>phonelink_erase</md-icon>
                    <span class="md-list-item-text">Se déconnecter</span>
                </md-list-item>
            </md-list>
        </md-drawer>

        <md-dialog-confirm
            :md-active.sync="logoutModalOpen"
            md-title="Se déconnecter ?"
            md-content="Vous n'aurez plus accès a certaines fonctionnalités de l'application, telles que l'ajout d'articles ou de commentaires."
            md-confirm-text="Déconnexion"
            md-cancel-text="Annuler"
            @md-confirm="logout" />

        <user-profile-modal v-if="user" :user="user" :open.sync="userModalOpen"></user-profile-modal>
    </header>
</template>

<style>
[pastille] .md-list-item-content {
    display: block;
}
</style>

<script>
const {firebase, db, analytics} = require('../firebaseConfig.js')
import { getCategories } from '../assets/js/firestore/getCategories'
import { notificationsMixin } from '../mixins/notifications'

export default {
    mixins: [notificationsMixin],
    props: [
        'transparent',
        'gestion'
    ],
    components: {
        CategoryLabel: () => import('./utils/CategoryLabel'),
        UserProfileModal: () => import('./utils/UserProfile')
    },
    data() {
        return {
            user: this.$root.user,
            hasArticleDraft: localStorage.getItem('submit:draft'),
            showSidepanel: false,
            categories: null,
            offline: !navigator.onLine,
            userModalOpen: false,
            logoutModalOpen: false,
            betaDisclaimer: true,
            dropdownOpen: false
        }
    },
    methods: {
        login() {
            localStorage.setItem('login-from-url', window.location.href)
            this.$router.push('/login')
        },
        logout() {
            firebase.auth().signOut().then(() => {
                this.$router.go()
                analytics.logEvent('logout')
            }).catch(err => {
                alert(err)
            })
        },
        closeDisclaimer() {
            this.betaDisclaimer = false
            localStorage.setItem('disclaimer:beta', + new Date())
        },
        fetchCategories() {
            this.categories = getCategories()
        }
    },
    mounted() {
        this.fetchCategories()
        const disclaimerTimestamp = JSON.parse(localStorage.getItem('disclaimer:beta'))
        // hide disclaimer for 1 day
        if(disclaimerTimestamp + 1e3 * 86400 > + new Date()) {
            this.betaDisclaimer = false
        }
    }
}
</script>