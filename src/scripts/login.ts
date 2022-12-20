import axios from "axios";
import * as yup from "yup";
class Login {
  form: Element;
  fields: string[];
  isLoading = false;
  schema = {
    username: yup.string().min(6).max(20).required(),
    password: yup.string().min(6).required(),
    accessType: yup.mixed().oneOf(["MERCHANT", "USER"]).required(),
  };
  constructor(form: Element, fields: string[]) {
    this.form = form;
    this.fields = fields;
    this.validateOnSubmit();
  }

  /**Run function on submit */
  validateOnSubmit() {
    let self = this;

    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let error = 0;
      self.fields.forEach((field) => {
        const input = document.querySelector(`#${field}`) as HTMLInputElement;
        if (self.validateFields(input) === false) {
          error++;
        }
      });

      if (error === 0) {
        const username = document.querySelector(
          "#username"
        ) as HTMLInputElement;
        const password = document.querySelector(
          "#password"
        ) as HTMLInputElement;

        const merchantLogin = document.querySelector("#merchantLogin");
        const userLogin = document.querySelector("#userLogin");

        const userType = merchantLogin ? "MERCHANT" : userLogin ? "USER" : null;

        if (!userType) return;
        const data = {
          username: username.value,
          password: password.value,
          accessType: userType,
        };

        const loginBtn = document.querySelector(
          ".login-btn"
        ) as HTMLButtonElement;

        try {
          self.isLoading = true;
          loginBtn.disabled = true;
          loginBtn.textContent = "Loading...";

          const response = await axios({
            method: "post",
            url: "https://stoplight.io/mocks/pipeline/pipelinev2-projects/111233856/sign-in",
            data,
          });

          localStorage.setItem("auth", response?.data?.token);
          self.isLoading = false;
          loginBtn.disabled = false;
          loginBtn.textContent = "Continue";
          if (userType === "USER") {
            window.location.replace("/pages/sessions.html");
          } else {
            window.location.replace("/pages/view-bookings.html");
          }
        } catch (error) {
          self.isLoading = false;
          loginBtn.disabled = false;
          loginBtn.textContent = "Continue";
          console.log({ Error: error });
        }
      }
    });
  }

  async validation(schema: any, data: any) {
    try {
      const res = await schema.isValid(data);
      console.log({ res });
      return res;
    } catch (error) {
      console.log(error.message, "ERROR HERE");
    }
  }
  // async validation(data: any) {
  //   try {
  //     const schema = yup.object().shape({
  //       username: yup.string().min(6).max(20).required(),
  //       password: yup.string().min(6).required(),
  //       accessType: yup.mixed().oneOf(["MERCHANT", "USER"]).required(),
  //     });

  //     const res = await schema.validate(data);
  //     console.log({ res });
  //   } catch (error) {
  //     console.log(error.message, "ERROR HERE");
  //   }
  // }

  /**Validates fields  */
  validateFields(field: HTMLInputElement) {
    if (field.value.trim() === "") {
      this.setStatus(
        field,
        `${field.previousElementSibling?.innerHTML} cannot be blank`,
        "error"
      );
      return false;
    } else {
      if (field.type === "password") {
        if (field.value.length < 6) {
          this.setStatus(
            field,
            `${field.previousElementSibling?.innerHTML} must be 6 characters`,
            "error"
          );
          return false;
        }
      }
      this.setStatus(field, null, "success");
    }
    return true;
  }

  /** Sets status and messages to display */
  setStatus(field: HTMLInputElement, message: string | null, status: string) {
    const errorMessage = field.parentElement?.querySelector(
      ".error-message"
    ) as Element;
    if (status === "success") {
      if (errorMessage) {
        errorMessage.innerHTML = "";
        field.classList.remove("input-error");
      }
    }

    if (status === "error") {
      errorMessage.innerHTML = message ?? "";

      // adding class styles for error
      field.classList.add("input-error");
    }
  }
}

const form = document.querySelector(".loginForm");

if (form) {
  const fields = ["username", "password"];
  const validator = new Login(form, fields);
}

if (module.hot) {
  module.hot.accept();
}
