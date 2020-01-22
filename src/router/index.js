import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import { store } from '@/store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/auth',
    name: 'auth',
    component: Home,
    props: { auth: true },
    beforeEnter: (to, from, next) => {
      setTimeout(
        () => (store.state.auth.loggedIn ? next('/bills/list') : next()),
        3,
      );
    },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/About'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
