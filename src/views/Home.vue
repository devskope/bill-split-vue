<template>
  <div>
    <Banner :logged-in="authState.loggedIn" />
  </div>
</template>

<script>
import Banner from '@/components/home/Banner.vue';


export default {
  name: 'home',
  components: {
    Banner,
  },
  props: {
    state: Object,
  },
  data() {
    return {
      modalOpenedState: false,
      authState: this.state.auth,
    };
  },
};
</script>
