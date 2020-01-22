<template>
  <sui-modal size="small" v-model="opened">
    <sui-grid middle>
      <sui-grid-column>
        <sui-step-group
          v-if="form.mode === 'signup'"
          unstackable
          size="tiny"
          step-number="three"
          attached="top"
        >
          <sui-step
            v-for="(step, idx) in form.steps"
            :key="idx"
            :active="idx === form.currentStep"
            :title="step.title"
            icon="user"
          />
        </sui-step-group>

        <sui-container class="auth-form-container">
          <template v-if="form.mode === 'signup' && [0, 1].includes(form.currentStep)">
            <sui-form>
              <template v-for="(step, stepIndex) in form.steps">
                <template v-for="field in step.fields">
                  <sui-form-field v-if="form.currentStep === stepIndex" :key="field.text">
                    <label>{{ field.text }}</label>
                    <sui-input
                      v-model="form.fieldValues[field.name]"
                      :placeholder="field.text"
                      :type="field.type"
                      :error="validateField(field.name)"
                      :icon="
                        `${field.icon}
                           ${validateField(field.name) ? 'green' : 'red'}
                          `
                      "
                    />
                  </sui-form-field>
                </template>
              </template>
            </sui-form>
          </template>

          <template v-if="form.mode === 'login' && form.currentStep === 0">
            <sui-form>
              <sui-container text-align="center">
                <sui-header size="large">
                  <sui-image class="logo" alt="logo" :src="AppLogo" />Login
                </sui-header>
              </sui-container>
              <template v-for="field in ['email', 'password']">
                <sui-form-field :key="field">
                  <label>{{ capitalize(field) }}</label>
                  <sui-input
                    v-model="form.fieldValues[field]"
                    :placeholder="field"
                    :type="field === 'password' ? 'password' : 'email'"
                    :error="validateField(field)"
                    :icon="
                      `${field === 'password' ? 'lock' : 'user'}
                           ${validateField(field) ? 'green' : 'red'}
                          `
                    "
                  />
                </sui-form-field>
              </template>
            </sui-form>
          </template>

          <template v-if="form.currentStep === lastFormStep">
            <sui-form :loading="form.loading">
              <sui-table>
                <sui-table-body v-if="!form.errored">
                  <sui-table-row class="center aligned">
                    <sui-table-cell colspan="2">
                      <sui-header>Account Information</sui-header>
                    </sui-table-cell>
                  </sui-table-row>
                  <sui-table-row v-for="(value, fieldName) in formData.summary" :key="fieldName">
                    <sui-table-cell>{{ fieldName }}:</sui-table-cell>
                    <sui-table-cell>{{ value }}</sui-table-cell>
                  </sui-table-row>
                </sui-table-body>
                <sui-table-body v-else>
                  <sui-table-row class="center aligned">
                    <sui-table-cell colspan="2">
                      <sui-header color="red">Error</sui-header>
                    </sui-table-cell>
                  </sui-table-row>
                  <sui-table-row v-for="(value, fieldName) in form.errors" :key="fieldName">
                    <sui-table-cell>{{ fieldName }}:</sui-table-cell>
                    <sui-table-cell>{{ value[0] }}</sui-table-cell>
                  </sui-table-row>
                </sui-table-body>
              </sui-table>
            </sui-form>
          </template>
        </sui-container>
      </sui-grid-column>
    </sui-grid>
    <sui-modal-actions>
      <div>
        <template v-for="(altLink, idx) in form.altLinkParts">
          <span v-if="form.mode === altLink.mode" :key="idx" id="form-alt-link">
            {{ altLink.text }}
            <a @click.prevent="toggleFormMode">{{ capitalize(revAltModes[idx]) }}</a>
          </span>
        </template>
        <span>
          <sui-button
            size="mini"
            color="blue"
            icon="left arrow"
            label-position="left"
            inverted
            content="Previous"
            v-if="navState.prev.render()"
            @click="handleFormPrevClick"
            :disabled="navState.prev.disabled"
          />
          <sui-button
            size="mini"
            color="green"
            icon="right arrow"
            label-position="right"
            inverted
            @click="handleFormNextClick"
            :content="navState.next.content()"
            :loading="navState.next.loading"
            :disabled="navState.next.disabled"
          />
        </span>
        <sui-button
          size="mini"
          color="red"
          icon="close"
          label-position="right"
          inverted
          content="Close"
          @click="toggleOpenedState"
          :disabled="navState.close.disabled"
        />
      </div>
    </sui-modal-actions>
  </sui-modal>
</template>

<script>
import modal from './modal';
import { capitalize, stripAttribute, validator } from '@/helpers';
import api from '@/requests/bills';
import AppLogo from '@/assets/bill.svg';

