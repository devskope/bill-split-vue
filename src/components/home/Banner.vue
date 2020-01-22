<template>
  <sui-container class="banner">
    <ParticlesBg color="#f6f6fa" num="2" type="square" :bg="true" />
    <sui-container text>
      <sui-header class="lede-title">
        <sui-image class="logo" alt="logo" :src="AppLogo" />BillSplit
      </sui-header>
      <h2>
        <i>The best way to manage split payments.</i>
      </h2>
    </sui-container>

    <div class="cta-container">
      <sui-button color="green" size="huge" animated @click="handleButtonClick">
        <sui-button-content visible>{{
          loggedIn ? "My Bills" : "Get Started"
        }}</sui-button-content>
        <sui-button-content hidden>
          <sui-icon name="right arrow" />
        </sui-button-content>
      </sui-button>
    </div>
  </sui-container>
</template>

<script>
import { ParticlesBg } from 'particles-bg-vue';
import AppLogo from '@/assets/bill.svg';

export default {
  name: 'Banner',
  components: {
    ParticlesBg,
  },
  props: {
    loggedIn: Boolean,
  },
  data() {
    return {
      AppLogo,
    };
  },
  methods: {
    handleButtonClick() {
      if (this.loggedIn) this.$emit('redirect');
      else this.$emit('toggle');
    },
  },
};
</script>

<style scoped>
.ui.header.lede-title {
  margin-top: 1em;
  margin-bottom: 0em;
  font-size: 5rem;
  font-weight: bold;
}
.cta-container {
  margin-top: 1.5rem;
}
</style>
