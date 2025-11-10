import SectionTitle from "./SectionTitle";
import { PiSquaresFourFill } from "react-icons/pi";
import { IoIosPeople } from "react-icons/io";
import { BsBarChartSteps } from "react-icons/bs";

export default function HighlightsSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-10">
        {/* Top Section - Video UI + Features List */}
        <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
          {/* Video Call UI */}
          <div className="relative mx-auto w-full max-w-2xl lg:w-1/2">
            {/* The main container for the video interface */}
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-300 bg-white p-6 shadow-lg">
              {/* User Cards Section */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {/* User Card 1 */}
                <div className="relative aspect-[1/1] overflow-hidden rounded-2xl shadow-md">
                  <img
                    src="/src/assets/images/img1.png"
                    alt="Teacher"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-2 text-white">
                    <span className="text-sm font-semibold">Teacher</span>
                  </div>
                </div>

                {/* User Card 2 */}
                <div className="relative aspect-[1/1] overflow-hidden rounded-2xl shadow-md">
                  <img
                    src="/src/assets/images/img2.png"
                    alt="Student 1"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-2 text-white">
                    <span className="text-sm font-semibold">
                      Teresa Mendoza
                    </span>
                  </div>
                </div>

                {/* User Card 3 */}
                <div className="relative aspect-[1/1] overflow-hidden rounded-2xl shadow-md">
                  <img
                    src="/src/assets/images/img3.jpg"
                    alt="Student 2"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-2 text-white">
                    <span className="text-sm font-semibold">Adam Smith</span>
                  </div>
                </div>

                {/* User Card 4 (large) */}
                <div className="relative col-span-2 aspect-[2.5/2] overflow-hidden rounded-2xl shadow-md">
                  <img
                    src="/src/assets/images/img4.png"
                    alt="Student 3"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-2 text-white">
                    <span className="text-sm font-semibold">Martha Howard</span>
                  </div>
                </div>

                {/* User Card 5 */}
                <div className="relative aspect-[2/3.5] overflow-hidden rounded-2xl shadow-md">
                  <img
                    src="/src/assets/images/img5.png"
                    alt="Student 4"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-2 text-white">
                    <span className="text-sm font-semibold">
                      Patricia Mendoza
                    </span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-center gap-4">
                <button className="flex items-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-600">
                  Present
                </button>
                <button className="flex items-center rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-pink-600">
                  Call
                </button>
              </div>
            </div>
          </div>

          {/* Features list */}
          <div className="flex-1 space-y-6 lg:w-1/2">
            <SectionTitle
              title="A user interface"
              highlight="designed"
              align="left"
              highlightColor="#00CBB8" // Old color
              size="text-4xl leading-tight md:text-5xl"
            />
            <p className="text-left text-2xl font-semibold text-gray-700">
              for the classroom
            </p>

            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <PiSquaresFourFill className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-base text-gray-700">
                    Teachers don’t get lost in the grid view and have a
                    dedicated Podium space.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <IoIosPeople className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-base text-gray-700">
                    TA’s and presenters can be moved to the front of the class.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <BsBarChartSteps className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-base text-gray-700">
                    Teachers can easily see all students and class data at one
                    time.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Tools */}
        <div className="mt-20 flex flex-col items-center gap-12 md:flex-row-reverse">
          {/* Text content */}
          <div className="flex-1">
            <SectionTitle
              title="Tools For Teachers"
              highlight="And Learners"
              align="left"
              highlightColor="#00CBB8" // Old color
              size="text-4xl leading-tight md:text-5xl"
            />
            <p className="mt-4 leading-relaxed text-gray-600">
              Class has a dynamic set of teaching tools built to be deployed and
              used during class. Teachers can handout assignments in real-time
              for students to complete and submit.
            </p>
          </div>

          {/* Image */}
          <div className="relative mx-auto w-full max-w-2xl md:w-1/2">
            {/* Box Under Left (Cyan) */}
            <div className="absolute -top-18 left-18 z-0 h-16 w-16 translate-y-1/2 rounded-tl-[40px] bg-cyan-400 sm:block md:h-24 md:w-24" />

            {/* Box Under Right (Green) */}
            <div className="absolute right-18 bottom-3 z-0 h-16 w-16 translate-y-1/2 rounded-br-[40px] bg-green-400 sm:block md:h-24 md:w-24" />

            <img
              src="/src/assets/images/p2.png"
              alt="Teacher holding books"
              className="relative z-10 mx-auto w-full max-w-sm rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
