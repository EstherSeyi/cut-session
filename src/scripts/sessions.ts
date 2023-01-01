import axios from "axios";
import { differenceInHours } from "date-fns";

class Sessions {
  constructor() {
    this.displaySessions();
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

  //   bookingId: "9a471128-954e-4e64-bde9-e8147015df89";
  //   bookingRef: "string";
  //   date: "2019-08-24";
  //   endsAt: "14:15:22Z";
  //   notes: "string";
  //   sessionId: "f6567dd8-e069-418e-8893-7d22fcf12459";
  //   startsAt: "14:15:22Z";
  //   title: "string";
  //   userId: "2c4a230c-5085-4924-a3e1-25fb4fc5965b";

  async displaySessions() {
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

        const x = differenceInHours(startDate, endDate);

        console.log({ x, startDate, endDate });

        /**nOT tICKED */
        //   <li class="flex justify-between border-b border-black_10 mt-4 pb-2">
        //     <div class="flex items-center">
        //       <div class="p-4 rounded-full border border-black_15 mr-4"></div>
        //       <div>
        //         <p class="font-bold">Photo sesh</p>
        //         <p>1h 30m</p>
        //       </div>
        //     </div>
        //     <div>Weeks day</div>
        //   </li>;

        const html = `<div class="flex items-center">
                <div class="p-2 rounded-full mr-4 bg-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="feather feather-check w-5 h-5"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <p class="font-bold">${session.title}</p>
                  <p class="text-sm">Ref: #${session.bookingRef}</p>
                </div>
              </div>
              <div>Weekend</div>
              `;
        listItem.innerHTML = html;

        sessionListContainer?.appendChild(listItem);
      });

      console.log({ sessions });
    } catch (error) {
      console.log(error);
    }
  }
}

new Sessions();
