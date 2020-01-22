<template>
  <div id="app">
    <div is="sui-container" class="sticky">
      <sui-menu pointing large secondary>
        <router-link
          v-for="item in navItems"
          is="sui-menu-item"
          active-class="active"
          :key="item.label"
          :to="item.link"
          :exact="item.label === 'Home' ? true : false"
        >
          {{ item.label }}
        </router-link>
        <a
          is="sui-menu-item"
          v-if="state.auth.loggedIn"
          @click="logout"
          position="right"
        >
          Logout
        </a>
      </sui-menu>
    </div>
    <router-view :state="state" :storeActions="storeActions" />
  </div>
</template>

<script>
import { store } from './store';

export default {
  name: 'BillSplitApp',
  data() {
    return {
      navItems: [
        { label: 'Home', link: '/' },
        { label: 'About', link: '/about' },
      ],
      state: store.state,
      storeActions: {
        auth: store.auth,
        bills: store.bills,
      },
    };
  },
  methods: {
    logout() {
      this.storeActions.auth.logout();
      this.$router.push({ name: 'home' });
    },
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
