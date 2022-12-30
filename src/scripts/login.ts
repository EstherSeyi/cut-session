import axios from "axios";
import { z, ZodError } from "zod";
class Login {
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
      const validate = await self.validateFormValues(data);

      if (!validate.success) {
        const { fieldErrors } = validate.errors;
        self.fields.forEach((field) => {
          const input = document.querySelector(`#${field}`) as HTMLInputElement;
          if (fieldErrors[field]) {
            self.displayError(input, true, fieldErrors[field][0]);
          } else {
            self.displayError(input, false, null);
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

  /** Validate form field values */
  async validateFormValues(
    rawData: any
  ): Promise<{ success: boolean; errors: any }> {
    try {
      this.loginSchema.parse(rawData);
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, errors: error.flatten() };
      }
      throw error;
    }

    return { success: true, errors: null };
  }

  /** Display Errors on form */
  displayError(
    field: HTMLInputElement,
    errored: boolean,
    message: string | null
  ) {
    const errorMessage = field.parentElement?.querySelector(
      ".error-message"
    ) as Element;
    if (!errored) {
      if (errorMessage) {
        errorMessage.innerHTML = "";
      }
    }

    if (errored) {
      errorMessage.innerHTML = message ?? "";
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
