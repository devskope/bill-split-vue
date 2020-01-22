export default {
  formSteps: [
    {
      title: 'User Information',
      icon: 'user',
      fields: [
        {
          name: 'email',
          type: 'email',
          text: 'Email Address',
          icon: 'at',
        },
        {
          name: 'username',
          type: 'text',
          text: 'Username',
          icon: 'user',
        },
      ],
    },
    {
      title: 'Account Security',
      icon: 'lock',
      fields: [
        {
          name: 'password',
          type: 'password',
          text: 'Password',
          icon: 'lock',
        },
        {
          name: 'password2',
          type: 'password',
          text: 'Confirm Password',
          icon: 'lock',
        },
      ],
    },
    {
      title: 'Create Account',
      icon: 'paper plane',
    },
  ],
};
