import axios from "axios";
import { string, z, ZodError } from "zod";

class RegisterUser {
  form: Element;
  fields: string[];
  isLoading = false;
  userRegSchema = z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(25, "Name must not more than 25 characters long"),
    dob: z.preprocess((arg) => {
      if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    email: z.string().email(),
    username: z
      .string()
      .min(6, "Username must be at least 6 characters long")
      .max(20, "Username must not more than 20 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
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
      const name = document.querySelector("#name") as HTMLInputElement;
      const dob = document.querySelector("#dob") as HTMLInputElement;
      const email = document.querySelector("#email") as HTMLInputElement;
      const username = document.querySelector("#username") as HTMLInputElement;
      const password = document.querySelector("#password") as HTMLInputElement;

      const data = {
        name: name.value,
        dob: dob.value,
        email: email.value,
        username: username.value,
        password: password.value,
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
          url: "https://stoplight.io/mocks/pipeline/pipelinev2-projects/111233856/register/users",
          data,
        });
        self.isLoading = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Continue";
        window.location.replace("/pages/user-auth.html");
      } catch (error) {
        self.isLoading = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Continue";
        console.log({ Error: error });
      }
    });
  }

  /** Validate form field values */
  async validateFormValues(
    rawData: any
  ): Promise<{ success: boolean; errors: any }> {
    try {
      this.userRegSchema.parse(rawData);
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

const form = document.querySelector("#user_signup_container");

if (form) {
  const fields = ["name", "dob", "email", "username", "password"];
  const validator = new RegisterUser(form, fields);
}

if (module.hot) {
  module.hot.accept();
}
