<template>
    <div>
        <div
        v-touch:start="startSwipe"
        v-touch:moving="swipe"
        v-touch:end="endSwipe"
        ref="swipableDialog"
        :class="'fm-bottom-sheat ' + (open ? 'fm-bottom-sheat--open' : '')">
            <div class="fm-bottom-sheat__pill">
                <div></div>
            </div>
            <div class="fm-bottom-sheat__body">
                <div class="fm-bottom-sheat__body-grid">
                    <a 
                    :href="'https://wa.me/?text=' + url"
                    @click="logEvent('whatsapp')"
                    target="_blank" rel="noreferrer noopener"
                    class="fm-bottom-sheat__body-grid-item">
                        <img src="/assets/icons/apps/com.whatsapp.webp" class="fm-bottom-sheat__body-grid-item-icon">
                        <span class="fm-bottom-sheat__body-grid-item-text">WhatsApp</span>
                    </a>
                    <a 
                    :href="'https://twitter.com/intent/tweet?text=' + url"
                    @click="logEvent('twitter')"
                    target="_blank" rel="noreferrer noopener"
                    class="fm-bottom-sheat__body-grid-item">
                        <img src="/assets/icons/apps/com.twitter.android.webp" class="fm-bottom-sheat__body-grid-item-icon">
                        <span class="fm-bottom-sheat__body-grid-item-text">Twitter</span>
                    </a>
                    <a 
                    :href="'https://www.facebook.com/sharer/sharer.php?s=100&p[url]=' + url"
                    @click="logEvent('facebook')"
                    target="_blank" rel="noreferrer noopener"
                    class="fm-bottom-sheat__body-grid-item">
                        <img src="/assets/icons/apps/com.facebook.katana.webp" class="fm-bottom-sheat__body-grid-item-icon">
                        <span class="fm-bottom-sheat__body-grid-item-text">Facebook</span>
                    </a>
                    <a 
                    :href="'https://t.me/share/url?url=' + url"
                    @click="logEvent('telegram')"
                    target="_blank" rel="noreferrer noopener"
                    class="fm-bottom-sheat__body-grid-item">
                        <img src="/assets/icons/apps/org.telegram.messenger.webp" class="fm-bottom-sheat__body-grid-item-icon">
                        <span class="fm-bottom-sheat__body-grid-item-text">Telegram</span>
                    </a>
                    <a 
                    @click="copyUrl()"
                    target="_blank" rel="noreferrer noopener"
                    class="fm-bottom-sheat__body-grid-item">
                        <i class="fm-bottom-sheat__body-grid-item-icon material-icons">content_copy</i>
                        <span class="fm-bottom-sheat__body-grid-item-text">Copier le lien</span>
                    </a>
                    <a 
                    v-if="webShareApiSupported"
                    @click="nativeShare()"
                    target="_blank" rel="noreferrer noopener"
                    class="fm-bottom-sheat__body-grid-item">
                        <i class="fm-bottom-sheat__body-grid-item-icon material-icons">{{ $device.ios ? 'ios_share' : 'share' }}</i>
                        <span class="fm-bottom-sheat__body-grid-item-text">Autres options</span>
                    </a>
                </div>
            </div>
        </div>
        <div class="fm-backdrop" @click="closeModal"></div>
    </div>
</template>

<script>
import {analytics} from '../../firebaseConfig'
import {bottomSheatMixin} from '../../mixins/bottomSheat'

export default {
    mixins: [bottomSheatMixin],
    props: ['url'],
    data() {
        return {
            shareData: {
                title: document.title,
                url: this.url,
            },
            canceled: true
        }
    },
    computed: {
        webShareApiSupported() {
            return navigator.share
        }
    },
    methods: {
        logEvent(provider) {
            this.canceled = false
            analytics.logEvent('article_shared', {
                canceled: this.canceled,
                provider: provider,
                display_mode: window.PWADisplayMode
            })
        },
        nativeShare() {
            try {
                navigator.share(this.shareData)
                this.logEvent('native_share')
            } catch(err) {
                alert(err)
            }
        },
        copyUrl() {
            const el = document.createElement('textarea')
            el.value = this.url
            el.setAttribute('readonly', '')
            el.style.position = 'absolute'
            el.style.left = '-9999px'
            document.body.appendChild(el)
            const selected =  document.getSelection().rangeCount > 0  ? document.getSelection().getRangeAt(0) : false;
            el.select()
            try {
                document.execCommand('copy')
                this.$root.$emit('toast', 'Lien copié dans le presse papier')
                this.logEvent('copy_link')
            } catch {
                this.$root.$emit('toast', 'Erreur lors de la copie du lien')
            }
            document.body.removeChild(el)
            if(selected) {
                document.getSelection().removeAllRanges()
                document.getSelection().addRange(selected)
            }
        },
    }
}
</script>