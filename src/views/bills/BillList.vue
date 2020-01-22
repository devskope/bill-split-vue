<template lang="html">
  <sui-container>
    <sui-dimmer v-if="loading" active inverted>
      <sui-loader size="large" content="Loading..." />
    </sui-dimmer>
    <transition-group v-if="bills.length" tag="sui-list" name="list">
      <sui-list-item v-for="(bill, idx) in bills" :key="idx">
        <sui-grid celled>
          <sui-grid-row>
            <sui-grid-column :width="3" vertical-align="middle">
              <sui-image class="list-item__image" :src="AppLogo" size="small" />
            </sui-grid-column>
            <sui-grid-column class="list-item__description" :width="13">
              <sui-header size="medium" dividing>
                {{ bill.title }}
              </sui-header>
              <p>{{ bill.description }}</p>
              <sui-divider />
              <sui-grid :columns="3" divided>
                <sui-grid-row stretched class="center aligned">
                  <sui-grid-column>
                    <sui-label basic pointing>
                      <sui-icon name="users" />
                      {{ bill.bill_recipients.length }}
                    </sui-label>
                  </sui-grid-column>
                  <sui-grid-column>
                    <sui-label basic pointing>
                      <sui-icon name="calendar outline" />
                      {{ bill.created_at.substring(0,bill.created_at.indexOf(" ")) }}
                    </sui-label>
                  </sui-grid-column>
                  <sui-grid-column>
                    <a is="sui-label" basic pointing>
                      Pointing
                    </a>
                  </sui-grid-column>
                </sui-grid-row>
              </sui-grid>
            </sui-grid-column>
          </sui-grid-row>
        </sui-grid>
      </sui-list-item>
    </transition-group>

    <sui-header v-if="!loading && !bills.length" size="large">
      <sui-icon name="info" />
      You haven't added any bill yet
    </sui-header>
  </sui-container>
</template>

<script>
import AppLogo from '@/assets/bill.svg';
import api from '@/requests/bills';

export default {
  name: 'BillList',
  props: {
    state: Object,
  },
  created() {
    api.fetchBills();
  },
  data() {
    return {
      AppLogo,
      bills: [],
      loading: true,
    };
  },
  watch: {
    'state.bills.list'(val) { // eslint-disable-line object-shorthand
      this.bills = [...val].reverse();
    },
    bills() {
      this.loading = false;
    },
  },
};
</script>

<style scoped>
.ui.large.header {
  margin-top: 5rem;
}
.list-item__description {
  text-align: left;
}
.list-item__description p {
  margin-top: 1rem;
}
.list-item {
  display: inline-block;
  margin-right: 10px;
}
.list-enter-active,
.list-leave-active {
  transition: all 1.2s;
}
.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.ui.label:hover {
  cursor: pointer;
}
.add-button {
  position: fixed;
  right: 9%;
  bottom: 1rem;
}
</style>
