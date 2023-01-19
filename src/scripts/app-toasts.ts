import axios, { AxiosError } from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

class AppToasts {
  constructor() {
    // this.handleServerError();
  }
  handleServerError(error: any) {
    if (
      (error as AxiosError)?.response?.status === 400 ||
      (error as AxiosError)?.response?.status === 500
    ) {
      return this.showToast(
        `Error occured!: ${
          (
            error as {
              response: { data: { message: string; errors: string[] } };
            }
          ).response?.data?.message
        }`
      );
    }

    this.showToast(`Error occured!: ${(error as AxiosError).message}`);
  }

  showToast(text: string) {
    Toastify({
      text,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        background: "#ffffff",
        color: "#262422",
      },
    }).showToast();
  }
}

export default AppToasts;
