export const initialState = {
  auth: {
    loggedIn: false,
    signedUp: false,
    error: null,
    user: null,
    token: null,
  },
  bills: {
    created: false,
    error: null,
    list: [],
  },
};

export const store = {
  state: { ...initialState },
  auth: {
    signup() {
      store.state.auth.loggedIn = false;
      store.state.auth.signedUp = true;
      store.state.auth.token = null;
      store.state.auth.user = JSON.parse(
        localStorage.getItem('billsplit::user'),
      );
    },
    login() {
      const user = JSON.parse(localStorage.getItem('billsplit::user'));
      const { type, accessToken } = JSON.parse(
        localStorage.getItem('billsplit::token'),
      );

      store.state.auth.user = user;
      store.state.auth.token = `${type} ${accessToken}`;
      store.state.auth.loggedIn = true;
    },
    logout() {
      localStorage.removeItem('billsplit::state');
      localStorage.removeItem('billsplit::token');
      localStorage.removeItem('billsplit::user');

      store.state.auth.loggedIn = false;
      store.state = { ...initialState };
    },
    error: {
      set(err) {
        const {
          state: { auth },
        } = store;

        auth.error = err;
      },
      clear() {
        const {
          state: { auth },
        } = store;

        auth.error = null;
      },
    },
  },
  bills: {
    create() {
      store.state.bills.created = true;
    },
    resetCreateState() {
      this.error.clear();
      store.state.bills.created = false;
    },
    error: {
      set(err) {
        const {
          state: { bills },
        } = store;

        bills.error = err;
      },
      clear() {
        const {
          state: { bills },
        } = store;

        bills.error = null;
      },
    },
    fetched(list) {
      store.state.bills.list = list;
    },
  },
};
