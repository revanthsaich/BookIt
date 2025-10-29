import Layout from "@/components/Layout";
import { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is a simple local form — no backend integration in this change.
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-muted-foreground mb-6">
          Have a question or need help? Send us a message and we'll get back to
          you shortly.
        </p>

        {sent && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded">
            Thanks — your message was received.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
              placeholder="you@example.com"
              type="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 h-32"
              placeholder="How can we help?"
            />
          </div>

          <div>
            <button className="bg-primary text-white px-4 py-2 rounded" type="submit">
              Send message
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
