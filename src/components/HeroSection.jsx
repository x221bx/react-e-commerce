import ActionButton from "./ActionButton";
import InfoCard from "./InfoCard";
import p2 from "../assets/images/p2.png";
import p1 from "../assets/images/p1.jpg";
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#49bbbd] pt-15 text-white">
      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center justify-between px-4 md:flex-row">
        {/* ✅ LEFT SIDE */}
        <div className="w-full text-center md:w-1/2 md:text-left">
          <div className="mb-10 space-y-4">
            <h1 className="text-4xl leading-tight font-extrabold sm:text-3xl md:text-4xl">
              <span className="text-orange-400">Studying</span> Online is now{" "}
              <br />
              much easier
            </h1>
            <p className="text-sm text-white/90 sm:text-base">
              TOTC is an interesting platform that will teach{" "}
              <br className="hidden sm:inline" />
              you in a more interactive way
            </p>

            <div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row sm:justify-start">
              <ActionButton type="join" />
              <ActionButton type="video" />
            </div>
          </div>
        </div>

        {/* ✅ RIGHT SIDE */}
        <div className="relative mb-10 w-full max-w-sm sm:max-w-md md:mb-0 md:w-1/2 md:max-w-md lg:max-w-lg">
          {/* 👤 Student Image */}
          <div className="rotate-[2deg]">
            <img src={p2} alt="Student" className="relative z-10 h-150 w-200" />
          </div>

          {/* 🧾 CardStat */}
          <InfoCard
            type="stat"
            title="250k"
            subtitle="Assisted Student"
            className="absolute bottom-85 -left-25 z-20 hidden h-20 w-[245px] lg:block"
          />

          {/* 🔔 Notification */}
          <InfoCard
            type="notification"
            image={p1}
            title="User Experience Class"
            subtitle="Today at 12.00 PM"
            hasButton
            buttonText="Join Now"
            className="absolute bottom-25 left-0 z-20 hidden h-[123px] w-[220px] md:block"
          />

          {/* 🎉 Congratulations */}
          <InfoCard
            type="congratulations"
            title="Congratulations"
            subtitle="Your admission completed"
            className="absolute -right-10 bottom-75 z-20 hidden w-max sm:flex"
          />
        </div>
      </div>

      {/*  Wave Background */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#ffffff"
          d="M0,224 C180,320 480,280 720,250 C960,220 1260,220 1440,250 L1440,320 L0,320 Z"
        />
      </svg>
    </section>
  );
}
