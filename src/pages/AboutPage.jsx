import React from "react";
import PublicLayout from "@/components/PublicLayout";

const AboutPage = () => {
  return (
    <PublicLayout>
      {/* Page content goes here */}
      <section className="px-6 pt-32 pb-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-5xl font-bold">About Complyo</h1>
          <p className="text-xl text-slate-300">
            This is a sample page using the PublicLayout component.
          </p>
          {/* Add your content here */}
        </div>
      </section>
    </PublicLayout>
  );
};

export default AboutPage;
