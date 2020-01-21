import Axios from './axios';
import { buildPath } from '@/helpers';
import { store } from '@/store';

const networkError = 'A network error occured, verify your internet connection and try again';

const basePath = '/bills';

const authTokenHeader = {
  headers: { authorization: store.state.auth.token },
};

export default {
  async get({ path, options = {} }) {
    const response = { data: null, error: null };
    try {
      const {
        data: { message },
      } = await Axios.get(buildPath(basePath, path), options);
      response.data = message;

      return response;
    } catch ({ message, response: res }) {
      if (message === 'Network Error') {
        response.error = {
          message: {
            networkError,
          },
        };

        return response;
      }
      if (res?.data) {
        response.error = res.data;
      } else {
        response.error = {
          message: {
            error: networkError,
          },
        };
      }

      return response;
    }
  },
  async post({ path, payload, options = {} }) {
    const response = { data: null, error: null };
    try {
      const {
        data: { message },
      } = await Axios.post(buildPath(basePath, path), payload, options);
      response.data = message;

      return response;
    } catch ({ message, response: res }) {
      if (message === 'Network Error') {
        response.error = {
          message: {
            networkError,
          },
        };

        return response;
      }
      if (res?.data) {
        response.error = res.data;
      } else {
        response.error = {
          message: {
            error: networkError,
          },
        };
      }

      return response;
    }
  },

  async postUser({ mode, payload }) {
    const path = mode === 'login' ? '/login' : '/signup';

    store.auth.error.clear();

    const response = await this.post({ path, payload });

    if (response.data) {
      const { user, ...token } = response.data;

      const saveUserInfo = () => {
        localStorage.setItem(
          'billsplit::user',
          JSON.stringify({
            username: user.username,
            user_account_id: user.user_account_id,
          }),
        );
      };

      if (mode === 'login') {
        localStorage.setItem(
          'billsplit::token',
          JSON.stringify({
            type: token.token_type,
            expiresIn: token.expires_in,
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
          }),
        );

        saveUserInfo();
        store.auth.login();
      } else {
        saveUserInfo();
        store.auth.signup();
      }
    }

    if (response.error?.message) {
      store.auth.error.set(response.error);
    }
  },

  async createBill(payload) {
    const path = '/create';

    store.bills.error.clear();

    const response = await this.post({
      path,
      payload,
      options: authTokenHeader,
    });

    if (response.data) store.bills.create();

    if (response.error?.message) store.bills.error.set(response.error);
  },

  async fetchBills() {
    const accountId = store.state.auth.user.user_account_id;
    const path = `/list?user_account_id=${accountId}`;

    store.bills.error.clear();

    const response = await this.get({ path, options: authTokenHeader });

    if (response.data) store.bills.fetched(response.data);

    if (response.error?.message) store.bills.error.set(response.error);
  },
};
