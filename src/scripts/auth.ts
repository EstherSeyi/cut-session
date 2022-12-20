class Auth {
  coonstructor() {
    const auth = localStorage.getItem("auth");
    this.validateAuth(auth ?? "");
    console.log("HELLO");
  }

  validateAuth(auth: string) {
    if (auth !== "1") {
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
