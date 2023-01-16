class Auth {
  coonstructor() {
    const auth = localStorage.getItem("auth");
    this.validateAuth(auth ?? "");
  }

  validateAuth(auth: string) {
    if (!auth) {
      window.location.replace("/");
    } else {
    }
  }

  logOut() {
    localStorage.removeItem("auth");
    window.location.replace("/");
  }
}

export default Auth;
