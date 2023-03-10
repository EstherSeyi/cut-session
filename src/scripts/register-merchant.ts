import axios from "axios";
import { string, z } from "zod";

import FormHelpers from "./form-helpers";

class RegisterMerchant {
  formHelpers;
  form: Element;
  fields: string[];
  isLoading = false;
  merchantRegSchema = z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(25, "Name must not more than 25 characters long"),
    email: z.string().email(),
    cityOfOperation: string()
      .min(1, "city of Ops is required!")
      .max(20, "City Of Ops must be at least 20 chars long"),
    username: z
      .string()
      .min(6, "Username must be at least 6 characters long")
      .max(20, "Username must not more than 20 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
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
      const name = document.querySelector("#name") as HTMLInputElement;
      const email = document.querySelector("#email") as HTMLInputElement;
      const cityOfOperation = document.querySelector(
        "#cityOfOperation"
      ) as HTMLInputElement;
      const username = document.querySelector("#username") as HTMLInputElement;
      const password = document.querySelector("#password") as HTMLInputElement;

      const data = {
        name: name.value,
        email: email.value,
        cityOfOperation: cityOfOperation.value,
        username: username.value,
        password: password.value,
      };

      /**Validating data on submit */
      const validate = await this.formHelpers.validateFormValues(
        data,
        this.merchantRegSchema
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
      const submitBtn = document.querySelector(
        "#submit-btn"
      ) as HTMLButtonElement;

      /**Net work request and activity to log user in */
      try {
        self.isLoading = true;
        submitBtn.disabled = true;
        submitBtn.textContent = "Loading...";

        await axios({
          method: "post",
          url: "https://stoplight.io/mocks/pipeline/pipelinev2-projects/111233856/register/merchants",
          data,
        });
        self.isLoading = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Continue";
        window.location.replace("/pages/merchant-auth.html");
      } catch (error) {
        self.isLoading = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Continue";
        console.log({ Error: error });
      }
    });
  }
}

const form = document.querySelector("#merchant_signup_container");

if (form) {
  const fields = ["name", "email", "cityOfOperation", "username", "password"];
  new RegisterMerchant(form, fields, new FormHelpers());
}

if (module.hot) {
  module.hot.accept();
}
