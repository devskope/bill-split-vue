import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/home/Home.vue';
import { store } from '@/store';

Vue.use(VueRouter);
const { auth } = store.state;
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
      setTimeout(() => (auth.loggedIn ? next('/bills/list') : next()), 3);
    },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/About'),
  },
  {
    path: '/bills/list',
    name: 'billList',
    component: () => import(/* webpackChunkName: "billList" */ '../views/bills/BillList'),
    beforeEnter: (to, from, next) => {
      setTimeout(() => (auth.loggedIn ? next() : next('/auth')), 3);
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
