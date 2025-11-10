import SectionTitle from "./SectionTitle";
import teacher from "../assets/images/teacher.jpg";

const ShowcaseSection = () => {
  return (
    <section className="bg-white px-4 py-12 sm:py-16 md:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2">
        {/* Text Content */}
        <div className="relative">
          {/* Decorative Dot - Top Left */}
          <div className="absolute -top-1 -left-2 h-10 w-10 rounded-full bg-green-400 sm:h-10 sm:w-10 md:h-13 md:w-13" />

          <SectionTitle
            title="Everything you can do in a physical classroom,"
            highlight="you can do with TOTC"
            align="left"
            highlightColor="#00CBB8"
          />

          <p className="mb-6 text-sm leading-relaxed text-gray-500 sm:text-base">
            TOTC’s school management software helps traditional and online
            schools manage scheduling, attendance, payments and virtual
            classrooms all in one secure cloud-based system.
          </p>

          <a
            href="#"
            className="text-sm font-medium text-gray-500 underline hover:text-indigo-800 sm:text-base"
          >
            Learn more
          </a>

          {/* Decorative Dot - Bottom Right */}
          <div className="absolute right-0 -bottom-5 h-4 w-4 rounded-full bg-green-400 sm:h-6 sm:w-6 md:h-8 md:w-8" />
        </div>

        {/* Image Content */}
        <div className="relative">
          {/* Decorative Squares - Hide on small screens */}
          <div className="absolute -top-6 -left-6 z-0 hidden h-24 w-24 rounded-tl-[40px] bg-cyan-400 sm:block md:h-36 md:w-36" />
          <div className="absolute -right-6 -bottom-6 z-0 hidden h-24 w-24 rounded-br-[40px] bg-green-400 sm:block md:h-36 md:w-36" />

          {/* Image Container */}
          <div className="relative z-10 overflow-hidden rounded-2xl">
            <img
              src={teacher}
              alt="Classroom"
              className="aspect-video w-full rounded-2xl object-cover sm:aspect-[4/3]"
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-105 sm:h-16 sm:w-16">
                <svg
                  className="h-6 w-6 text-cyan-500 sm:h-8 sm:w-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.5 5.5v9l7-4.5-7-4.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
