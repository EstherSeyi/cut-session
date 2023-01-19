import axios from "axios";
import { z, ZodError } from "zod";

import FormHelpers from "./form-helpers";
class Login {
  formHelpers;
  form: Element;
  fields: string[];
  isLoading = false;
  loginSchema = z.object({
    username: z
      .string()
      .min(6, "Username must be at least 6 characters long")
      .max(20, "Username must not more than 20 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    accessType: z.enum(["MERCHANT", "USER"]),
  });

  constructor(form: Element, fields: string[], formHelpers: FormHelpers) {
    this.formHelpers = formHelpers;
    this.form = form;
    this.fields = fields;
    this.validateOnSubmit();
  }

  /**Run function on submit */
  validateOnSubmit() {
    let self = this;

    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();

      /** Getting username and password from the DOM */
      const username = document.querySelector("#username") as HTMLInputElement;
      const password = document.querySelector("#password") as HTMLInputElement;

      /** Login works for both merchant and user, deciding the user type*/
      const merchantLogin = document.querySelector("#merchantLogin");
      const userLogin = document.querySelector("#userLogin");
      const userType = merchantLogin ? "MERCHANT" : userLogin ? "USER" : null;

      if (!userType) return; // if it's neither the merchant or user login forms stop execution

      const data = {
        username: username.value,
        password: password.value,
        accessType: userType,
      };

      /**Validating data on submit */
      const validate = await this.formHelpers.validateFormValues(
        data,
        this.loginSchema
      );

      if (!validate.success) {
        const { fieldErrors } = validate.errors;
        self.fields.forEach((field) => {
          const input = document.querySelector(`#${field}`) as HTMLInputElement;
          if (fieldErrors[field]) {
            self.formHelpers.displayInputError(
              input,
              true,
              fieldErrors[field][0]
            );
          } else {
            self.formHelpers.displayInputError(input, false, null);
          }
        });

        return;
      }

      /**Getting the login button from the form */
      const loginBtn = document.querySelector(
        ".login-btn"
      ) as HTMLButtonElement;

      /**Net work request and activity to log user in */
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
        localStorage.setItem(
          "ids",
          JSON.stringify({
            merchantId: response?.data?.merchantId,
            userId: response?.data?.userId,
          })
        );
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
    });
  }
}

const form = document.querySelector(".loginForm");

if (form) {
  const fields = ["username", "password"];
  new Login(form, fields, new FormHelpers());
}

if (module.hot) {
  module.hot.accept();
}
