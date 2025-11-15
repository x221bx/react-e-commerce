import SectionTitle from "./SectionTitle";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa"; // Icons for social media

export default function LastSection() {
  return (
    <>
      {/* Latest News and Resources Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          {/* Section Title */}
          <SectionTitle
            title="Lastest News and"
            highlight="Resources"
            align="center"
            size="text-2xl md:text-3xl"
            highlightColor="#00CBB8"
          />
          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-600">
            See the developments that have occurred to TOTC in the world
          </p>

          {/* News Cards Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Main News Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
              <img
                src="/src/assets/images/labtop.png"
                alt="Zoom meeting on laptop"
                className="w-full object-cover"
              />
              <div className="p-6">
                <span className="absolute top-2 -left-15 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
                  NEWS
                </span>
                <h3 className="mt-4 text-xl font-bold text-gray-900">
                  Class adds $30 million to its balance sheet for a
                  Zoom-friendly edtech solution
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Class, launched less than a year ago by Blackboard co-founder
                  Michael Chasen, integrates exclusively...
                </p>
                <a
                  href="#"
                  className="mt-4 block text-sm font-semibold text-blue-600 hover:underline"
                >
                  Read more
                </a>
              </div>
            </div>

            {/* Side News Cards */}
            <div className="space-y-6">
              {/* Small News Card 1 */}
              <div className="flex rounded-2xl bg-white shadow-lg">
                <img
                  src="/src/assets/images/child.png"
                  alt="Student with tablet"
                  className="h-40 w-40 flex-shrink-0 rounded-l-2xl object-cover"
                />
                <div className="relative p-4">
                  <span className="absolute top-1 -left-28 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
                    PRESS RELEASE
                  </span>
                  <h4 className="mt-2 text-base font-bold text-gray-900">
                    Class Technologies Inc. Closes $30 Million Series A
                    Financing to Meet High Demand
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Class Technologies Inc., the company that created Class...
                  </p>
                </div>
              </div>

              {/* Small News Card 2 */}
              <div className="flex rounded-2xl bg-white shadow-lg">
                <img
                  src="/src/assets/images/emploee.png"
                  alt="Person on laptop with video call"
                  className="h-40 w-40 flex-shrink-0 rounded-l-2xl object-cover"
                />
                <div className="relative p-4">
                  <span className="absolute top-2 -left-15 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
                    NEWS
                  </span>
                  <h4 className="mt-2 text-base font-bold text-gray-900">
                    Zoom’s earliest investors are betting millions on a better
                    Zoom for schools
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Zoom was never created to be a consumer product.
                    Nonetheless, the...
                  </p>
                </div>
              </div>

              {/* Small News Card 3 */}
              <div className="flex rounded-2xl bg-white shadow-lg">
                <img
                  src="/src/assets/images/cat.png"
                  alt="Dog on video call"
                  className="h-40 w-40 flex-shrink-0 rounded-l-2xl object-cover"
                />
                <div className="relative p-4">
                  <span className="absolute top-2 -left-15 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
                    NEWS
                  </span>
                  <h4 className="mt-2 text-base font-bold text-gray-900">
                    Former Blackboard CEO Raises $16M to Bring LMS Features to
                    Zoom Classrooms
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    This year, investors have reaped big financial returns from
                    betting on Zoom...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
