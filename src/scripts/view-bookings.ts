import axios, { AxiosError } from "axios";
import { z, ZodError } from "zod";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

class MerchantDashboard {
  isLoading = false;
  isSubmitting = false;
  fields = ["type", "startsAt", "endsAt"];
  sessionSchema = z.object({
    type: z.enum(["WeekDay", "WeekEnd"]),
    startsAt: z.string().min(8, "Please provide valid time"),
    endsAt: z.string().min(8, "Please provide valid time"),
  });
  constructor() {
    this.toggleBtwlistAndForm();
    this.displaySessions();
    this.handleSubmitSession();
  }

  handleSubmitSession() {
    let self = this;
    const sessionForm = document.getElementById("create-session");
    sessionForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const sessionType = document.getElementById("type") as HTMLSelectElement;
      const endsAt = document.getElementById("endsAt") as HTMLInputElement;
      const startsAt = document.getElementById("startsAt") as HTMLInputElement;

      const data = {
        type: sessionType.value,
        endsAt: endsAt.value,
        startsAt: startsAt.value,
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

      document.querySelectorAll(".error-message").forEach((span: any) => {
        span.innerHTML = "";
      });

      await this.processNewSession(data);
    });
  }

  async processNewSession(data: {
    type: string;
    startsAt: string;
    endsAt: string;
  }) {
    const submitBtn = document.getElementById(
      "submit-session"
    ) as HTMLButtonElement;
    try {
      this.isSubmitting = true;
      submitBtn.disabled = true;
      const sessionForm = document.getElementById(
        "create-session"
      ) as HTMLFormElement;
      const idsStringObject = localStorage.getItem("ids");
      if (idsStringObject) {
        //   const ids = JSON.parse(idsStringObject);
        //   const merchantId = ids.merchantId;

        // temp dummy merchantId
        const dummyMerchantId = "54654766867675453";
        const response = await axios({
          method: "post",
          url: `https://stoplight.io/mocks/pipeline/pipelinev2-projects/111233856/studios/${dummyMerchantId}`,
          data,
        });

        submitBtn.disabled = false;
        this.isSubmitting = false;
        this.showToast(`Session Created!`);
        sessionForm.reset();
      }
    } catch (error) {
      this.isSubmitting = false;
      submitBtn.disabled = false;
      this.handleServerError(error);
    }
  }

  /** Validate form field values */
  async validateFormValues(
    rawData: any
  ): Promise<{ success: boolean; errors: any }> {
    try {
      this.sessionSchema.parse(rawData);
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, errors: error.flatten() };
      }
      throw error;
    }

    return { success: true, errors: null };
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

  toggleBtwlistAndForm() {
    const bookingsList = document.getElementById("bookings-list");
    const bookingsListLink = document.getElementById("bookings-list-link");
    const bookingItem = document.getElementById("booking-item");

    const newSession = document.getElementById("new-session");
    const newSessionLink = document.getElementById("new-session-link");
    const newSessionItem = document.getElementById("new-session-item");

    bookingsListLink?.addEventListener("click", () => {
      bookingsList?.classList.remove("hidden");
      bookingItem?.classList.add("bg-secondary", "text-white");
      newSession?.classList.add("hidden");
      newSessionItem?.classList.remove("bg-secondary", "text-white");
    });
    newSessionLink?.addEventListener("click", () => {
      newSession?.classList.remove("hidden");
      newSessionItem?.classList.add("bg-secondary", "text-white");
      bookingsList?.classList.add("hidden");
      bookingItem?.classList.remove("bg-secondary", "text-white");
    });
  }

  async getAllSessionBookings(): Promise<{
    data: any[] | null;
    success: boolean;
    error: any;
  }> {
    try {
      this.isLoading = true;
      const response = await axios.get(
        "https://stoplight.io/mocks/pipeline/pipelinev2-projects/111233856/bookings?limit=20&offset=1&city=lagos"
      );
      this.isLoading = false;
      return { data: response?.data?.data, success: true, error: null };
    } catch (error) {
      this.isLoading = false;
      return { data: null, success: false, error };
    }
  }

  async displaySessions() {
    const self = this;
    try {
      const { data: sessionBookings } = await self.getAllSessionBookings();

      const container = document.getElementById("session-bookings-container");

      sessionBookings?.forEach((sessionBooking) => {
        const listItem = document.createElement("li");
        listItem.classList.add(
          "flex",
          "items-center",
          "border",
          "border-black_10",
          "p-4",
          "rounded",
          "shadow-sm",
          "mb-4"
        );
        const startDate = new Date(sessionBooking.startsAt);
        const endDate = new Date(sessionBooking.endsAt);

        // const x = differenceInHours(startDate, endDate);

        const html = ` <div
                  class="p-8 border border-black_25 rounded-full bg-accent opacity-25 mr-2"
                ></div>
                <div>
                  <p class="font-bold">${sessionBooking.title}</p>
                  <p class="text-black_25 text-sm mb-2">${sessionBooking.date}</p>
                  <p>From ${sessionBooking.startsAt} to ${sessionBooking.endsAt} next week Saturday.</p>
                </div>`;
        listItem.classList.add("cursor-pointer");
        listItem.innerHTML = html;
        container?.appendChild(listItem);
        // listItem.addEventListener("click", () =>
        //   self.handleClick(listItem, session)
        // );
      });
    } catch (error) {
      this.handleServerError(error);
    }
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
}

const bookingsPage = document.querySelector("#bookings-page");

if (bookingsPage) {
  new MerchantDashboard();
}