import Layout from "@/components/Layout";
import { apiFetch } from "../lib/api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MapPin } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  shortDescription: string;
  pricePerPerson: number;
  currency: string;
  imageUrl?: string;
  images?: string[];
  duration: string;
  location: string;
  rating: number;
  reviews: number;
}

export default function Home() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/api/experiences");
        if (!response.ok) throw new Error("Failed to fetch experiences");
        const data = await response.json();
        setExperiences(data?.data ?? data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  return (
    <Layout>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-10">
          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Error loading experiences: {error}
            </div>
          )}

          {/* Experience Cards */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {experiences.map((experience) => (
                <Link
                  key={experience.id}
                  to={`/experiences/${experience.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 w-full max-w-[370px] mx-auto flex flex-col">
                    {/* Image Container */}
                    <div className="relative w-full overflow-hidden h-48 sm:h-56 lg:h-64">
                      <img
                        src={
                          experience.imageUrl ?? experience.images?.[0] ?? ""
                        }
                        alt={experience.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Below Container */}
                    <div className="flex flex-col justify-between flex-grow px-4 py-3">
                      {/* Title + Location */}
                      <div className="flex justify-between items-center">
                        <h3 className="text-[16px] font-semibold text-gray-800 truncate">
                          {experience.title}
                        </h3>
                        <span
                          className="bg-gray-100 px-2 py-0.5 rounded"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 500,
                            fontStyle: "normal",
                            fontSize: "11px",
                            lineHeight: "16px",
                            letterSpacing: "0%",
                            color: "#161616",
                          }}
                        >
                          {experience.location?.split(" ")[0]?.replace(",", "")}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mt-2 mb-2 line-clamp-2 font-size-12">
                        {experience.shortDescription}
                      </p>

                      {/* Price + Button */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <span className="text-sm text-gray-700">
                          From{" "}
                          <span className="font-semibold text-gray-900">
                            ₹{experience.pricePerPerson}
                          </span>
                        </span>
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1.5 rounded-md font-medium text-xs transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
