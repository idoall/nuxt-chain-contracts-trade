// Bootstrap.js
import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
 
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'
 
export default () => {
    // 使 BootstrapVue 在整个项目中可用
    Vue.use(BootstrapVue)
    // 可选安装 BootstrapVue 图标组件插件
    Vue.use(IconsPlugin)
}