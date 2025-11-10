import SectionTitle from "./SectionTitle";
import InfoCard from "./InfoCard";
import student from "../assets//images/student.png";
import instructor from "../assets/images/instruction.png";
export default function WhatIsTOTC() {
  return (
    <section className="bg-white px-4 py-20 md:px-10">
      {/* العنوان */}
      <SectionTitle title="What is" highlight="TOTC?" />

      {/* الوصف */}
      <p className="mx-auto mb-10 max-w-3xl text-center leading-relaxed text-gray-500">
        TOTC is a platform that allows educators to create online classes
        whereby they can store the course materials online; manage assignments,
        quizzes and exams; monitor due dates; grade results and provide students
        with feedback all in one place.
      </p>

      {/* الكروت */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        <InfoCard
          promo
          title="FOR INSTRUCTORS"
          buttonText="Start a class today"
          image={instructor}
          overlayColor="bg-black/40"
          buttonBg="border border-white"
          buttonTextColor="text-white"
        />

        <InfoCard
          promo
          title="FOR STUDENTS"
          buttonText="Enter access code"
          image={student}
          overlayColor="bg-black/40"
          buttonBg="bg-[#49BBBD]"
          buttonTextColor="text-white"
        />
      </div>
    </section>
  );
}
