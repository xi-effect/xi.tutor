enum AuthQueryKey {
  Signin = 'Signin',
}

const authApiConfig = {
  [AuthQueryKey.Signin]: {
    getUrl: () => '/api/examples',
    method: 'post',
  },
};

export { authApiConfig };
