<template>
  <div>
    <Banner
      :logged-in="authState.loggedIn"
      @toggle="toggleAuthModal"
      @redirect="$router.push('/bills/list')"
    />
    <Modal
      v-if="modalOpenedState"
      :open="modalOpenedState"
      :auth-state="authState"
      @toggle="toggleAuthModal"
    />
  </div>
</template>

<script>
import Banner from '@/components/home/Banner.vue';
import Modal from '@/components/home/Modal.vue';

export default {
  name: 'home',
  components: {
    Banner,
    Modal,
  },
  props: {
    auth: Boolean,
    state: Object,
  },
  data() {
    return {
      modalOpenedState: false,
      authState: this.state.auth,
    };
  },
  created() {
    this.modalOpenedState = !!this.auth;
  },
  methods: {
    toggleAuthModal() {
      this.modalOpenedState = !this.modalOpenedState;
    },
  },
};
</script>
