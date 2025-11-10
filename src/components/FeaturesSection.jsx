// src/components/FeaturesSection.jsx
import FeatureCard from "./FeatureCard";
import IconBilling from "../assets/icon-billing.svg";
import IconCalendar from "../assets/icon-calendar.svg";
import IconGroup from "../assets/icon-group.svg";

const features = [
  {
    icon: IconBilling,
    title: "Online Billing, Invoicing, & Contracts",
    description:
      "Simple and secure control of your organization’s financial and legal transactions. Send customized invoices and contracts",
  },
  {
    icon: IconCalendar,
    title: "Easy Scheduling & Attendance Tracking",
    description:
      "Schedule and reserve classrooms at one campus or multiple campuses. Keep detailed records of student attendance",
  },
  {
    icon: IconGroup,
    title: "Customer Tracking",
    description:
      "Automate and track emails to individuals or groups. Skilline’s built-in system helps organize your organization",
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-gray-50 px-4 py-12 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
