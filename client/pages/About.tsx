import Layout from "@/components/Layout";

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">About BookIt</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          BookIt helps you discover and book curated travel experiences around the
          world. We partner with local guides and operators to bring unique,
          safe, and memorable activities to travelers.
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-3">Our mission</h2>
          <p className="text-muted-foreground">
            We believe travel should be accessible, responsible, and full of
            delightful surprises. BookIt focuses on quality experiences and
            straightforward booking so you can spend less time planning and more
            time exploring.
          </p>
        </section>
      </div>
    </Layout>
  );
}
