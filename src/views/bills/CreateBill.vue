<template>
  <sui-container class="form-container">
    <sui-form :loading="form.loading">
      <sui-header size="large">New Bill</sui-header>

      <sui-form-field id="title">
        <label>Title</label>
        <input placeholder="Title" v-model="form.fields.title.value" />
      </sui-form-field>
      <sui-form-field id="description">
        <label>Description</label>
        <textarea placeholder="Description" v-model="form.fields.description.value" />
      </sui-form-field>
      <sui-form-field>
        <label>Number of Recipients</label>
        <sui-input
          type="number"
          min="0"
          v-model="recipients"
          @input="setupRecipients"
          @change="setupRecipients"
        />
      </sui-form-field>

      <template v-for="position in recipients">
        <sui-form-field :key="position" :id="`recipient-${position}`">
          <sui-header>Recepient #{{ position }}</sui-header>
          <sui-form-field>
            <label>Email</label>
            <sui-input
              type="email"
              placeholder="email"
              v-model="form.fields.recipients[position - 1].email"
            />
          </sui-form-field>
          <sui-form-field>
            <label>Amount</label>
            <sui-input
              type="number"
              min="0.00"
              placeholder="0.00"
              v-model="form.fields.recipients[position - 1].amount"
            />
          </sui-form-field>
        </sui-form-field>
      </template>
      <sui-button type="submit" @click.prevent="handleSubmit" :loading="form.loading">
        Submit
      </sui-button>

      <sui-message v-if="form.errored" negative>
        <sui-message-header>Error</sui-message-header>
        <sui-message-list>
          <sui-message-item v-if="formErrors.title">
            <a class="error-link" href="#title">{{ formErrors.title }}</a>
          </sui-message-item>
          <sui-message-item v-if="formErrors.description">
            <a class="error-link" href="#description">{{ formErrors.description }}</a>
          </sui-message-item>
          <sui-divider v-if="formErrors.title || formErrors.description" />
          <sui-message-item v-if="!formErrors.recipients.length">
            You must add at least one recipient
          </sui-message-item>
          <template v-if="formErrors.recipients.length && recipients">
            <template v-for="(errObject, position) in formErrors.recipients">
              <template v-for="(errorText, idx) in Object.values(errObject)">
                <sui-message-item :key="keygen(idx)">
                  <a
                    class="error-link"
                    :href="`#recipient-${position + 1}`"
                  >{{ errorText }} for Recipient {{ position + 1 }}</a>
                </sui-message-item>
              </template>
              <sui-divider
                :key="keygen(position)"
                v-if="
                  position !== formErrors.recipients.length - 1 &&
                    (formErrors.recipients[position].email ||
                      formErrors.recipients[position].amount)
                "
              />
            </template>
          </template>
        </sui-message-list>
      </sui-message>

      <sui-message v-if="state.bills.error" negative>
        <sui-message-header>Error</sui-message-header>
        <sui-message-list>
          <sui-message-item v-for="(error, idx) in getCreationErrors()" :key="idx">
            {{ error }}
          </sui-message-item>
        </sui-message-list>
      </sui-message>

      <sui-message
        v-if="state.bills.created"
        icon="circle notched loading"
        header="Success"
        content="Created bill successfully."
        positive
      />
    </sui-form>
  </sui-container>
</template>

<script>
import api from '@/requests/bills';
import { validator, keygen } from '@/helpers';

export default {
  name: 'createBill',
  props: {
    auth: Boolean,
    state: Object,
    storeActions: Object,
  },
  beforeDestroy() {
    this.storeActions.bills.resetCreateState();
  },
  data() {
    return {
      recipients: 0,
      form: {
        errored: false,
        loading: false,
        fields: {
          title: { value: '', error: '' },
          description: { value: '', error: '' },
          recipients: [],
        },
      },
    };
  },
  methods: {
    keygen,
    setupRecipients(num) {
      const { recipients } = this.form.fields;
      const { length } = recipients;

      if (num > length) {
        const diff = num - length;
        const filler = Array(diff).fill({
          email: '',
          amount: '',
          errors: {},
        });
        recipients.push(...filler);
      } else if (length > num) {
        recipients.length = num;
      }
    },
    formHasErrors() {
      const { isEmail, notEmpty } = validator;
      const {
        fields,
        fields: { recipients },
      } = this.form;

      let errored = false;

      ['Title', 'Description'].forEach((field) => {
        if (!notEmpty(fields[field.toLowerCase()].value)) {
          fields[field.toLowerCase()].error = `${field} cannot be blank`;
        }
        if (fields[field.toLowerCase()].error) errored = true;
      });

      if (recipients.length) {
        recipients.forEach(({ email, amount }, i) => {
          if (!email || !isEmail(email)) {
            recipients[i].errors.email = 'Please provide a valid email';
          }

          if (typeof amount !== 'number') {
            recipients[i].errors.amount = 'Please provide a valid amount';
          }
        });

        if (recipients.some(({ errors }) => errors.email || errors.amount)) {
          errored = true;
        }
      } else errored = true;

      return errored;
    },
    /* eslint-disable no-param-reassign */
    clearFieldErrors() {
      const { fields } = this.form;

      fields.title.error = '';
      fields.description.error = '';
      fields.recipients.forEach((recipient) => {
        recipient.errors = {};
      });
      this.form.errored = false;
    },
    createBill() {
      const { fields } = this.form;

      const payload = Object.keys(fields).reduce((result, field) => {
        if (['title', 'description'].includes(field)) {
          result[field] = fields[field].value;
          return result;
        }
        if (field === 'recipients') {
          result.recipients = fields.recipients.map(({ email, amount }) => ({
            email,
            amount,
          }));
          return result;
        }
        return result;
      }, {});

      payload.user_account_id = this.state.auth.user.user_account_id;

      api.createBill(payload);
    },
    handleSubmit() {
      this.form.loading = true;
      this.clearFieldErrors();

      if (this.formHasErrors()) {
        this.form.errored = true;
        this.form.loading = false;
      } else this.createBill();
    },
    getCreationErrors() {
      const errorObject = this.state.bills.error.message;
      const errorMessages = Object.entries(errorObject).reduce(
        (list, fieldPair) => {
          let [fieldName, fieldErrors] = fieldPair; // eslint-disable-line prefer-const

          if (fieldName.includes('recipient')) {
            fieldErrors = fieldErrors.map((message) => {
              const position = fieldName.substring(
                fieldName.indexOf('[') + 1,
                fieldName.indexOf(']'),
              );
              const insertionIndex = message.indexOf(' ');
              const messageParts = [
                message.substring(0, insertionIndex),
                message.substring(insertionIndex),
              ];

              return `${messageParts[0]} ${position} ${messageParts[1]}`;
            });
          }
          return [...list, ...fieldErrors];
        },
        [],
      );

      return errorMessages;
    },
  },
  computed: {
    formErrors() {
      const { fields } = this.form;

      return {
        title: fields.title.error,
        description: fields.description.error,
        recipients: fields.recipients.map(({ errors }) => errors),
      };
    },
  },
  /* eslint-disable object-shorthand */
  watch: {
    'state.bills.created'() {
      if (this.state.bills.created) {
        this.form.loading = false;

        setTimeout(() => {
          this.$router.push({ name: 'billList' });
        }, 1200);
      }
    },
    'state.bills.error'() {
      this.form.loading = false;
    },
  },
};
</script>

<style>
.ui.form-container {
  text-align: left;
  width: 600px;
  margin-top: 3rem;
  margin-bottom: 3rem;
}
.error-link,
.error-link:hover {
  color: inherit;
}
</style>
