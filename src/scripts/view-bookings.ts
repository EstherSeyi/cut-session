import axios from "axios";
import { z, ZodError } from "zod";

import Auth from "./auth";
import AppToasts from "./app-toasts";
import FormHelpers from "./form-helpers";

class MerchantDashboard {
  formHelpers;
  auth;
  appToasts;
  isLoading = false;
  isSubmitting = false;
  fields = ["type", "startsAt", "endsAt"];
  sessionSchema = z.object({
    type: z.enum(["WeekDay", "WeekEnd"]),
    startsAt: z.string().min(8, "Please provide valid time"),
    endsAt: z.string().min(8, "Please provide valid time"),
  });
  constructor(
    auth: Auth | null,
    appToasts: AppToasts | null,
    formHelpers: FormHelpers
  ) {
    this.auth = auth;
    this.appToasts = appToasts;
    this.formHelpers = formHelpers;
    this.toggleBtwlistAndForm();
    this.displaySessions();
    this.handleSubmitSession();
    this.auth?.coonstructor();
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
      const validate = await self.formHelpers.validateFormValues(
        data,
        self.sessionSchema
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
        // const ids = JSON.parse(idsStringObject);
        // const merchantId = ids.merchantId;

        // temp dummy merchantId
        const merchantId = "54654766867675453";
        const response = await axios({
          method: "post",
          url: `https://stoplight.io/mocks/pipeline/pipelinev2-projects/111233856/studios/${merchantId}`,
          data,
        });

        submitBtn.disabled = false;
        this.isSubmitting = false;
        this.appToasts?.showToast(`Session Created!`);
        sessionForm.reset();
      }
    } catch (error) {
      this.isSubmitting = false;
      submitBtn.disabled = false;
      this.appToasts?.handleServerError(error);
    }
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

      const container = document.getElementById(
        "session-bookings-container"
      ) as Element;

      if (!sessionBookings?.length) {
        const bookingDetsContainer = document.getElementById(
          "booking-details-container"
        );
        bookingDetsContainer!.innerHTML = `<div class="fixed top-1/2 left-1/2 -mt-[50px] -ml-[50px]">
       No sessions booked yet!
        </div>`;
        return;
      }

      const [firstItem] = sessionBookings;
      this.displayDescription(firstItem);

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
        listItem.addEventListener("click", () => {
          this.displayDescription(sessionBooking);
        });
      });
    } catch (error) {
      this.appToasts?.handleServerError(error);
    }
  }

  displayDescription(sessionBooking: any) {
    const bookingDate = document.getElementById(
      "details_booking-date"
    ) as HTMLParagraphElement;
    const startsAtDetail = document.getElementById(
      "details_startsAt"
    ) as HTMLParagraphElement;
    const endsAtDetail = document.getElementById(
      "details_endsAt"
    ) as HTMLParagraphElement;
    const userTopicDetail = document.getElementById(
      "user-topic"
    ) as HTMLParagraphElement;
    const userNotesDetail = document.getElementById(
      "user-notes"
    ) as HTMLParagraphElement;
    bookingDate!.innerText = sessionBooking.date;
    startsAtDetail!.innerText = `Starts At: ${sessionBooking.startsAt}`;
    endsAtDetail!.innerText = `Ends At: ${sessionBooking.endsAt}`;
    userTopicDetail!.innerText =
      sessionBooking.title ?? `User Didn't provide notes`;
    userNotesDetail!.innerText = sessionBooking.notes ?? "N/A";
  }
}

const bookingsPage = document.querySelector("#bookings-page");

if (bookingsPage) {
  new MerchantDashboard(new Auth(), new AppToasts(), new FormHelpers());
}
