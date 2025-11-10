import "./statsSection.css";
const stats = [
  { value: "15K+", label: "Students" },
  { value: "75%", label: "Total success" },
  { value: "35", label: "Main questions" },
  { value: "26", label: "Chief experts" },
  { value: "16", label: "Years of experience" },
];

const StatsSection = () => {
  return (
    <section className="bg-white px-4 py-16 text-center md:px-8">
      {/* title  and describtion*/}
      <h2 className="mb-4 text-4xl font-extrabold text-gray-900 md:text-4xl">
        Our Success
      </h2>
      <p className="mx-auto mb-12 max-w-2xl text-sm text-gray-500 md:text-base">
        Ornare id fames interdum porttitor nulla turpis etiam. Diam vitae
        sollicitudin at nec nam et pharetra gravida. Adipiscing a quis ultrices
        eu ornare tristique vel nisl orci.
      </p>

      {/*statstics*/}
      <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 md:grid-cols-5">
        {stats.map((stat, index) => (
          <div key={index}>
            <p className="fontsStats">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-gray-700">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* the lastqout */}
      <div className="mt-16">
        <h3 className="text-xl font-bold md:text-3xl">
          <span className="text-gray-800">All-In-One </span>
          <span className="text-cyan-600">Cloud Software.</span>
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500 md:text-base">
          TOTC is one powerful online software suite that combines all the tools
          needed to run a successful school or office.
        </p>
      </div>
    </section>
  );
};

export default StatsSection;
