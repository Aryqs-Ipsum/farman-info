<template>
    <div>
        <div root id="login-background">
            <app-header class="fm-header--transparent" transparent="true"></app-header>

            <main>
                <div id="login">
                    <div class="centered">
                        <h1>Connexion</h1>
                        <p>Connectez-vous à votre espace MyFarman pour commenter et poster des articles.</p>
                    </div>
                    <span class="loc">
                        <md-icon>place</md-icon>
                        Étretat, Seine-Maritime, France
                    </span>
                    <div id="firebaseui-auth-container"></div>
                </div>
            </main>
        </div>

        <app-footer></app-footer>
    </div>
</template>

<style>

</style>

<style lang="scss" scoped>
[root] {
    // background: url('https://i.imgur.com/4HZI65g.webp');
    background: url('https://i.imgur.com/4HZI65gm.webp');
    background-color: #91AFDE;
    background-size: cover !important;
    background-attachment: fixed !important;
    background-repeat-y: no-repeat !important;
    animation: background-down 1s ease-out;

    #login {
        padding: 16px;
        min-height: calc(100vh - 120px);
        display: grid;
        justify-content: center;
        position: relative;

        .centered {
            text-align: center;
            max-width: 380px;

            h1, p {
                color: #fff;
            }
        }

        .loc {
            position: fixed;
            bottom: 16px;
            left: 10vw;
            color: #fff;

            i {
                color: #fff;
            }
        }

        @media screen and(max-width: 600px) {
            .loc {
                display: none;
            }
        }

        #firebaseui-auth-container {
            padding: 8px 0;
        }
    }
}

@keyframes background-down {
    0% {
        background-position-y: 105px;
    }
    25% {
        background-position-y: 105px;
    }
    100% {
        background-position-y: 0;
    }
}
</style>

<style lang="scss">
.firebaseui-page-provider-sign-in {
    background: transparent;
}

p.firebaseui-tospp-full-message {
    color: #eee;

    a.firebaseui-link {
        color: #eee;
    }
}
</style>

<script>
    import {firebase, auth, analytics} from '../firebaseConfig.js';
    import * as firebaseui from '../assets/js/npm__fr';
    import "firebaseui/dist/firebaseui.css";
    
    const ui = new firebaseui.auth.AuthUI(auth);

    export default {
        name: 'login',
        data() {
            return {
                loginFromUrl: null,
                user: this.$root.user
            }
        },
        metaInfo: {
            title: 'Connexion à Farman'
        },
        components: {
            AppFooter: () => import('./Footer.vue'),
            AppHeader: () => import('./Navigation.vue')
        },
        mounted() {
            if(localStorage) {
                this.loginFromUrl = localStorage.getItem('login-from-url')
                let path = this.loginFromUrl.split('?')[0]
                this.loginFromUrl
                this.$root.$emit('toast', 'Vous serez redirigé vers ' + path)
            }
            if(this.user) {
                this.exitLoginPage()
            } else {
                var uiConfig = {
                    signInSuccessUrl: this.loginFromUrl,
                    signInFlow: 'popup',
                    signInOptions: [
                        {
                            // Google provider must be enabled in Firebase Console to support one-tap
                            // sign-up.
                            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                            // Required to enable ID token credentials for this provider.
                            // This can be obtained from the Credentials page of the Google APIs
                            // console. Use the same OAuth client ID used for the Google provider
                            // configured with GCIP or Firebase Auth.
                            clientId: '972782309534-8jujt6cg8uf0u11gv2smbkasee3k35cm.apps.googleusercontent.com',
                        },
                        {
                            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                            // Use email link authentication and do not require password.
                            // Note this setting affects new users only.
                            // For pre-existing users, they will still be prompted to provide their
                            // passwords on sign-in.
                            signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
                            // Allow the user the ability to complete sign-in cross device, including
                            // the mobile apps specified in the ActionCodeSettings object below.
                            forceSameDevice: false,
                        },
                        {
                            provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                            recaptchaParameters: {
                                type: 'image', // 'audio'
                                size: 'normal', // 'invisible' or 'compact'
                                badge: 'bottomleft' //' bottomright' or 'inline' applies to invisible.
                            },
                            defaultCountry: 'FR'
                        }
                    ],
                    credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
                    // Terms of service url.
                    tosUrl: 'https://farman.ga/s/cgu',
                    // Privacy policy url.
                    privacyPolicyUrl: 'https://farman.ga/s/cgu'
                }
                ui.start('#firebaseui-auth-container', uiConfig)
                // image loading
                let downloadingImage = new Image()
                let imageSrc = 'https://i.imgur.com/4HZI65g.webp'
                downloadingImage.onload = () => {
                    document.getElementById('login-background').style.background = `url('${imageSrc}')`  
                }
                downloadingImage.src = imageSrc
            }
        },
        methods: {
            exitLoginPage() {
                this.$router.push(this.loginFromUrl)
                analytics.logEvent('login', {
                    ref: window.ref
                })
            }
        }
    }
</script>