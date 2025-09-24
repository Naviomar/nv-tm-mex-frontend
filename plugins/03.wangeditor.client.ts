import '@wangeditor/editor/dist/css/style.css'
import { i18nChangeLanguage } from '@wangeditor/editor'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

export default defineNuxtPlugin((app) => {

    app.vueApp.component('Editor', Editor)
    app.vueApp.component('Toolbar', Toolbar)

    i18nChangeLanguage('en')
})
