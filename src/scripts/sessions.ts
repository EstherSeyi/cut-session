import axios, { AxiosError } from "axios";
import { z, ZodError } from "zod";
// import { differenceInHours } from "date-fns";

import Auth from "./auth";
import AppToasts from "./app-toasts";

type SessionType = {
  bookingId: string;
  bookingRef: string;
  date: string;
  endsAt: string;
  notes: string;
  sessionId: string;
  startsAt: string;
  title: string;
  userId: string;
};

class Sessions {
  auth;
  appToasts;
  selectedSessions: SessionType[] = [];
  bookSessSchema = z.object({
    notes: z.string().max(500, "Notes must not be more than 500 characters"),
    title: z.string().max(75, 'title must not be more than 75 characters"),'),
  });
  constructor(auth: Auth, appToasts: AppToasts) {
    this.auth = auth;
    this.appToasts = appToasts;
    this.displaySessions();
    this.showBookNow();
    this.handleModal();
    this.auth.coonstructor();
  }

  showBookNow() {
    const bookNow = document.getElementById("book-now");
    if (this.selectedSessions.length) {
      bookNow?.classList.remove("hidden");
    } else {
      bookNow?.classList.add("hidden");
    }
  }

  async getAllSessions(): Promise<{
    data: any[] | null;
    success: boolean;
    error: any;
  }> {
    try {
      const response = await axios.get(
        "https://stoplight.io/mocks/pipeline/pipelinev2-projects/111233856/bookings?city=lagos&limit=20&offset=1"
      );
      return { data: response?.data?.data, success: true, error: null };
    } catch (error) {
      return { data: null, success: false, error };
    }
  }

  handleClick(itemElement: HTMLElement, session: SessionType) {
    const tickIcon = itemElement.parentElement?.querySelector("svg");
    const tickContainer =
      itemElement.parentElement?.querySelector("#tick-container");
    tickIcon?.classList.toggle("invisible");
    tickContainer?.classList.toggle("bg-accent");

    const bookingExist = this.selectedSessions.findIndex(
      (element) => element.bookingId === session.bookingId
    );

    if (bookingExist === -1) {
      this.selectedSessions.push(session);
    } else {
      this.selectedSessions.splice(bookingExist, 1);
    }
    this.showBookNow();
    this.handleSubmitSessionBooking(session);
  }

  async displaySessions() {
    const self = this;
    try {
      const { data: sessions } = await this.getAllSessions();
      const sessionListContainer = document.querySelector(
        "#session-list-container"
      );

      sessions?.forEach((session) => {
        const listItem = document.createElement("li");
        listItem.classList.add(
          "flex",
          "justify-between",
          "border-b",
          "border-black_10",
          "mt-4",
          "pb-2"
        );
        const startDate = new Date(session.startsAt);
        const endDate = new Date(session.endsAt);

        // const x = differenceInHours(startDate, endDate);

        // console.log({ x, startDate, endDate });
        const bookingExist = this.selectedSessions.findIndex(
          (element) => element.bookingId === session.bookingId
        );
        const html = `
            <div class="flex items-center">
              <div class="p-2 rounded-full border border-black_15 mr-4 ${
                bookingExist !== -1 ? "bg-accent" : ""
              }" id="tick-container">
                         <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="feather feather-check w-5 h-5 ${
                      bookingExist !== -1 ? "" : "invisible"
                    }"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
              </div>
              <div>
                <p class="font-bold">${session.title}</p>
                <p class="text-sm">Ref: #${session.bookingRef}</p>
              </div>
            </div>
            <div>Weeks day</div>
          `;
        listItem.classList.add("cursor-pointer");
        listItem.innerHTML = html;
        sessionListContainer?.appendChild(listItem);
        listItem.addEventListener("click", () =>
          self.handleClick(listItem, session)
        );
      });
    } catch (error) {
      console.log(error);
    }
  }

  openModal(backdrop: HTMLElement) {
    backdrop.classList.remove("hidden");
  }
  closeModal(backdrop: HTMLElement) {
    backdrop.classList.add("hidden");
  }

  handleModal() {
    const bookBtn = document.getElementById("book-btn");
    const backdrop = document.getElementById("booking-modal");
    const closeBtn = document.getElementById("close-modal-btn");

    bookBtn?.addEventListener("click", () => {
      this.openModal(backdrop!);
    });

    backdrop?.addEventListener("click", (event: any) => {
      if (event.target.id === "outer-bk-modal") {
        this.closeModal(backdrop!);
      }
    });
    closeBtn?.addEventListener("click", () => {
      this.closeModal(backdrop!);
    });
  }

  async processBooking(session: SessionType) {
    try {
      const notes = document.querySelector("#notes") as HTMLTextAreaElement;
      const title = document.querySelector("#title") as HTMLInputElement;
      const backdrop = document.getElementById("booking-modal");

      const data = {
        sessionId: session.sessionId,
        date: session.date,
        userId: session.userId,
        notes: notes?.value,
        title: title?.value,
      };

      const res = await axios({
        method: "post",
        url: "https://stoplight.io/mocks/pipeline/pipelinev2-projects/111233856/bookings",
        data,
      });

      this.closeModal(backdrop!);
      this.appToasts.showToast(
        `Session booked! Booking Ref: #${res?.data?.bookingRef}`
      );
    } catch (error) {
      this.appToasts.handleServerError(error);
    }
  }

  handleSubmitSessionBooking(session: SessionType) {
    const bookSessForm = document.getElementById("book-session-form");
    bookSessForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this.processBooking(session);
    });
  }
}

new Sessions(new Auth(), new AppToasts());