export default {
  name: 'AuthModal',
  props: {
    open: Boolean,
    authState: Object,
  },
  data() {
    return {
      AppLogo,
      opened: this.open,
      form: {
        fieldValues: {
          email: '',
          username: '',
          password: '',
          password2: '',
        },
        loading: false,
        errored: false,
        errors: null,
        mode: 'login',
        currentStep: 0,
        steps: modal.formSteps,
        altLinkParts: [
          { mode: 'login', text: 'New user?' },
          { mode: 'signup', text: 'Have an account?' },
        ],
      },
    };
  },
  methods: {
    capitalize,
    validateField(field) {
      const {
        validate, minLength, isEmail, passMatch, notEmpty,
      } = validator;
      const {
        email, username, password, password2,
      } = this.form.fieldValues;
      const fieldValidators = {
        email: validate(notEmpty(email), isEmail(email)),
        username: validate(minLength(username, 5)),
        password: validate(minLength(password, 8)),
        password2: validate(passMatch(password, password2)),
      };

      return fieldValidators[field];
    },
    handleFormPrevClick() {
      const { form } = this;

      if (form.errored) form.errored = false;
      form.currentStep -= 1;
    },
    handleFormNextClick() {
      const {
        form,
        form: { mode, currentStep },
        lastFormStep,
        authenticate,
      } = this;

      switch (mode) {
        case 'login':
          if (currentStep < 1) {
            form.currentStep += 1;
          } else authenticate(mode);
          break;
        case 'signup':
          if (form.currentStep !== lastFormStep) {
            form.currentStep += 1;
          } else authenticate(mode);
          break;
        default:
          break;
      }
    },
    authenticate(mode) {
      const {
        form: { fieldValues: payload },
        formData,
      } = this;
      const error = {};

      const processAuth = () => {
        if (formData.isValid) {
          this.form.loading = true;
          api.postUser({ mode, payload });
        } else {
          error.message = { validationError: ['Please verify your input'] };
        }
      };

      processAuth();

      if (error.message) {
        this.form.errored = true;
        this.form.errors = error.message;
        this.form.loading = false;
      }
    },
    toggleOpenedState() {
      this.$emit('toggle');
      this.form.currentStep = 0;
    },
    toggleFormMode() {
      const {
        form,
        form: {
          mode, loading, errored, errors,
        },
      } = this;

      if (loading) return;

      if (errored) form.errored = false;
      if (errors) form.errors = null;

      this.form.currentStep = 0;

      if (mode === 'login') form.mode = 'signup';
      else form.mode = 'login';
    },
  },
  watch: {
    authState: {
      handler() {
        if (this.authState.error) {
          this.form.errored = true;
          this.form.errors = this.authState.error.message;
          this.form.loading = false;
        }

        if (this.authState.loggedIn && this.authState.token) {
          this.form.loading = false;
          this.$router.push('/bills/list');
        }

        if (!this.authState.loggedIn && this.authState.signedUp) {
          Object.keys(this.form.fieldValues).forEach((field) => {
            if (field === 'email') return;
            this.form.fieldValues[field] = '';
          });

          this.form.currentStep = 0;
          this.form.loading = false;
          this.form.mode = 'login';
        }
      },
      deep: true,
    },
  },
  computed: {
    formData() {
      // eslint-disable-next-line no-unused-vars
      // eslint-disable-next-line prefer-const
      let { password2, ...summary } = stripAttribute(this.form.fieldValues, '');
      const validatedFieldValues = Object.keys(this.form.fieldValues).map(
        this.validateField,
      );

      const validLogin = validatedFieldValues[0] && validatedFieldValues[2];

      if (summary.password) summary.password = '**********';
      else delete summary.password;

      if (this.form.mode === 'login') summary = { email: summary.email, password: summary.password };

      return {
        summary,
        isValid:
          this.form.mode === 'signup'
            ? validator.validate(...validatedFieldValues)
            : validLogin,
      };
    },
    lastFormStep() {
      return this.form.mode === 'signup' ? this.form.steps.length - 1 : 1;
    },
    navState() {
      const {
        form: { mode, currentStep, loading },
        lastFormStep,
      } = this;

      const prev = {
        render() {
          return currentStep > 0;
        },
        disabled: loading,
      };

      const next = {
        loading,
        disabled: loading,
        content() {
          if (mode === 'signup') {
            return currentStep !== lastFormStep ? 'Next' : 'Create';
          }

          return currentStep !== lastFormStep ? 'Next' : 'Login';
        },
      };

      const close = {
        disabled: loading,
      };

      return { prev, next, close };
    },
    revAltModes() {
      return this.form.altLinkParts.reduceRight(
        (revModes, part) => [...revModes, part.mode],
        [],
      );
    },
  },
};
</script>

<style scoped>
.auth-form-container {
  width: 60%;
  margin: 1.5rem auto;
  min-height: 10rem;
}
.ui.table,
.ui.table * {
  border: 0px !important;
}
#form-alt-link {
  margin-right: 1rem;
  cursor: pointer;
}
</style>
