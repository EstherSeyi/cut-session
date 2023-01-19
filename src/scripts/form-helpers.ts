import { ZodError } from "zod";

class FormHelpers {
  /** Validate form field values */
  async validateFormValues(
    rawData: any,
    schema: any
  ): Promise<{ success: boolean; errors: any }> {
    try {
      schema.parse(rawData);
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, errors: error.flatten() };
      }
      throw error;
    }

    return { success: true, errors: null };
  }

  /** Display Input Errors on form */
  displayInputError(
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

export default FormHelpers;
