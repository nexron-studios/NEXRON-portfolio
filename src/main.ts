import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Archivo with both axes: the monument sets weight 900, body text 400-600.
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/silkscreen/700.css'
import '@/styles/main.css'
import App from '@/App.vue'
import router from '@/router'
import i18n from '@/i18n'
import { vReveal } from '@/directives/reveal'

createApp(App).use(createPinia()).use(router).use(i18n).directive('reveal', vReveal).mount('#app')
