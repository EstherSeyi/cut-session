class Auth {
  coonstructor() {
    const auth = localStorage.getItem("auth");
    this.validateAuth(auth);
    this.logUserOut();
  }

  validateAuth(auth: string | null) {
    if (!auth) {
      window.location.replace("/");
    }
  }

  logOut() {
    localStorage.removeItem("auth");
    localStorage.removeItem("ids");
    window.location.replace("/");
  }

  logUserOut() {
    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn?.addEventListener("click", () => {
      this.logOut();
    });
  }
}

export default Auth;
